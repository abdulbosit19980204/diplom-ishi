from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import json

@receiver(post_save, sender=Order)
def order_status_changed(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()
    
    # Guruh nomi: foydalanuvchi IDsi bo'yicha
    # Mijoz uchun
    user_group = f"user_{instance.user.id}"
    
    message = {
        "type": "order_update",
        "order_id": instance.id,
        "status": instance.status,
        "created": created
    }
    
    async_to_sync(channel_layer.group_send)(
        user_group,
        {
            "type": "notify_update",
            "data": message
        }
    )
    
    # Menejerlar va Adminlar uchun umumiy guruh
    async_to_sync(channel_layer.group_send)(
        "managers_group",
        {
            "type": "notify_update",
            "data": message
        }
    )
