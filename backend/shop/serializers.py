from rest_framework import serializers
from .models import Product, Order, OrderItem

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'quantity', 'price')
        read_only_fields = ('price',)

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Order
        fields = ('id', 'user', 'user_name', 'status', 'total_price', 'items', 'created_at', 'updated_at')
        read_only_fields = ('user', 'total_price', 'created_at', 'updated_at')

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(**validated_data)
        total = 0
        
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            price = product.price
            
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=price
            )
            total += price * quantity
            
            # Simple stock reduction
            if product.stock >= quantity:
                product.stock -= quantity
                product.save()
            
        order.total_price = total
        order.save()
        return order
