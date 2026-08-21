# 🎓 RU Orientation Portal

> A modern, real-time College Orientation Management Platform built for orientation desk teams, department leads, and university staff to verify incoming students, manage residence room allocations, track parent records, and log step-by-step check-in progress.

---

## 📌 Project Overview

The **RU Orientation Portal** simplifies and accelerates the arrival workflow for hundreds of incoming college students on orientation day. 

Instead of manual paper lists, orientation staff can:
- **Search Students Instantly**: Quickly look up students by their full name, parent's name, enrollment/roll number, or course.
- **Track 5 Orientation Checkpoints**: Log student progress across 5 official campus verification stations in real time.
- **Auto Check-In at Gate 2**: Automatically mark students as **Checked In** as soon as they cross Gate Number 2.
- **Verify Hostel Allocations**: View assigned hostel blocks and room numbers (or "Not Allocated" badge for day scholars).
- **Monitor Real-Time Analytics**: View arrival velocity, course breakdown charts, and exact student volume at each step.

---

## 🔑 Default Admin Credentials

For staff testing and administration:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Team Lead / Admin** | `kapish@admin.ru` | `kapish@ru2026` |

---

## ✨ Key Features

### 1. 🔍 Students Check-In Desk
- Search across 650+ student records by student name, **parent's name**, roll number, or course.
- Detailed modal card displaying student email, mobile number, clan, band color, parent name, and hostel room allocation.

### 2.  5 Campus Orientation Checkpoints
Every student detailed card includes 5 interactive checkpoints with real-time status updates:
1. **Gate Number 2** – *Ticking this step automatically marks the student as Checked In with timestamp*.
2. **Hostel Desk** – Room key & allocation verification.
3. **Main Audi / Doc Verification** – Academic document verification.
4. **VIP Lounge / ID Card Issue** – Student ID card issuance.
5. **C Block / Orientation Kit** – Orientation welcome kit collection.

### 3.  Live Dashboard & Step Analytics
- **KPI Stat Cards**: Total Newcomers, Checked In count, Pending count, Flagged records, and Hostel Allocation percentage.
- **Live Step Progress Breakdown**: Real-time count of students currently at or completed with each of the 5 orientation steps.
- **Hourly Velocity & Department Charts**: Interactive Recharts bar and area charts for monitoring peak arrival hours.

### 4. 🏢 Residence & Hostel Management
- Live occupancy indicators for **Block A (Boys)**, **Block B (Boys)**, **Block C (Girls)**, **Block D (Girls)**, and **Day Scholars Cohort**.

### 5. 🔐 Secure JWT Authentication
- Protected API endpoints with JSON Web Token verification.
- Passwords securely hashed with `bcryptjs`.
- Clean sign out & auto-expiring session control.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Vanilla neutral & red theme, dark/light mode support)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Server**: [Express](https://expressjs.com/) (TypeScript)
- **Database ORM**: [Prisma ORM](https://www.prisma.io/)
- **Database**: [Neon Cloud PostgreSQL](https://neon.tech/)
- **Authentication**: `jsonwebtoken` (JWT) & `bcryptjs`

---

## 🚀 Developer Setup Guide

Follow these steps to run the project locally on your system.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/kapish9741/RU_Orientation.git
cd RU_Orientation
```

---

### Step 2: Configure Environment Variables

#### Backend `.env`
Create a `.env` file in the `backend` folder:
```env
PORT=5001
DATABASE_URL="postgresql://neondb_owner:npg_eN34dqWDTnEa@ep-snowy-sound-auiuja0v-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="DLgFHczDGBHLDfac1Kb0lt7J893VyGmVakG5WhgeUeP"
```

#### Frontend `.env`
Create a `.env` file in the `frontend` folder:
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:5001/api"
```

---

### Step 3: Install & Start Backend
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```
*The backend API will run on `http://localhost:5001`.*

---

### Step 4: Install & Start Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend application will run on `http://localhost:3000`.*

---

## 📁 Repository Structure

```
RU_Orientation/
├── Final Clans with Dummy Data.csv  # Original student dataset (~651 records)
├── README.md                        # Project documentation
├── backend/                         # Express API & Prisma ORM Backend
│   ├── prisma/
│   │   └── schema.prisma            # PostgreSQL Database Models
│   ├── src/
│   │   ├── auth.ts                  # JWT Auth & bcrypt logic
│   │   ├── csvParser.ts             # Quote-aware CSV parsing engine
│   │   ├── seed.ts                  # Bulk seed script for Neon PostgreSQL
│   │   └── server.ts                # Express REST API endpoints
│   ├── .env                         # Backend environment configuration
│   └── package.json
└── frontend/                        # Next.js 14 Frontend Application
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx             # Main Orientation Dashboard Page
    │   │   └── globals.css          # Design Tokens & Theme variables
    │   ├── components/
    │   │   ├── StudentTable.tsx     # Student Search, Checkpoint Modal & Parent card
    │   │   ├── StatCards.tsx        # Dashboard KPI Summary Cards
    │   │   ├── DashboardCharts.tsx  # Recharts Analytics Charts
    │   │   ├── Header.tsx           # Live Clock, Theme Toggle & User Logout
    │   │   └── Sidebar.tsx          # Navigation Bar
    │   └── context/
    │       └── AuthContext.tsx      # Authentication State & Session Persistence
    ├── .env                         # Frontend environment configuration
    └── package.json
```

---

## 🔒 Security Best Practices Implemented

- **No Secret Leaks**: `.env` files are ignored by Git via root, backend, and frontend `.gitignore` rules.
- **Route Authorization**: State mutation endpoints (such as `PATCH /api/students/:id/checkpoints`) require a valid `Bearer <token>` in the Authorization header.
- **Token Invalidation**: Invalid or expired JWT tokens immediately reset local session state, preventing authorization bypass.

---

## 📄 License

Developed for the **RU College Orientation Team**. All rights reserved.
