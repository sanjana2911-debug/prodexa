# Prodexa - Student Productivity Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtoken)](https://jwt.io/)

**Prodexa** is a complete student productivity platform with task management, attendance tracking, notes, study planning, and analytics — all in a beautiful, responsive interface with dark mode support.

## ✨ Features

- ✅ **Task Manager** — Full CRUD with priority levels, due dates, search, and filters
- ✅ **Attendance Tracker** — Visual calendar, mark present/absent, monthly statistics
- ✅ **Notes Manager** — Categorized notes with color coding, pinning, and full-text search
- ✅ **Study Planner** — Daily/weekly goals with progress tracking and completion metrics
- ✅ **Analytics Dashboard** — Charts, priority distribution, attendance rates, productivity summary
- ✅ **User Profile** — Edit profile, account settings, semester management
- ✅ **Dark Mode** — Persisted theme preference with system detection
- ✅ **Authentication** — JWT with refresh tokens, role-based access (student/admin)
- ✅ **Responsive Design** — Mobile, tablet, and desktop optimized
- ✅ **Landing Page** — Public homepage explaining features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/prodexa.git
cd prodexa

# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:3000
```

### Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Configure environment
cp ../.env.example ../.env
# Edit .env with your MongoDB URI and JWT secrets

# Start development server
npm run dev
# Runs at http://localhost:5000
```

### Demo Login
- **Email:** john@example.com
- **Password:** password123

## 🏗️ Project Structure

```
prodexa/
├── src/                    # Frontend (React + Vite)
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components
│   ├── layouts/            # Layout wrappers
│   ├── context/            # React Context providers
│   ├── services/           # API service layer
│   ├── utils/              # Helper functions
│   └── hooks/              # Custom React hooks
├── server/                 # Backend (Express + MongoDB)
│   ├── config/             # Database & environment config
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Auth, error handling, rate limiting
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   ├── validators/         # Request validation rules
│   ├── utils/              # JWT, email, logger, pagination, Redis
│   ├── docs/               # Swagger API documentation
│   ├── seeds/              # Database seed scripts
│   └── tests/              # Jest test suites
├── uploads/                # File upload directory
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Multi-stage Docker build
└── README.md
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:5000/api-docs
- **Health Check:** http://localhost:5000/api/health

### API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/refresh-token` | Refresh access token | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| GET | `/api/tasks` | Get user tasks | Yes |
| POST | `/api/tasks` | Create task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |
| GET | `/api/attendance` | Get attendance records | Yes |
| POST | `/api/attendance` | Mark attendance | Yes |
| GET | `/api/attendance/stats` | Get attendance stats | Yes |
| GET | `/api/notes` | Get user notes | Yes |
| POST | `/api/notes` | Create note | Yes |
| PUT | `/api/notes/:id` | Update note | Yes |
| DELETE | `/api/notes/:id` | Delete note | Yes |
| GET | `/api/study-goals` | Get study goals | Yes |
| POST | `/api/study-goals` | Create goal | Yes |
| PUT | `/api/study-goals/:id` | Update goal | Yes |
| DELETE | `/api/study-goals/:id` | Delete goal | Yes |
| GET | `/api/analytics/dashboard` | Dashboard stats | Yes |
| GET | `/api/analytics/monthly` | Monthly analytics | Yes |

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual image
docker build -t prodexa-api .
docker run -p 5000:5000 --env-file .env prodexa-api
```

## 🛠️ Tech Stack

### Frontend
- **React 18** — UI library
- **Vite 5** — Build tool
- **Tailwind CSS 3** — Styling
- **React Router DOM 6** — Routing
- **Axios** — HTTP client
- **Recharts** — Charts
- **React Icons** — Icon library

### Backend
- **Node.js** — Runtime
- **Express 4** — Web framework
- **MongoDB + Mongoose** — Database
- **JWT** — Authentication
- **bcryptjs** — Password hashing
- **Redis** — Caching (optional)
- **Winston** — Logging
- **Helmet** — Security headers
- **express-rate-limit** — Rate limiting
- **Nodemailer** — Email service
- **Swagger** — API documentation
- **Jest + Supertest** — Testing

## 🔒 Security Features

- JWT with access + refresh token rotation
- bcrypt password hashing (12 rounds)
- Helmet security headers
- CORS with origin restriction
- NoSQL injection prevention (mongo-sanitize)
- Rate limiting on all endpoints
- Input validation (express-validator)
- Activity logging for audit trail
- Password reset with SHA256 tokens

## 📊 Performance Optimizations

- Redis caching for analytics data
- MongoDB compound indexes
- Code splitting via Vite manual chunks
- Production minification (Terser)
- Lazy loading ready
- Optimized bundle size (~270KB)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for students everywhere.