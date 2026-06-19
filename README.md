# HireFlow AI — README

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key (optional, works with mock data)

---

## Backend

```bash
cd backend
npm install
# Edit .env with your MongoDB URI and API keys
npm run dev
```

Backend runs on: **http://localhost:5000**

### Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hireflow
JWT_SECRET=supersecretjwtkey12345
OPENAI_API_KEY=sk-your-openai-key-here
```

---

## Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on: **http://localhost:4200**

---

## 🎯 Features Built

### Backend
- ✅ Express.js + TypeScript API
- ✅ MongoDB with Mongoose schemas
- ✅ JWT Authentication (Register/Login)
- ✅ Role-based access control (Super Admin, HR Manager, Interviewer, Candidate)
- ✅ Jobs CRUD API
- ✅ Candidates CRUD API
- ✅ Applications API with pipeline stages
- ✅ Interviews API (schedule, feedback, results)
- ✅ AI Engine API (resume parsing, candidate ranking, question generation)
- ✅ Reports API (dashboard stats, recruiter performance)
- ✅ Notifications API
- ✅ Socket.io real-time events

### Frontend (Angular 18)
- ✅ Login & Register pages
- ✅ Dashboard with stats cards and hiring funnel
- ✅ Job Management (Create/Edit/List/Publish)
- ✅ Candidate Management with AI ranking
- ✅ Applications Pipeline (Kanban + List views)
- ✅ Interviews Management (Schedule/Feedback)
- ✅ AI Engine (Resume Parser / Candidate Ranking / Question Generator)
- ✅ Reports & Analytics
- ✅ Notifications center
- ✅ Admin Panel (Users/Companies/Subscriptions/AI Settings)
- ✅ Profile page

---

## 🔐 Demo Credentials

Use the demo buttons on the login page, or:
- **Super Admin**: admin@hireflow.ai / Admin@123
- **HR Manager**: hr@hireflow.ai / Hr@12345

*(Create these in MongoDB or seed the database)*

---

## 📁 Project Structure

```
ATS/
├── backend/
│   └── src/
│       ├── config/        # DB connection
│       ├── controllers/   # authController, jobController, candidateController...
│       ├── middleware/    # JWT auth middleware
│       ├── models/        # Mongoose schemas
│       └── routes/        # Express routers
├── frontend/
│   └── src/
│       └── app/
│           ├── guards/       # Auth guards
│           ├── interceptors/ # HTTP auth interceptor
│           ├── layouts/      # Main layout shell
│           ├── pages/        # All page components
│           └── services/     # API services
```
