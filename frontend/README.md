# TaskFlow — Premium SaaS Task Management System

TaskFlow is a high-performance, enterprise-grade task management platform designed for modern teams. Built with a focus on **User Experience**, **Scalability**, and **Security**, it provides a seamless workflow for project planning, team collaboration, and productivity tracking.

![TaskFlow Dashboard Mockup](https://raw.githubusercontent.com/your-username/taskflow/main/preview.png) *(Placeholder for your screenshot)*

## ✨ Key Features

- **🚀 Interactive Kanban Board**: Seamless drag-and-drop task management powered by `@dnd-kit`.
- **🔐 Role-Based Access Control (RBAC)**: Fine-grained permissions for Admins and Members.
- **📊 Real-time Productivity Insights**: Visual analytics using Recharts to track completion rates and task distribution.
- **📜 Live Activity Feed**: Comprehensive audit logs tracking every project change.
- **🎨 Premium UI/UX**: Custom design system built with Tailwind CSS v4, Poppins typography, and a "Navy & Violet" professional palette.
- **🛡️ Secure Authentication**: JWT-based auth with silent token rotation (Access/Refresh tokens).

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **State Management**: Zustand (Persisted)
- **Data Fetching**: TanStack Query (React Query)
- **Visualization**: Recharts
- **Drag & Drop**: @dnd-kit

### Backend
- **Framework**: NestJS (Modular Architecture)
- **Database**: MongoDB (Mongoose ODM)
- **Security**: Passport.js + JWT
- **Validation**: Class-validator + Class-transformer
- **Logging**: Custom Activity Logger

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or on Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/task-manager.git
cd task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env # Update your MongoDB URI
npm run start:dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Seed Demo Data
Populate the database with professional test data:
```bash
cd backend
node src/seed.js
```

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@taskflow.com` | `Admin@123` |
| **Member** | `sarah@taskflow.com` | `Member@123` |

## 📐 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication & JWT
│   │   ├── projects/      # Project management
│   │   ├── tasks/         # Kanban & Task logic
│   │   ├── dashboard/     # Aggregation & Stats
│   │   ├── activity/      # Audit logs
│   │   └── common/        # Filters/Interceptors
├── frontend/
│   ├── src/
│   │   ├── components/    # Atomic UI components
│   │   ├── pages/         # Dashboard, Kanban, Auth
│   │   ├── store/         # Zustand global state
│   │   └── services/      # Axios API layer
```

---
Built with ❤️ for professional team collaboration.
