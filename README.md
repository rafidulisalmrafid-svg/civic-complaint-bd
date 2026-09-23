# Bangladesh Civic Complaint Management Platform
### নাগরিক সেবা ও অভিযোগ প্রতিকার প্ল্যাটফর্ম

A production-ready civic tech platform built for citizen complaint intake, dynamic multi-tier administrative geography, intelligent routing, SLA escalation, and decentralized officer resolution across Bangladesh (pilot areas: Barishal & Cumilla).

---

## 🛠️ Tech Stack
- **Backend:** Laravel 13, PHP 8.2+
- **Frontend:** React 19, Inertia.js v3, Tailwind CSS v4, Lucide React, Leaflet Maps
- **Database:** SQLite (included & pre-seeded) or MySQL compatible
- **Architecture:** Decoupled Officer Directory, Dynamic Hierarchy, Form Builder, Audit Trail

---

## 🚀 Quick Setup & Run Instructions

### 1. Prerequisites
- PHP 8.2+ with `pdo_sqlite`, `fileinfo`, `mbstring`, `openssl` extensions enabled
- Composer
- Node.js & npm (optional if using the pre-compiled `public/build`)

### 2. Installation
Extract the zip archive to your desired location, then open terminal in the project directory:

```bash
# If vendor is not present, install PHP dependencies:
composer install

# Copy environment file (if .env doesn't exist):
cp .env.example .env

# Generate application key:
php artisan key:generate

# The pre-seeded database is already present in database/database.sqlite!
# To re-seed fresh demo data at any time:
php artisan migrate:fresh --seed
```

### 3. Run Development Server
```bash
php artisan serve
```
Then visit: **http://127.0.0.1:8000**

*(Optional) If you want to modify frontend assets:*
```bash
npm install
npm run dev
```

---

## 🔑 Demo Access Credentials

| Portal | Email / Phone | Password / OTP | Description |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@nagorik.gov.bd` | `password123` | Full admin rights, geography, routing rules, audit trail |
| **Barishal Officer** | `officer@barishal.gov.bd` | `password123` | Dr. Maruf Hasan, Civil Surgeon Barishal |
| **Cumilla Officer** | `officer@cumilla.gov.bd` | `password123` | Engr. Kamrul Hasan, Executive Engineer Cumilla City Corp |
| **Citizen Demo** | `01711223344` | OTP: `123456` | Citizen tracking submitted complaints |

### Sample Tracking Numbers:
- `CT-BAR-2026-000101` — Barishal Sadar Road Sewerage Pipeline Leak (In-Progress)
- `CT-BAR-2026-000102` — Band Road Street Light Fault (Resolved with Citizen Feedback)
- `CT-CUM-2026-000103` — Kandirpar Water-logging Issue (Under Investigation)
- `CT-CUM-2026-000104` — Victoria College Waste Accumulation (Resolved)
- `CT-BAR-2026-000105` — General Hospital Doctor Absenteeism (Escalated)

---

## 📂 Key Architecture Directories
- `app/Http/Controllers`: Public intake, citizen dashboard, officer resolution queue, and admin management
- `app/Services`: Tracking ID generator (`CT-DIV-YEAR-XXXXXX`), Routing service, SLA calculation
- `app/Models`: Geography hierarchy, organizations, decoupled officer profiles, and complaints
- `resources/js/Pages`: React Inertia pages for Public, Citizen, Officer, and Super Admin
- `resources/js/Components`: Status badges, Leaflet location selector, timeline, and stats cards
