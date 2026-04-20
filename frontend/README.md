# 🛒 Online Shop Management System — Frontend

Next.js 16 (App Router) + TypeScript frontend.

## Texnologiyalar

| Texnologiya | Versiya |
|---|---|
| Next.js | 16.2+ |
| TypeScript | 5+ |
| TailwindCSS | 4 |
| Framer Motion | 11+ |
| Zustand | 5+ |
| Axios | 1.9+ |
| Lucide React | 0.503+ |

## O'rnatish

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
npm run build    # Production build
```

## Sahifalar

| URL | Tavsif | Ruxsat |
|---|---|---|
| `/` | Landing page | Hammaga |
| `/login` | Tizimga kirish | Hammaga |
| `/register` | Ro'yxatdan o'tish | Hammaga |
| `/dashboard` | Bosh sahifa — statistika | Auth |
| `/products` | Mahsulotlar (CRUD) | Auth |
| `/orders` | Buyurtmalar + status | Auth |
| `/analytics` | Analitika grafiklar | ADMIN/MANAGER |
| `/users` | Foydalanuvchilar boshqaruvi | ADMIN |
| `/chat` | Real-time chat | Auth |
| `/settings` | Sozlamalar | Auth |

## Muhit o'zgaruvchilari

`.env.local` faylini yarating:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/
```

> Hozirda `src/lib/api.ts` da `baseURL` hardcoded. Production uchun yuqoridagi
> env o'zgaruvchilarini o'rnating.

## Autentifikatsiya

- **JWT** tokenlar `js-cookie` orqali saqlanadi
- Token muddati: `access` = 1 kun, `refresh` = 7 kun
- Rol asosida sahifalar ko'rinadi (ADMIN, MANAGER, CUSTOMER)

## Real-time Chat

WebSocket ulanish `?token=<JWT>` query-param orqali:

```
ws://localhost:8000/ws/chat/?token=<access_token>
ws://localhost:8000/ws/chat/?token=<access_token>&order_id=5
```

## Dizayn tizimi

- **Dark/Light mode** — `localStorage` da saqlanadi
- CSS Custom Properties (`--bg-base`, `--brand`, `--text-primary`, ...)
- Glass morphism, gradient kartalar, Framer Motion animatsiyalar
- Responsive (mobile-first)
