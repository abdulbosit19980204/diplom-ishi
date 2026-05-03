from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Message
from .serializers import MessageSerializer

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
        serializer.save(sender=self.request.user)

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
                    'last_message': m.content,
                    'timestamp':  m.timestamp.isoformat(),
                    'unread':     Message.objects.filter(sender=other, receiver=user, is_read=False).count()
                }

        return Response(list(seen.values()))
