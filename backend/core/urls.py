from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.views import RegisterView, UserViewSet
from shop.views import ProductViewSet, OrderViewSet, AnalyticsView
from chat.views import MessageViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders',   OrderViewSet,   basename='order')
router.register(r'chat',     MessageViewSet, basename='message')
router.register(r'users',    UserViewSet,    basename='user')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/register/', RegisterView.as_view(),        name='auth_register'),
    path('api/auth/login/',    TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/',  TokenRefreshView.as_view(),    name='token_refresh'),

    # Analytics
    path('api/analytics/', AnalyticsView.as_view(), name='analytics'),

    # App
    path('api/', include(router.urls)),
]
