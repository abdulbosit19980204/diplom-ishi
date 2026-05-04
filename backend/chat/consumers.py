import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    """
    Room strategy:
      - Global admin room: chat_admin
      - Per-user room:     chat_user_{id}
      - Per-order room:    chat_order_{order_id}

    The frontend connects to /ws/chat/?token=<JWT>[&order_id=<id>]
    Messages are broadcast to the relevant rooms.
    """

    async def connect(self):
        user = self.scope.get("user")
        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.close(code=4001)
            return

        self.user = user
        query_string = self.scope.get("query_string", b"").decode()
        from urllib.parse import parse_qs
        qs = parse_qs(query_string)
        self.order_id = qs.get("order_id", [None])[0]

        # Join user's personal room
        self.personal_room = f"chat_user_{user.id}"
        await self.channel_layer.group_add(self.personal_room, self.channel_name)

        # If admin/manager also join admin room
        if hasattr(user, "role") and user.role in ("ADMIN", "MANAGER"):
            self.admin_room = "chat_admin"
            await self.channel_layer.group_add(self.admin_room, self.channel_name)
        else:
            self.admin_room = None

        # If order_id present join order room
        if self.order_id:
            self.order_room = f"chat_order_{self.order_id}"
            await self.channel_layer.group_add(self.order_room, self.channel_name)
        else:
            self.order_room = None

        await self.accept()
        
        # Update last_seen
        await self.update_user_status(True)

        # Send confirmation
        await self.send(text_data=json.dumps({
            "type": "connection_established",
            "user": user.username,
            "order_id": self.order_id,
        }))

    async def disconnect(self, close_code):
        for room in [
            getattr(self, "personal_room", None),
            getattr(self, "admin_room", None),
            getattr(self, "order_room", None),
        ]:
            if room:
                await self.channel_layer.group_discard(room, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type     = data.get("type", "chat_message")
        message_text = data.get("message", "").strip()
        receiver_id  = data.get("receiver_id")
        order_id     = data.get("order_id") or getattr(self, "order_id", None)

        if msg_type == "typing":
            if receiver_id:
                await self.channel_layer.group_send(
                    f"chat_user_{receiver_id}",
                    {"type": "typing", "sender_id": self.user.id}
                )
            return

        if not message_text:
            return

        await self.update_user_status(True)

        # Save to database
        saved = await self.save_message(
            sender_id=self.user.id,
            receiver_id=receiver_id,
            content=message_text,
            order_id=order_id,
        )

        payload = {
            "type": "chat_message",
            "id": saved.id,
            "message": saved.content,
            "sender": self.user.username,
            "sender_id": self.user.id,
            "timestamp": saved.timestamp.isoformat(),
            "order_id": order_id,
        }

        # Send to order room if order context
        if order_id:
            await self.channel_layer.group_send(f"chat_order_{order_id}", payload)

        # Send to receiver's personal room
        if receiver_id:
            await self.channel_layer.group_send(f"chat_user_{receiver_id}", payload)
            # Also notify via global notification system for badge updates
            await self.channel_layer.group_send(
                f"user_{receiver_id}", 
                {
                    "type": "notify_update",
                    "data": {"type": "new_message", "sender_id": self.user.id}
                }
            )
        
        # Send to sender's own room too (for multi-device sync)
        await self.channel_layer.group_send(f"chat_user_{self.user.id}", payload)

        # Also echo back to sender
        await self.send(text_data=json.dumps(payload))

    async def typing(self, event):
        if event.get("sender_id") == self.user.id:
            return
        await self.send(text_data=json.dumps({
            "type": "typing",
            "sender_id": event.get("sender_id"),
        }))

    async def chat_message(self, event):
        # Avoid double-receive for sender (sender already got echo)
        if event.get("sender_id") == self.user.id:
            return
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "id": event.get("id"),
            "message": event["message"],
            "sender": event["sender"],
            "sender_id": event.get("sender_id"),
            "file": event.get("file"),
            "file_name": event.get("file_name"),
            "is_image": event.get("is_image"),
            "timestamp": event.get("timestamp"),
            "order_id": event.get("order_id"),
        }))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, content, order_id=None):
        sender = User.objects.get(pk=sender_id)
        receiver = None
        if receiver_id:
            try:
                receiver = User.objects.get(pk=receiver_id)
            except User.DoesNotExist:
                pass

        # Lazy import to avoid circular
        from .models import Message
        return Message.objects.create(
            sender=sender,
            receiver=receiver,
            content=content,
            order_id=order_id if order_id else None,
        )

    @database_sync_to_async
    def update_user_status(self, is_online):
        if self.user and self.user.is_authenticated:
            self.user.last_seen = timezone.now()
            self.user.save(update_fields=['last_seen'])

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        if not user or user.is_anonymous:
            await self.close()
            return

        self.user_group = f"user_{user.id}"
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        
        if user.role in ['ADMIN', 'MANAGER']:
            await self.channel_layer.group_add("managers_group", self.channel_name)
            
        await self.accept()
        
    async def disconnect(self, close_code):
        user = self.scope.get("user")
        if user and not user.is_anonymous:
            await self.channel_layer.group_discard(self.user_group, self.channel_name)
            if user.role in ['ADMIN', 'MANAGER']:
                await self.channel_layer.group_discard("managers_group", self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if data.get('type') == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
        except:
            pass

    async def notify_update(self, event):
        await self.send(text_data=json.dumps(event["data"]))
