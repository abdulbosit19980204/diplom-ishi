from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.views import RegisterView, UserViewSet, ProfileView, ChangePasswordView
from shop.views import ProductViewSet, OrderViewSet, AnalyticsView, InventoryTransactionViewSet
from chat.views import MessageViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders',   OrderViewSet,   basename='order')
router.register(r'inventory-transactions', InventoryTransactionViewSet, basename='inventory-transaction')
router.register(r'chat',     MessageViewSet, basename='message')
router.register(r'users',    UserViewSet,    basename='user')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/register/', RegisterView.as_view(),        name='auth_register'),
    path('api/auth/login/',    TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/',  TokenRefreshView.as_view(),    name='token_refresh'),
    path('api/auth/profile/',  ProfileView.as_view(),         name='auth_profile'),
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='auth_change_password'),

    # Analytics
    path('api/analytics/', AnalyticsView.as_view(), name='analytics'),

    # App
    path('api/', include(router.urls)),
]
