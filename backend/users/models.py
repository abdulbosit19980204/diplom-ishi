from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('MANAGER', 'Manager'),
        ('CUSTOMER', 'Customer'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CUSTOMER')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    last_seen = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    @property
    def is_online(self):
        # Consider online if seen in last 2 minutes
        from django.utils import timezone
        if not self.last_seen:
            return False
        return (timezone.now() - self.last_seen).total_seconds() < 120

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
