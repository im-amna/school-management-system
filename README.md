# EduManage — School Management System

A full-stack school management system built with Next.js, TypeScript, Prisma ORM, and PostgreSQL.

## 🔗 Links
- **Live Demo:** https://school-management-system-bay-three.vercel.app
- **GitHub:**  https://github.com/im-amna/school-management-system

## 👤 Demo Credentials

| Role    | Email                      | Password     |
|---------|----------------------------|--------------|
| Admin   | admin@school.com           | admin123     |
| Teacher | sarah.ahmed@school.com     | teacher123   |
| Student | ali.khan@student.com       | student123   |

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (RESTful)
- **Database:** PostgreSQL (Neon.tech) via Prisma ORM v7
- **Auth:** NextAuth.js (JWT, Credentials Provider)
- **UI:** Base UI (shadcn-style), Tabler Icons, Recharts

## ✨ Features

### Admin
- Manage Students, Teachers, Classes (full CRUD)
- View attendance records
- Manage student fees (create, mark paid)
- Dashboard with charts and analytics

### Teacher
- Mark daily attendance (Present/Absent/Late)
- Add and manage student results
- View assigned classes and students

### Student
- View personal attendance history
- View results with performance analytics
- View and print fee vouchers/receipts
- Personal profile page

### All Roles
- Role-based authentication and route protection
- Real-time notifications (attendance, results, fees)
- Responsive design (mobile + desktop)

## 🗄️ Database Schema

6 core tables: `User`, `Student`, `Teacher`, `Class`, `Attendance`, `Result`, `Fee`, `Notification`

## 🚀 Running Locally

```bash
# Clone the repo
git clone [your-github-url]
cd school-management

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your DATABASE_URL and NEXTAUTH_SECRET

# Run database migrations
npx prisma migrate dev

# Seed demo data
npx prisma db seed

# Start development server
npm run dev
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/          # RESTful API routes
│   ├── admin/        # Admin dashboard pages
│   ├── teacher/      # Teacher dashboard pages
│   └── student/      # Student dashboard pages
├── components/       # Reusable UI components
├── lib/              # Prisma client, auth config, helpers
└── types/            # TypeScript type definitions
prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Demo data seeder
```

## 🔐 Environment Variables

```env
DATABASE_URL=your_neon_postgresql_url
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```