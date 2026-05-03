import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from shop.models import Product, Order, OrderItem
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with demo Uzbek data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Bazani to\'ldirish boshlandi...')

        # 1. Create Superuser if not exists
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True,
                'role': 'ADMIN',
                'phone_number': '+998901234567'
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Superuser yaratildi: admin / admin123'))
        else:
            self.stdout.write('Superuser allaqachon mavjud.')

        # 2. Create Manager and Customer Users
        roles = ['MANAGER', 'CUSTOMER', 'CUSTOMER', 'CUSTOMER', 'CUSTOMER']
        for i, role in enumerate(roles, 1):
            u, created = User.objects.get_or_create(
                username=f'user{i}',
                defaults={
                    'email': f'user{i}@example.com',
                    'role': role,
                    'phone_number': f'+99890000000{i}'
                }
            )
            if created:
                u.set_password('pass123')
                u.save()
        self.stdout.write(self.style.SUCCESS('5 ta qo\'shimcha foydalanuvchi yaratildi.'))

        # 3. Create 100 Products
        categories = {
            "Elektronika": [
                "Samsung Galaxy S23 Ultra", "iPhone 15 Pro Max", "MacBook Air M2", "Asus ROG Strix", 
                "Televizor LG 4K 55", "Sony PlayStation 5", "AirPods Pro 2", "Xiaomi Mi Band 8",
                "Planshet iPad Pro", "Monitor Dell 27", "Printer HP LaserJet", "Kalonka JBL Flip 6",
                "Fotoapparat Canon EOS", "Power Bank 20000mAh", "Sichqoncha Logitech G502", "Klaviatura Mechanical"
            ],
            "Kiyim-kechak": [
                "Erkaklar klassik kostyumi", "Ayollar kechki ko'ylagi", "Bolalar kurtkasi", "Sport krossovkalari Nike",
                "Charm kurtka", "Djinsi shim Levi's", "Futbolka oq", "Qishki qalpoq va sharf",
                "Ayollar sumkasi charm", "Erkaklar kamari", "Paypoqlar to'plami", "Yozgi ko'ylak",
                "Sport formasi Adidas", "Shimlar klassik", "Palto kashmir", "Sviter junli"
            ],
            "Uy-ro'zg'or": [
                "Choynak va piyola to'plami", "Oshxona pichog'i to'plami", "Gilam 3x4m Turkman", "Dazmol Tefal",
                "Changyutgich Samsung", "Mikroto'lqinli pech LG", "Muzlatgich Artel", "Gaz plitasi",
                "Kir yuvish mashinasi", "Blender Bosch", "Kofe qaynatgich", "Idish-tovoqlar to'plami",
                "Yostiq va ko'rpa", "Sochiqlar to'plami", "Suv filtri", "Havo tozalagich"
            ],
            "Oziq-ovqat": [
                "Guruch Alanga 5kg", "Paxta yog'i 5L", "Qora choy premium", "Ko'k choy 95",
                "Shakar 1kg", "Un 1-nav 10kg", "Makaron to'plami", "Asal tog'li 1kg",
                "Yong'oq mag'izi", "Mayiz qora", "Pista va bodom", "Shokolad to'plami",
                "Sut 1L", "Qatiq 1L", "Tuxum 30talik", "Go'sht mol go'shti 1kg"
            ],
            "Aksessuarlar": [
                "Qo'l soati Casio", "Charm hamyon", "Ko'zoynak Ray-Ban", "Zanjir kumush",
                "Uzuk tilla", "Soyabon avtomat", "Ryukzak noutbuk uchun", "Kalitlar to'plami",
                "Atir-upa Dior", "Soch quritgich Dyson", "Elektroustara Philips", "Massajyor"
            ]
        }

        descriptions = [
            "Yuqori sifatli va chidamli mahsulot.",
            "O'zbekiston bo'ylab yetkazib berish mavjud.",
            "Eng so'nggi modeldagi yangilik.",
            "Kafolatlangan sifat va hamyonbop narx.",
            "Zamonaviy dizayn va qulay foydalanish."
        ]

        total_created = 0
        all_cats = list(categories.keys())
        
        while total_created < 100:
            cat = random.choice(all_cats)
            items = categories[cat]
            for item_name in items:
                if total_created >= 100:
                    break
                
                # Adding some variety to names to make them unique
                unique_name = f"{item_name} #{random.randint(100, 999)}"
                
                Product.objects.get_or_create(
                    name=unique_name,
                    defaults={
                        'description': f"{random.choice(descriptions)} {cat} turkumidagi sara mahsulot.",
                        'price': random.randint(10000, 5000000),
                        'stock': random.randint(5, 200),
                        'created_by': admin_user
                    }
                )
                total_created += 1

        self.stdout.write(self.style.SUCCESS(f'Jami {total_created} ta mahsulot yaratildi.'))

        # 4. Create some random orders
        customers = User.objects.filter(role='CUSTOMER')
        products = list(Product.objects.all())
        
        for _ in range(20):
            customer = random.choice(customers)
            order = Order.objects.create(
                user=customer,
                status=random.choice(['PENDING', 'ACCEPTED', 'SHIPPED', 'DELIVERED'])
            )
            
            total_order_price = 0
            # Add 1-5 items per order
            for _ in range(random.randint(1, 5)):
                product = random.choice(products)
                qty = random.randint(1, 3)
                price = product.price
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=qty,
                    price=price
                )
                total_order_price += (price * qty)
            
            order.total_price = total_order_price
            order.save()

        self.stdout.write(self.style.SUCCESS('20 ta tasodifiy buyurtma yaratildi.'))
        self.stdout.write(self.style.SUCCESS('Baza demo ma\'lumotlar bilan muvaffaqiyatli to\'ldirildi!'))
