from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender_name   = serializers.ReadOnlyField(source='sender.username')
    receiver_name = serializers.SerializerMethodField()

    def get_receiver_name(self, obj):
        return obj.receiver.username if obj.receiver else None

    class Meta:
        model  = Message
        fields = ('id', 'sender', 'sender_name', 'receiver', 'receiver_name',
                  'order', 'content', 'file', 'file_name', 'is_image', 'timestamp', 'is_read')
        read_only_fields = ('sender', 'timestamp', 'is_read')
