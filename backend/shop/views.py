from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model
from users.permissions import IsManagerOrAdmin

User = get_user_model()
from .models import Product, Order, InventoryTransaction
from .serializers import ProductSerializer, OrderSerializer, InventoryTransactionSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsManagerOrAdmin]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'MANAGER']:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=user).order_by('-created_at')

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsManagerOrAdmin]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class InventoryTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InventoryTransaction.objects.all().order_by('-created_at')
    permission_classes = [IsManagerOrAdmin]
    
    def get_serializer_class(self):
        from .serializers import InventoryTransactionSerializer
        return InventoryTransactionSerializer

class AnalyticsView(APIView):
    permission_classes = [IsManagerOrAdmin]

    def get(self, request):
        # Key Stats
        total_revenue = Order.objects.filter(status='DELIVERED').aggregate(
            total=Sum('total_price'))['total'] or 0
        total_orders = Order.objects.count()
        total_products = Product.objects.count()
        total_customers = User.objects.filter(role='CUSTOMER').count()
        
        low_stock_products = Product.objects.filter(stock__lt=10).values('id', 'name', 'stock')
        low_stock_count = low_stock_products.count()

        # Orders by status
        status_counts = {}
        for status in ['PENDING', 'ACCEPTED', 'SHIPPED', 'DELIVERED']:
            status_counts[status] = Order.objects.filter(status=status).count()

        # Monthly revenue (last 6 months)
        six_months_ago = datetime.now() - timedelta(days=180)
        monthly = (
            Order.objects
            .filter(created_at__gte=six_months_ago, status='DELIVERED')
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('total_price'), count=Count('id'))
            .order_by('month')
        )
        monthly_data = [
            {
                'month': m['month'].strftime('%Y-%m'),
                'revenue': float(m['revenue'] or 0),
                'count': m['count'],
            }
            for m in monthly
        ]

        # Top products by order items
        from .models import OrderItem
        top_products = (
            OrderItem.objects
            .values('product__name')
            .annotate(sold=Sum('quantity'))
            .order_by('-sold')[:5]
        )

        return Response({
            'stats': {
                'total_revenue': float(total_revenue),
                'total_orders': total_orders,
                'total_products': total_products,
                'total_customers': total_customers,
                'low_stock': low_stock_count,
            },
            'low_stock_alerts': list(low_stock_products),
            'status_counts': status_counts,
            'monthly_data': monthly_data,
            'top_products': list(top_products),
        })
