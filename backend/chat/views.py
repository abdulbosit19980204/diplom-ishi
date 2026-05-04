from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Message
from .serializers import MessageSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

User = get_user_model()

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        other_id = self.request.query_params.get('user_id')
        
        # User is either sender or receiver
        qs = Message.objects.filter(Q(sender=user) | Q(receiver=user))
        
        if other_id:
            # Only messages between current user and this specific 'other_id'
            qs = qs.filter(
                Q(sender_id=other_id) | Q(receiver_id=other_id)
            )
        
        return qs.order_by('timestamp')

    def perform_create(self, serializer):
        file_obj = self.request.FILES.get('file')
        if file_obj:
            saved = serializer.save(sender=self.request.user, file_name=file_obj.name)
        else:
            saved = serializer.save(sender=self.request.user)

        # Broadcast to WebSocket
        channel_layer = get_channel_layer()
        payload = {
            "type": "chat_message",
            "id": saved.id,
            "message": saved.content,
            "sender": saved.sender.username,
            "sender_id": saved.sender.id,
            "file": saved.file.url if saved.file else None,
            "file_name": saved.file_name,
            "is_image": saved.is_image,
            "timestamp": saved.timestamp.isoformat(),
            "order_id": saved.order.id if saved.order else None,
        }

        # Send to receiver's room
        if saved.receiver:
            async_to_sync(channel_layer.group_send)(f"chat_user_{saved.receiver.id}", payload)
            # Notify badge
            async_to_sync(channel_layer.group_send)(
                f"user_{saved.receiver.id}", 
                {"type": "notify_update", "data": {"type": "new_message", "sender_id": saved.sender.id}}
            )
        
        # Send to sender's room as well (for multi-device sync and instant update)
        async_to_sync(channel_layer.group_send)(f"chat_user_{saved.sender.id}", payload)
        
        # Send to order room if exists
        if saved.order:
            async_to_sync(channel_layer.group_send)(f"chat_order_{saved.order.id}", payload)
        
        # If admin/manager, also send to admin room
        if saved.sender.role in ('ADMIN', 'MANAGER'):
            async_to_sync(channel_layer.group_send)("chat_admin", payload)

    @action(detail=False, methods=['get'], url_path='conversations')
    def conversations(self, request):
        """Return list of users the current user has chatted with + last message."""
        user = request.user
        msgs = Message.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).select_related('sender', 'receiver').order_by('-timestamp')

        seen = {}
        for m in msgs:
            other = m.receiver if m.sender == user else m.sender
            if other and other.id not in seen:
                seen[other.id] = {
                    'user_id':    other.id,
                    'username':   other.username,
                    'role':       getattr(other, 'role', 'CUSTOMER'),
                    'is_online':  other.is_online,
                    'last_seen':  other.last_seen.isoformat() if other.last_seen else None,
                    'last_message': m.content if m.content else (f"📎 {m.file_name}" if m.file_name else "[Fayl]"),
                    'timestamp':  m.timestamp.isoformat(),
                    'unread':     Message.objects.filter(sender=other, receiver=user, is_read=False).count()
                }

        return Response(list(seen.values()))

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        count = Message.objects.filter(receiver=request.user, is_read=False).count()
        return Response({'count': count})

    @action(detail=False, methods=['post'], url_path='mark-read')
    def mark_read(self, request):
        sender_id = request.data.get('user_id')
        if not sender_id:
            return Response({'error': 'user_id is required'}, status=400)
        
        Message.objects.filter(
            sender_id=sender_id, 
            receiver=request.user, 
            is_read=False
        ).update(is_read=True)
        
        return Response({'status': 'ok'})
