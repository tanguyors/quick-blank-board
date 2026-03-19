<div align="center">

```
 ██████╗ ██╗   ██╗██╗ ██████╗██╗  ██╗    ██████╗ ██╗      █████╗ ███╗   ██╗██╗  ██╗
██╔═══██╗██║   ██║██║██╔════╝██║ ██╔╝    ██╔══██╗██║     ██╔══██╗████╗  ██║██║ ██╔╝
██║   ██║██║   ██║██║██║     █████╔╝     ██████╔╝██║     ███████║██╔██╗ ██║█████╔╝
██║▄▄ ██║██║   ██║██║██║     ██╔═██╗     ██╔══██╗██║     ██╔══██║██║╚██╗██║██╔═██╗
╚██████╔╝╚██████╔╝██║╚██████╗██║  ██╗    ██████╔╝███████╗██║  ██║██║ ╚████║██║  ██╗
 ╚══▀▀═╝  ╚═════╝ ╚═╝ ╚═════╝╚═╝  ╚═╝    ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
                    ██████╗  ██████╗  █████╗ ██████╗ ██████╗
                    ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗
                    ██████╔╝██║   ██║███████║██████╔╝██║  ██║
                    ██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║
                    ██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
                    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝
```

### 🇫🇷 French Real Estate Platform with Notaire Dashboard

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

![Commits](https://img.shields.io/badge/297+_Commits-FF6B35?style=for-the-badge&logo=git&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production-00C853?style=for-the-badge)
![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)

</div>

---

## 🎯 Overview

**Quick Blank Board** is a full-stack French real estate transaction platform that digitizes the property buying process. It features a dedicated notaire (notary) dashboard for managing legal documents, a buyer/seller portal, and automated compliance with French real estate law.

---

## ⚡ Feature Matrix

| Module | Description | Status |
|--------|-------------|--------|
| 🏠 **Property Listings** | Rich property cards with photos, floor plans & virtual tours | ✅ Live |
| ⚖️ **Notaire Dashboard** | Dedicated legal workspace for document review & signing | ✅ Live |
| 📋 **Transaction Tracker** | Step-by-step pipeline from offer to closing | ✅ Live |
| 📄 **Document Manager** | Secure upload, signing & storage of legal documents | ✅ Live |
| 💰 **Financial Calculator** | Mortgage simulation, frais de notaire & tax estimation | ✅ Live |
| 👥 **Multi-Party Portal** | Separate views for buyers, sellers, agents & notaires | ✅ Live |
| 📱 **Mobile App** | Native iOS app via Capacitor for on-site property visits | ✅ Live |
| 🔔 **Notifications** | Real-time alerts for document updates & deadlines | ✅ Live |
| 🗓️ **Appointment System** | Schedule visits, signings & notaire consultations | ✅ Live |
| 🇫🇷 **French Compliance** | Built-in DPE, diagnostics tracking & legal requirements | ✅ Live |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│            QUICK BLANK BOARD PLATFORM            │
├──────────────────────────────────────────────────┤
│  ┌───────────┐  ┌────────────┐  ┌────────────┐  │
│  │  Buyer /  │  │  Notaire   │  │   Agent    │  │
│  │  Seller   │  │  Dashboard │  │   Portal   │  │
│  └─────┬─────┘  └─────┬──────┘  └─────┬──────┘  │
│        └───────────────┼───────────────┘         │
│         React + TypeScript + Capacitor           │
│         Tailwind CSS + shadcn/ui                 │
│  ┌──────────────────────────────────────────┐    │
│  │         Supabase Backend                  │    │
│  │  Auth (RLS) | PostgreSQL | Edge Functions │    │
│  │  Storage (Documents) | Real-time          │    │
│  └──────────────────────────────────────────┘    │
│  iOS Native | Document Signing | Notifications   │
└──────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | TypeScript (97.6%) + PL/pgSQL |
| **Framework** | React + Vite + Capacitor |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Backend** | Supabase (Auth, DB, Storage, Edge Functions) |
| **Database** | PostgreSQL with Row Level Security |
| **Mobile** | Capacitor (iOS) |
| **State** | TanStack Query |
| **Hosting** | Vercel + App Store |

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/tanguyors/quick-blank-board.git
cd quick-blank-board

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev

# Build iOS app
npx cap sync ios
```

---

## 📈 Project Stats

| Metric | Value |
|--------|-------|
| **Total Commits** | 297+ |
| **Primary Language** | TypeScript (97.6%) |
| **Platforms** | Web + iOS |
| **User Roles** | Buyer, Seller, Agent, Notaire |
| **Legal Compliance** | French real estate law |

---

<div align="center">

**Built with 🏛️ for France by [@tanguyors](https://github.com/tanguyors)**

*Digitizing French real estate, from compromis to acte authentique*

</div>
