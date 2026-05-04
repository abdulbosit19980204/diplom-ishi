from django.db import models
from django.conf import settings

class Message(models.Model):
    sender   = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_messages')
    order    = models.ForeignKey('shop.Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    content  = models.TextField(blank=True, null=True)
    file     = models.FileField(upload_to='chat_files/', null=True, blank=True)
    file_name= models.CharField(max_length=255, null=True, blank=True)
    timestamp= models.DateTimeField(auto_now_add=True)
    is_read  = models.BooleanField(default=False)

    @property
    def is_image(self):
        if not self.file: return False
        return any(self.file.name.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp'])

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"From {self.sender.username} at {self.timestamp:%H:%M}"
