import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Message
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # We will use the user's ID as the room group name
        # For JWT, a custom middleware is typically needed, 
        # but defaulting to standard Django Auth for simplicity here
        if not self.scope['user'].is_authenticated:
            await self.accept() # Accept to send Auth Error if needed, but simple fallback:
            # await self.close()
        
        # fallback using anonymous room for tests
        user_id = self.scope['user'].id if self.scope['user'].is_authenticated else "anon"
        self.room_name = f"user_{user_id}"
        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        receiver_id = text_data_json.get('receiver_id')

        if self.scope['user'].is_authenticated and receiver_id:
            # Save to database
            saved_msg = await self.save_message(self.scope['user'].id, receiver_id, message)
            
            # Send to receiver's group
            receiver_group = f"chat_user_{receiver_id}"
            await self.channel_layer.group_send(
                receiver_group,
                {
                    'type': 'chat_message',
                    'message': saved_msg.content,
                    'sender': self.scope['user'].username
                }
            )
        else:
            # Echo back if not auth'd or no receiver
            await self.send(text_data=json.dumps({
                'message': message,
                'sender': 'System (Unauthenticated)'
            }))

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']

        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender
        }))

    @sync_to_async
    def save_message(self, sender_id, receiver_id, content):
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)
        return Message.objects.create(sender=sender, receiver=receiver, content=content)
