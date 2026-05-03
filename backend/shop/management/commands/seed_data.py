import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from shop.models import Product, Order, OrderItem, InventoryTransaction
from django.db import transaction
from django.utils import timezone
from django.db.models import F

User = get_user_model()

class Command(BaseCommand):
    help = 'Bazadagi noto\'g\'ri buyurtmalarni tozalash va yangi demo ma\'lumotlar qo\'shish'

    def handle(self, *args, **kwargs):
        self.stdout.write('Tekshirish va tozalash boshlandi...')
        
        with transaction.atomic():
            # 1. Faqat "o'zidan o'zi" sotib olingan buyurtmalarni o'chirish
            # Har bir OrderItem'ni tekshiramiz: agar xaridor mahsulot egasi bo'lsa
            self_orders_items = OrderItem.objects.filter(order__user=F('product__created_by'))
            self_order_ids = set(self_orders_items.values_list('order_id', flat=True))
            
            if self_order_ids:
                Order.objects.filter(id__in=self_order_ids).delete()
                self.stdout.write(self.style.SUCCESS(f"{len(self_order_ids)} ta noto'g'ri (o'zidan-o'zi) buyurtmalar o'chirildi."))
            else:
                self.stdout.write("Noto'g'ri buyurtmalar topilmadi.")

            # 2. Foydalanuvchilarni yaratish (mavjud bo'lsa tegilmaydi)
            admin_user = User.objects.filter(is_superuser=True).first()
            if not admin_user:
                admin_user = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')

            users_payload = [
                {'username': 'menejer1', 'role': 'MANAGER', 'phone': '+998901112233'},
                {'username': 'menejer2', 'role': 'MANAGER', 'phone': '+998904445566'},
                {'username': 'mijoz1',   'role': 'CUSTOMER', 'phone': '+998911110011'},
                {'username': 'mijoz2',   'role': 'CUSTOMER', 'phone': '+998912220022'},
                {'username': 'mijoz3',   'role': 'CUSTOMER', 'phone': '+998913330033'},
                {'username': 'mijoz4',   'role': 'CUSTOMER', 'phone': '+998914440044'},
            ]
            
            all_users = [admin_user]
            for u_data in users_payload:
                u, created = User.objects.get_or_create(
                    username=u_data['username'],
                    defaults={
                        'role': u_data['role'],
                        'phone_number': u_data['phone']
                    }
                )
                if created:
                    u.set_password('pass123')
                    u.save()
                all_users.append(u)

            # 3. Mahsulotlar (agar kam bo'lsa qo'shish)
            current_product_count = Product.objects.count()
            if current_product_count < 100:
                categories = {
                    "Elektronika": ["Samsung S23", "iPhone 15", "MacBook Air", "iPad Pro"],
                    "Kiyim-kechak": ["Kostyum", "Kurtka", "Krossovka", "Shim"],
                    "Uy-ro'zg'or": ["Choynak", "Gilam", "Dazmol", "Muzlatgich"],
                    "Oziq-ovqat": ["Guruch", "Yog'", "Choy", "Asal"]
                }
                sellers = [u for u in all_users if u.role in ['ADMIN', 'MANAGER']]
                
                to_create = 100 - current_product_count
                for i in range(to_create):
                    cat = random.choice(list(categories.keys()))
                    seller = random.choice(sellers)
                    Product.objects.create(
                        name=f"{random.choice(categories[cat])} (Yangi #{i})",
                        description=f"Sifatli mahsulot. Sotuvchi: {seller.username}",
                        price=random.randint(50000, 5000000),
                        stock=random.randint(10, 100),
                        created_by=seller
                    )
                self.stdout.write(self.style.SUCCESS(f"{to_create} ta yangi mahsulot qo'shildi."))

            # 4. Yangi to'g'ri buyurtmalar qo'shish
            all_products = list(Product.objects.all())
            for buyer in all_users:
                # Faqat boshqalarning mahsulotlarini olish
                valid_products = [p for p in all_products if p.created_by != buyer]
                if not valid_products: continue

                # Har bir userga yana 2 tadan yangi to'g'ri buyurtma
                for _ in range(2):
                    order = Order.objects.create(
                        user=buyer,
                        status='PENDING',
                        created_at=timezone.now()
                    )
                    prod = random.choice(valid_products)
                    qty = random.randint(1, 2)
                    OrderItem.objects.create(
                        order=order,
                        product=prod,
                        quantity=qty,
                        price=prod.price
                    )
                    order.total_price = prod.price * qty
                    order.save()

            self.stdout.write(self.style.SUCCESS('Logika muvaffaqiyatli yangilandi.'))
