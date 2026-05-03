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
    serializer_class = ProductSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Product.objects.all().order_by('-created_at')
        
        if not user.is_authenticated:
            return queryset # Mehmonlar hamma narsani ko'ra oladi (Shop uchun)

        # 1. Superuser va Admin hamma narsani ko'radi
        if user.is_superuser or user.role == 'ADMIN':
            if self.request.query_params.get('my_products') == 'true':
                return queryset.filter(created_by=user)
            return queryset
            
        # 2. Manager va Customer faqat o'zinikini ko'radi (Management qismida)
        if self.request.query_params.get('my_products') == 'true':
            return queryset.filter(created_by=user)
            
        # 3. Shop qismida hamma narsani ko'radi
        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsManagerOrAdmin]
        return [permission() for permission in permission_classes]

    def perform_update(self, serializer):
        # Manager boshqalarning mahsulotini o'zgartira olmaydi
        instance = self.get_object()
        if not self.request.user.is_superuser and self.request.user.role == 'MANAGER':
            if instance.created_by != self.request.user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Siz faqat o'zingiz yaratgan mahsulotlarni tahrirlashingiz mumkin.")
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.is_superuser and self.request.user.role == 'MANAGER':
            if instance.created_by != self.request.user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Siz faqat o'zingiz yaratgan mahsulotlarni o'chirishingiz mumkin.")
        instance.delete()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'ADMIN':
            return Order.objects.all().order_by('-created_at')
        if user.role == 'MANAGER':
            # Menejer faqat o'zining mahsulotlari bor zakazlarni ko'radi
            return Order.objects.filter(items__product__created_by=user).distinct().order_by('-created_at')
        return Order.objects.filter(user=user).order_by('-created_at')

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsManagerOrAdmin]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class InventoryTransactionViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'ADMIN':
            return InventoryTransaction.objects.all().order_by('-created_at')
        return InventoryTransaction.objects.filter(product__created_by=user).order_by('-created_at')

    permission_classes = [IsManagerOrAdmin]
    
    def get_serializer_class(self):
        from .serializers import InventoryTransactionSerializer
        return InventoryTransactionSerializer

class AnalyticsView(APIView):
    permission_classes = [IsManagerOrAdmin]

    def get(self, request):
        user = request.user
        is_admin = user.is_superuser or user.role == 'ADMIN'
        from django.db.models import F, DecimalField
        
        # ─── Filter Logic ───
        if is_admin:
            base_orders = Order.objects.filter(status='DELIVERED')
            all_orders_count = Order.objects.count()
            products_qs = Product.objects.all()
            customers_count = User.objects.filter(role='CUSTOMER').count()
        else:
            # Menejer uchun: Faqat uning mahsulotlari bilan bog'liq ma'lumotlar
            base_orders = Order.objects.filter(items__product__created_by=user, status='DELIVERED').distinct()
            all_orders_count = Order.objects.filter(items__product__created_by=user).distinct().count()
            products_qs = Product.objects.filter(created_by=user)
            # Manager o'zining mijozlarini (unddan narsa sotib olganlarni) ko'radi
            customers_count = User.objects.filter(orders__items__product__created_by=user).distinct().count()

        # ─── Stats ───
        if is_admin:
            total_revenue = base_orders.aggregate(total=Sum('total_price'))['total'] or 0
        else:
            # Menejer uchun faqat o'z mahsulotlaridan tushgan summani hisoblash
            from .models import OrderItem
            total_revenue = OrderItem.objects.filter(product__created_by=user, order__status='DELIVERED').aggregate(
                total=Sum(F('price') * F('quantity'), output_field=DecimalField())
            )['total'] or 0

        low_stock_products = products_qs.filter(stock__lt=10).values('id', 'name', 'stock')
        
        status_counts = {}
        for s in ['PENDING', 'ACCEPTED', 'SHIPPED', 'DELIVERED']:
            if is_admin:
                status_counts[s] = Order.objects.filter(status=s).count()
            else:
                status_counts[s] = Order.objects.filter(items__product__created_by=user, status=s).distinct().count()

        # Monthly revenue (last 6 months)
        six_months_ago = datetime.now() - timedelta(days=180)
        if is_admin:
            monthly = (
                Order.objects
                .filter(created_at__gte=six_months_ago, status='DELIVERED')
                .annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(revenue=Sum('total_price'), count=Count('id'))
                .order_by('month')
            )
        else:
            from .models import OrderItem
            monthly = (
                OrderItem.objects
                .filter(product__created_by=user, order__status='DELIVERED', order__created_at__gte=six_months_ago)
                .annotate(month=TruncMonth('order__created_at'))
                .values('month')
                .annotate(revenue=Sum(F('price') * F('quantity'), output_field=DecimalField()), count=Count('order', distinct=True))
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

        from .models import OrderItem
        top_products = (
            OrderItem.objects.filter(product__in=products_qs)
            .values('product__name')
            .annotate(sold=Sum('quantity'))
            .order_by('-sold')[:5]
        )

        return Response({
            'stats': {
                'total_revenue': float(total_revenue),
                'total_orders': all_orders_count,
                'total_products': products_qs.count(),
                'total_customers': customers_count,
                'low_stock': low_stock_products.count(),
            },
            'low_stock_alerts': list(low_stock_products),
            'status_counts': status_counts,
            'monthly_data': monthly_data,
            'top_products': list(top_products),
        })
