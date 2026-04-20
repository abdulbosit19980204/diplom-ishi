# 🛒 Online Shop Management System — Backend

Django REST Framework + Django Channels API backend.

## Texnologiyalar

| Texnologiya | Versiya |
|---|---|
| Python | 3.11+ |
| Django | 6.0+ |
| Django REST Framework | 3.16+ |
| Django Channels | 4.2+ |
| Daphne | 4.1+ |
| SimpleJWT | 5.4+ |
| SQLite (dev) / PostgreSQL (prod) | — |

## O'rnatish va ishga tushirish

```bash
# 1. Virtual muhit yarating
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# 2. Bog'liqliklarni o'rnating
pip install -r requirements.txt

# 3. Migratsiyalarni bajaring
python manage.py makemigrations
python manage.py migrate

# 4. Superuser yarating (ADMIN roli bilan)
python manage.py createsuperuser

# 5. Serverni ishga tushiring
python manage.py runserver
```

> **Muhim:** `python manage.py createsuperuser` bilan yaratilgan foydalanuvchi
> `is_staff=True` va `is_superuser=True` bo'ladi, lekin `role` maydoni `CUSTOMER`
> bo'lib qoladi. Django admin orqali rolni `ADMIN` ga o'zgartiring:
> `http://localhost:8000/admin/` → Users → username → Role = ADMIN → Save

## API Endpointlar

### 🔐 Auth
| Method | URL | Tavsif |
|---|---|---|
| POST | `/api/auth/register/` | Ro'yxatdan o'tish |
| POST | `/api/auth/login/` | Kirish (access + refresh + role qaytaradi) |
| POST | `/api/auth/refresh/` | Tokenni yangilash |

### 📦 Mahsulotlar (Products)
| Method | URL | Ruxsat | Tavsif |
|---|---|---|---|
| GET | `/api/products/` | Hammaga | Ro'yxat |
| POST | `/api/products/` | ADMIN, MANAGER | Qo'shish |
| GET | `/api/products/{id}/` | Hammaga | Batafsil |
| PUT/PATCH | `/api/products/{id}/` | ADMIN, MANAGER | Tahrirlash |
| DELETE | `/api/products/{id}/` | ADMIN, MANAGER | O'chirish |

### 🛒 Buyurtmalar (Orders)
| Method | URL | Ruxsat | Tavsif |
|---|---|---|---|
| GET | `/api/orders/` | Auth | Ro'yxat (admin=barchasi, user=o'ziniki) |
| POST | `/api/orders/` | Auth | Yaratish |
| PATCH | `/api/orders/{id}/` | ADMIN, MANAGER | Status yangilash |
| DELETE | `/api/orders/{id}/` | ADMIN, MANAGER | O'chirish |

### 👥 Foydalanuvchilar (Users) — ADMIN only
| Method | URL | Tavsif |
|---|---|---|
| GET | `/api/users/` | Ro'yxat |
| PATCH | `/api/users/{id}/set-role/` | Rolni o'zgartirish |
| PATCH | `/api/users/{id}/toggle-active/` | Bloklash/faollashtirish |

### 💬 Chat
| Method | URL | Tavsif |
|---|---|---|
| GET | `/api/chat/` | Xabarlar (filter: `?user_id=`, `?order_id=`) |
| GET | `/api/chat/conversations/` | Suhbatlar ro'yxati |
| WS | `ws://host/ws/chat/?token=JWT` | Real-time WebSocket |
| WS | `ws://host/ws/chat/?token=JWT&order_id=1` | Buyurtma chat |

### 📊 Analitika
| Method | URL | Ruxsat | Tavsif |
|---|---|---|---|
| GET | `/api/analytics/` | ADMIN, MANAGER | Dashboard statistikasi |

## Django Admin

Barcha modellar admin panelda mavjud: `http://localhost:8000/admin/`

- **Users** — rol, faollik boshqaruvi
- **Products** — narx va ombor tahrirlash
- **Orders** — status kuzatuvi
- **OrderItems** — buyurtma tarkibi
- **Messages** — chat xabarlari

## ⚠️ Muhim: Rol bilan foydalanuvchi yaratish

Yangi foydalanuvchi ro'yxatdan o'tganda default `CUSTOMER` roli beriladi.
`ADMIN` yoki `MANAGER` roli berish uchun:

**Variant 1 — Django Admin:**
```
http://localhost:8000/admin/ → Users → foydalanuvchi → Role → ADMIN → Save
```

**Variant 2 — Django shell:**
```python
python manage.py shell
from users.models import User
u = User.objects.get(username='yourname')
u.role = 'ADMIN'
u.save()
```

**Variant 3 — API (ADMIN token bilan):**
```bash
PATCH /api/users/{id}/set-role/
{"role": "ADMIN"}
```

## Muhit o'zgaruvchilari (Production)

```env
SECRET_KEY=your-secret-key-here
DEBUG=False
DATABASE_URL=postgres://user:pass@host:5432/dbname
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```
