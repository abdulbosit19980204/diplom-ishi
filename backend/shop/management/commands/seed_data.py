import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from shop.models import Product, Order, OrderItem, InventoryTransaction
from django.db import transaction
from django.utils import timezone
from django.db.models import F

User = get_user_model()

class Command(BaseCommand):
    help = 'Adminni ham xarid jarayoniga to\'liq qo\'shish va demo ma\'lumotlarni to\'g\'rilash'

    def handle(self, *args, **kwargs):
        self.stdout.write('Tekshirish va tozalash boshlandi...')
        
        with transaction.atomic():
            # 1. Noto'g'ri (o'zidan-o'zi) buyurtmalarni o'chirish
            self_orders_items = OrderItem.objects.filter(order__user=F('product__created_by'))
            self_order_ids = set(self_orders_items.values_list('order_id', flat=True))
            if self_order_ids:
                Order.objects.filter(id__in=self_order_ids).delete()
                self.stdout.write(self.style.SUCCESS(f"{len(self_order_ids)} ta noto'g'ri buyurtmalar o'chirildi."))

            # 2. Adminni tekshirish va rolini to'g'rilash
            admin_user = User.objects.filter(is_superuser=True).first()
            if not admin_user:
                admin_user = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
            
            # Adminning roli ADMIN ekanligiga ishonch hosil qilish (bu juda muhim!)
            admin_user.role = 'ADMIN'
            admin_user.save()

            # 3. Menejerlar va mijozlarni yaratish
            users_payload = [
                {'username': 'menejer1', 'role': 'MANAGER', 'phone': '+998901112233'},
                {'username': 'menejer2', 'role': 'MANAGER', 'phone': '+998904445566'},
                {'username': 'mijoz1',   'role': 'CUSTOMER', 'phone': '+998911110011'},
                {'username': 'mijoz2',   'role': 'CUSTOMER', 'phone': '+998912220022'},
                {'username': 'mijoz3',   'role': 'CUSTOMER', 'phone': '+998913330033'},
            ]
            
            all_users = [admin_user]
            for u_data in users_payload:
                u, created = User.objects.get_or_create(
                    username=u_data['username'],
                    defaults={'role': u_data['role'], 'phone_number': u_data['phone']}
                )
                if created:
                    u.set_password('pass123')
                    u.save()
                elif u.role != u_data['role']:
                    u.role = u_data['role']
                    u.save()
                all_users.append(u)

            # 4. Mahsulot egalarini to'g'ri taqsimlash (Admin ham sotuvchi)
            sellers = [u for u in all_users if u.role in ['ADMIN', 'MANAGER']]
            
            # Agar mahsulotlar 100 tadan kam bo'lsa, yetmaganini qo'shish
            current_count = Product.objects.count()
            if current_count < 100:
                to_create = 100 - current_count
                for i in range(to_create):
                    seller = random.choice(sellers)
                    Product.objects.create(
                        name=f"Demo Mahsulot #{created_count + i + 1000}",
                        description=f"Sotuvchi: {seller.username} tomonidan taqdim etilgan mahsulot.",
                        price=random.randint(50000, 2000000),
                        stock=random.randint(20, 50),
                        created_by=seller
                    )

            # 5. Buyurtmalar logikasi: Hammani jalb qilish (Adminni ham!)
            all_products = list(Product.objects.all())
            
            # Har bir user uchun 2 tadan yangi buyurtma yaratish
            for buyer in all_users:
                # Xaridor o'zinikidan boshqa hamma mahsulotni sotib olishi mumkin
                valid_prods = [p for p in all_products if p.created_by != buyer]
                
                if not valid_prods:
                    continue

                for _ in range(2):
                    order = Order.objects.create(
                        user=buyer,
                        status=random.choice(['PENDING', 'ACCEPTED', 'SHIPPED']),
                        created_at=timezone.now()
                    )
                    # 1-2 ta mahsulot
                    total_price = 0
                    for p in random.sample(valid_prods, k=random.randint(1, 2)):
                        qty = random.randint(1, 2)
                        OrderItem.objects.create(
                            order=order, product=p, quantity=qty, price=p.price
                        )
                        total_price += (p.price * qty)
                    
                    order.total_price = total_price
                    order.save()

            self.stdout.write(self.style.SUCCESS('Admin va barcha foydalanuvchilar o\'zaro savdo-sotiqqa muvaffaqiyatli jalb qilindi.'))
