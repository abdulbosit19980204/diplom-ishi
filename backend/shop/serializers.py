from django.db import transaction
from rest_framework import serializers
from .models import Product, Order, OrderItem, InventoryTransaction

class ProductSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Product
        fields = ('id', 'name', 'description', 'price', 'stock', 'created_at', 'updated_at', 'created_by', 'created_by_name')
        read_only_fields = ('created_at', 'updated_at', 'created_by')

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'quantity', 'price')
        read_only_fields = ('price',)

class InventoryTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    created_by_name = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = InventoryTransaction
        fields = ('id', 'product', 'product_name', 'delta', 'transaction_type', 'order', 'created_at', 'created_by_name')
        read_only_fields = ('created_at', 'created_by_name')

    def create(self, validated_data):
        with transaction.atomic():
            product = validated_data['product']
            delta = validated_data['delta']
            
            # Update product stock
            product.stock += delta
            product.save()
            
            # Set created_by from context
            user = self.context['request'].user if 'request' in self.context else None
            return InventoryTransaction.objects.create(**validated_data, created_by=user)

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user_name = serializers.ReadOnlyField(source='user.username')
    seller_id = serializers.SerializerMethodField()
    seller_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ('id', 'user', 'user_name', 'seller_id', 'seller_name', 'status', 'total_price', 'items', 'created_at', 'updated_at')
        read_only_fields = ('user', 'total_price', 'created_at', 'updated_at')

    def get_seller_id(self, obj):
        first_item = obj.items.first()
        if first_item and first_item.product:
            return first_item.product.created_by_id
        return None

    def get_seller_name(self, obj):
        first_item = obj.items.first()
        if first_item and first_item.product and first_item.product.created_by:
            return first_item.product.created_by.username
        return "Sotuvchi"

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        
        with transaction.atomic():
            order = Order.objects.create(**validated_data)
            total = 0
            user = self.context['request'].user
            
            for item_data in items_data:
                product_id = item_data['product'].id
                quantity = item_data['quantity']
                
                # Lock the product record for update to prevent race conditions
                product = Product.objects.select_for_update().get(id=product_id)
                
                if product.stock < quantity:
                    raise serializers.ValidationError({
                        "items": f"'{product.name}' mahsulotidan yetarli miqdor yo'q (Mavjud: {product.stock})"
                    })
                
                price = product.price
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=price
                )
                
                # Record transaction
                InventoryTransaction.objects.create(
                    product=product,
                    delta=-quantity,
                    transaction_type='SALE',
                    order=order,
                    created_by=user
                )

                # Update stock
                product.stock -= quantity
                product.save()
                
                total += price * quantity
                
            order.total_price = total
            order.save()
            return order
