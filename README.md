# MockPrep AI

![MockPrep AI](https://via.placeholder.com/1200x400/6366F1/FFFFFF?text=MockPrep+AI+-+Enterprise+Mock+Interview+Platform)

MockPrep AI is an enterprise-grade mock interview platform designed for software engineers. It simulates real-world interviews including DSA, Low-Level Design (LLD), High-Level Design (HLD), and HR rounds, providing **real-time AI-powered feedback** and **adaptive difficulty** based on user performance.

## 🌟 Key Features

- **Real-time AI Interviewer:** Powered by Groq (Llama 3.3) for lightning-fast question generation and Gemini for deep, structural evaluation of answers.
- **Adaptive Difficulty Engine:** AI intelligently adjusts the difficulty of subsequent questions based on your live performance (score ≥ 75% bumps difficulty up, ≤ 35% scales it down).
- **Asynchronous Processing:** Robust background job queues powered by **BullMQ** & **Redis** ensure that AI generation never blocks the main event loop, allowing thousands of concurrent users.
- **Real-time WebSockets:** Seamless delivery of AI generated questions and evaluations using **Socket.io**.
- **Admin Analytics Dashboard:** A dedicated portal for administrators to track platform revenue, user growth, popular interview rounds, and user telemetry.
- **PWA Ready:** Fully installable Progressive Web App (PWA) with offline-fallback and local caching strategies enabled via Service Workers.
- **Monetization & Tiers:** Built-in subscription plans (FREE, PRO, PREMIUM, TEAM) with Razorpay integration and role-based hint limits.

---

## 🏗️ Architecture

The platform uses a decoupled client-server architecture.

### **Frontend (`/Client`)**
- **Framework:** React 19 (Vite)
- **State Management:** Zustand (Global State) + TanStack Query (Server State/Caching)
- **Styling:** Tailwind CSS + Framer Motion (Micro-animations)
- **Real-time:** Socket.io-client
- **PWA:** Managed via custom `sw.js` (Cache-first/Network-first strategies)

### **Backend (`/Server`)**
- **Runtime:** Node.js + Express.js
- **Database:** PostgreSQL (managed via Prisma ORM)
- **Task Queues (AI):** BullMQ + Redis 
- **Real-time:** Socket.io with Redis Adapter
- **AI Integrations:** Groq API (Generation), Google Gemini API (Evaluation)
- **Security:** JWT authentication, Helmet, Express Rate Limit

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running
- Redis Server installed and running (`redis-cli`)
- API Keys for Groq and Gemini

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Ai_interview
```

### 2. Backend Setup
```bash
cd Server
npm install

# Setup your environment variables
cp .env.example .env
# Fill in your DATABASE_URL, REDIS_URL, GROQ_API_KEY, GEMINI_API_KEY, JWT_SECRET, etc.

# Run database migrations
npx prisma migrate dev

# Start the development server (runs express app + BullMQ workers)
npm run dev
```

### 3. Frontend Setup
```bash
cd ../Client
npm install

# Setup environment variables
cp .env.example .env
# Ensure VITE_API_URL and VITE_SOCKET_URL point to your backend (default: http://localhost:8000)

# Start Vite dev server
npm run dev
```

---

## 📂 Project Structure

```text
Ai_interview/
├── Client/                  # React Frontend
│   ├── public/              # Static assets, PWA Service Worker (sw.js), Manifest
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks (useTimer, useAIFeedback)
│   │   ├── pages/           # Route views (InterviewRoom, AdminDashboard, etc.)
│   │   ├── queries/         # TanStack Query React Hooks
│   │   ├── store/           # Zustand global state (interviewStore, userStore)
│   │   └── lib/             # Utilities and configs
│   └── vite.config.js       # Vite configuration
│
└── Server/                  # Node.js/Express Backend
    ├── prisma/              # Prisma schema & migrations
    ├── src/
    │   ├── config/          # Environment, Database, and BullMQ configurations
    │   ├── controllers/     # Route handlers
    │   ├── middleware/      # Auth, Error handlers, Rate limiters
    │   ├── modules/         # Domain-Driven Design (auth, interview, admin, ai)
    │   ├── socket/          # Socket.io event handlers
    │   └── workers/         # BullMQ Background Job Processors (generation.worker.js)
    └── server.js            # Express application entry point
```

## 🔒 Environment Variables

### Backend (`Server/.env`)
```env
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@localhost:5432/mockprep
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
```

### Frontend (`Client/.env`)
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:8000
```

---

## 👨‍💻 Contributing
This project uses modern ESLint standards and requires all backend logic to be scalable and production-ready. Ensure that:
- Any new features involving AI are routed through `BullMQ` to prevent event loop blocking.
- Database changes are made strictly through Prisma migrations.
- Frontend state relies heavily on TanStack query for server state, keeping Zustand only for volatile UI state.


