# APAP Frontend

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![MUI](https://img.shields.io/badge/MUI-9-007FFF?style=for-the-badge&logo=mui)
![Zustand](https://img.shields.io/badge/Zustand-latest-orange?style=for-the-badge)

**Academic Performance Analytics Platform — Web Interface**

[Production](https://apap-frontend.vercel.app) · [Backend API](https://apap-backend.onrender.com/v1)

</div>

---

## Loyiha haqida

APAP Frontend — universitetlar uchun akademik ko'rsatkichlar boshqaruv tizimining web interfeysi. Next.js 15 App Router, Material UI v9 va Zustand asosida qurilgan. 4 ta rol uchun alohida dashboard: Admin, O'qituvchi, Talaba va Ota-ona.

## Texnologiyalar

| Texnologiya | Versiya | Maqsad |
|-------------|---------|--------|
| Next.js | 15 | React framework (App Router) |
| TypeScript | 5 | Dasturlash tili |
| Material UI | 9 | UI komponent kutubxonasi |
| Zustand | latest | State management |
| Axios | latest | HTTP client |
| React Hook Form | latest | Form boshqaruvi |
| Zod | latest | Validatsiya |
| js-cookie | latest | Cookie boshqaruvi |
| jwt-decode | latest | JWT token decode |

## Loyiha strukturasi

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login sahifasi
│   └── (dashboard)/
│       ├── admin/           # Admin sahifalari
│       │   ├── dashboard/
│       │   ├── students/
│       │   ├── grades/
│       │   ├── attendance/
│       │   ├── reports/
│       │   ├── faculties/
│       │   ├── groups/
│       │   ├── courses/
│       │   ├── semesters/
│       │   ├── users/
│       │   └── audit/
│       ├── teacher/         # O'qituvchi sahifalari
│       │   ├── dashboard/
│       │   ├── students/
│       │   ├── grades/
│       │   ├── attendance/
│       │   └── reports/
│       ├── student/         # Talaba sahifalari
│       │   ├── dashboard/
│       │   ├── grades/
│       │   ├── attendance/
│       │   └── reports/
│       └── parent/          # Ota-ona sahifalari
│           ├── dashboard/
│           ├── grades/
│           └── attendance/
├── components/
│   ├── layout/              # Sidebar, Header, Notifications
│   ├── ui/                  # PageHeader, ConfirmDialog
│   ├── students/            # Student modallari
│   ├── grades/              # GPA card, Grade modallari
│   ├── attendance/          # Attendance modallari
│   └── reports/             # Reports komponentlari
├── lib/
│   ├── api/                 # API client funksiyalar
│   ├── theme.ts             # MUI tema
│   └── navigation.ts        # Nav items konfiguratsiya
├── store/
│   ├── auth.store.ts        # Autentifikatsiya state
│   └── notification.store.ts # Bildirishnomalar state
├── types/
│   └── index.ts             # TypeScript type definitionlar
└── middleware.ts            # Route himoya
```

## Sahifalar

### Admin
| Sahifa | Yo'l | Tavsif |
|--------|------|--------|
| Dashboard | `/admin/dashboard` | Umumiy statistika |
| Talabalar | `/admin/students` | CRUD + CSV import |
| Baholar | `/admin/grades` | Baho kiritish + GPA |
| Davomat | `/admin/attendance` | Bulk kiritish + statistika |
| Reportlar | `/admin/reports` | PDF/Excel generatsiya |
| Fakultetlar | `/admin/faculties` | CRUD |
| Guruhlar | `/admin/groups` | CRUD |
| Kurslar | `/admin/courses` | CRUD |
| Semestrlar | `/admin/semesters` | CRUD + faollashtirish |
| Foydalanuvchilar | `/admin/users` | CRUD + bloklash |
| Audit log | `/admin/audit` | Tizim jurnali |

### O'qituvchi
| Sahifa | Yo'l | Tavsif |
|--------|------|--------|
| Dashboard | `/teacher/dashboard` | O'z kurslari |
| Talabalar | `/teacher/students` | Guruh bo'yicha |
| Baholar | `/teacher/grades` | Kiritish + GPA |
| Davomat | `/teacher/attendance` | Bulk kiritish |
| Reportlar | `/teacher/reports` | Yuklab olish |

### Talaba
| Sahifa | Yo'l | Tavsif |
|--------|------|--------|
| Dashboard | `/student/dashboard` | Profil + GPA |
| Baholarim | `/student/grades` | Ko'rish |
| Davomatim | `/student/attendance` | Statistika |
| Reportlar | `/student/reports` | Yuklab olish |

### Ota-ona
| Sahifa | Yo'l | Tavsif |
|--------|------|--------|
| Dashboard | `/parent/dashboard` | Farzand ma'lumotlari |
| Farzand baholar | `/parent/grades` | Ko'rish |
| Farzand davomat | `/parent/attendance` | Statistika |

## O'rnatish

### Talablar

- Node.js v20+
- APAP Backend ishga tushirilgan bo'lishi kerak

### 1. Repozitoriyani klonlash

```bash
git clone https://github.com/YOUR_USERNAME/apap-frontend.git
cd apap-frontend
```

### 2. Dependensiyalarni o'rnatish

```bash
npm install
```

### 3. Environment sozlash

`.env.local` fayl yarating:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

### 4. Serverni ishga tushirish

```bash
npm run dev
```

Brauzerda `http://localhost:3001` ni oching.

### Test akkauntlar

| Rol | Email | Parol |
|-----|-------|-------|
| Admin | admin@apap.uz | Admin123! |

## Autentifikatsiya

JWT token cookie da saqlanadi:
- **accessToken** — 15 daqiqa
- **refreshToken** — 7 kun

Token muddati tugaganda avtomatik yangilanadi (Axios interceptor orqali).

Middleware har so'rovda tokenni tekshiradi va rolga qarab yo'naltiradi:

```
/login → token yo'q → login sahifasi
/admin/* → faqat admin roli
/teacher/* → faqat teacher roli
/student/* → faqat student roli
/parent/* → faqat parent roli
```

## Deployment

### Vercel ga deploy

1. GitHub reponi Vercel ga ulang
2. Environment variables qo'shing:

```env
NEXT_PUBLIC_API_URL=https://apap-backend.onrender.com/v1
NEXT_PUBLIC_WS_URL=https://apap-backend.onrender.com
```

3. Deploy tugmasini bosing

`main` branchga har push qilinganda avtomatik deploy bo'ladi.

## Skriptlar

```bash
npm run dev        # Development server (port 3001)
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint tekshiruv
```

## Litsenziya

MIT