from django.contrib import admin
from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display  = ('id', 'sender', 'receiver', 'order', 'is_read', 'timestamp')
    list_filter   = ('is_read',)
    search_fields = ('sender__username', 'receiver__username', 'content')
    readonly_fields = ('timestamp',)
    ordering      = ('-timestamp',)
    raw_id_fields = ('sender', 'receiver', 'order')
