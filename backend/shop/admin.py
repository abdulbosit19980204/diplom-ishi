from django.contrib import admin
from .models import Product, Order, OrderItem


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = ('id', 'name', 'price', 'stock', 'created_at')
    list_filter   = ('stock',)
    search_fields = ('name', 'description')
    list_editable = ('price', 'stock')
    ordering      = ('-created_at',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display  = ('id', 'user', 'status', 'total_price', 'created_at')
    list_filter   = ('status',)
    search_fields = ('user__username',)
    ordering      = ('-created_at',)
    readonly_fields = ('total_price', 'created_at', 'updated_at')


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display  = ('id', 'order', 'product', 'quantity', 'price')
    list_filter   = ('product',)
    raw_id_fields = ('order', 'product')
