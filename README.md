# 🛒 Online Shop Management System

Full-stack e-commerce boshqaruv tizimi — **Django REST** backend + **Next.js** frontend.

## Loyiha tuzilmasi

```
diplom ishi/
├── backend/          # Django REST API
│   ├── core/         # Settings, URLs, ASGI
│   ├── users/        # Foydalanuvchilar, Auth, JWT
│   ├── shop/         # Mahsulotlar, Buyurtmalar, Analitika
│   └── chat/         # Real-time WebSocket chat
│
└── frontend/         # Next.js App Router
    └── src/
        ├── app/      # Sahifalar (dashboard, products, orders, ...)
        ├── components/ # Sidebar, Topbar, ThemeToggle
        ├── store/    # Zustand (auth, theme)
        └── lib/      # API client (Axios)
```

## Tezkor ishga tushirish

### Backend
```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

🌐 Frontend: `http://localhost:3000`  
🔧 Backend API: `http://localhost:8000/api/`  
⚙️ Django Admin: `http://localhost:8000/admin/`

## ⚠️ Mahsulot qo'sha olmaslik muammosi — YECHIM

Yangi foydalanuvchi **default `CUSTOMER` roli** bilan ro'yxatdan o'tadi.
Mahsulot qo'shish uchun `ADMIN` yoki `MANAGER` roli kerak.

### Rol o'zgartirish:

**1. Django Admin orqali (eng oson):**
```
http://localhost:8000/admin/ → Users → foydalanuvchi → Role = ADMIN → Save
```

**2. Django shell orqali:**
```bash
python manage.py shell
>>> from users.models import User
>>> u = User.objects.get(username='sizning_username')
>>> u.role = 'ADMIN'
>>> u.save()
```

**3. Superuser yaratish (avtomatik ADMIN):**
```bash
python manage.py shell
>>> from users.models import User
>>> u = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
>>> u.role = 'ADMIN'
>>> u.save()
```

## Asosiy imkoniyatlar

| Modul | Imkoniyatlar |
|---|---|
| 🔐 Auth | JWT, ro'yxatdan o'tish, kirish, rol tizimi |
| 📦 Mahsulotlar | CRUD (qo'shish, tahrirlash, o'chirish), ombor kuzatuvi |
| 🛒 Buyurtmalar | Status boshqaruvi, timeline, mijoz ko'rinishi |
| 📊 Analitika | Daromad, buyurtma statistika, oylik grafik |
| 💬 Real-time Chat | WebSocket, suhbatlar, o'qilmagan xabarlar |
| 👥 Foydalanuvchilar | Rol o'zgartirish, bloklash/faollashtirish |
| ⚙️ Sozlamalar | Mavzu (dark/light), bildirishnomalar, xavfsizlik |

## Ruxsatlar jadvali

| Endpoint | CUSTOMER | MANAGER | ADMIN |
|---|---|---|---|
| GET /api/products/ | ✅ | ✅ | ✅ |
| POST/PUT/DELETE /api/products/ | ❌ | ✅ | ✅ |
| GET /api/orders/ | Faqat o'ziniki | Barchasi | Barchasi |
| PATCH /api/orders/{id}/ | ❌ | ✅ | ✅ |
| GET /api/analytics/ | ❌ | ✅ | ✅ |
| GET /api/users/ | ❌ | ❌ | ✅ |
| PATCH /api/users/{id}/set-role/ | ❌ | ❌ | ✅ |

Batafsil ma'lumot: [Backend README](./backend/README.md) | [Frontend README](./frontend/README.md)
