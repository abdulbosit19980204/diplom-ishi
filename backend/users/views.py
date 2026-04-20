from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer
from users.permissions import IsAdmin

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserViewSet(viewsets.ModelViewSet):
    """Admin-only: full user management."""
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    @action(detail=True, methods=['patch'], url_path='set-role')
    def set_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get('role', '').upper()
        if role not in ('ADMIN', 'MANAGER', 'CUSTOMER'):
            return Response({'error': 'Noto\'g\'ri rol'}, status=400)
        user.role = role
        user.save(update_fields=['role'])
        return Response({'id': user.id, 'role': user.role})

    @action(detail=True, methods=['patch'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        return Response({'id': user.id, 'is_active': user.is_active})
