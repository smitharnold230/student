# Student Management & Points System

A full-stack application built with **Express + Sequelize + PostgreSQL** backend and **React + Vite** frontend for managing students, events, certifications, and a gamified points system.

---

## 📁 Folder Structure

```
student/
├── src/                 # Express backend (Node.js)
├── frontend/            # React frontend (Vite)
├── uploads/             # File uploads (certifications, profile photos)
├── .env.example         # Environment variables template
└── README.md            # This file
```

---

## ✅ Prerequisites

- **Node.js** ≥ 20.x
- **npm** or **pnpm**
- **PostgreSQL** ≥ 14
- **Git**

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd student

# Install backend deps
npm install

# Install frontend deps
cd frontend
npm install
```

### 2. Setup Environment

```bash
# Copy example env
cp .env.example .env

# Edit .env with your values
nano .env
```

### 3. Setup Database

```bash
# Create DB (PostgreSQL)
createdb student

# Run migrations (from repo root)
npm run migrate
```

### 4. Run Backend

```bash
npm run dev
# → http://localhost:4000
```

### 5. Run Frontend

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

---

## 🧪 Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start backend in dev mode      |
| `npm run migrate` | Run Sequelize migrations       |
| `npm run seed`    | Seed database with sample data |
| `npm run test`    | Run backend tests              |
| `npm run build`   | Build frontend for production  |
| `npm run preview` | Preview built frontend         |

---

## 🐳 Docker (Preview)

```bash
# Build & run with Docker Compose (future step)
docker-compose up
```

---

## 🔧 Environment Variables

See `.env.example` for all required variables.

---

## 🛠 Troubleshooting

| Issue               | Solution                                   |
| ------------------- | ------------------------------------------ |
| `ECONNREFUSED`      | Ensure PostgreSQL is running               |
| `JWT_SECRET` errors | Regenerate secrets in `.env`               |
| CORS issues         | Check `CORS_ORIGIN` matches frontend URL   |
| Upload failures     | Verify `UPLOAD_DIR` exists and is writable |

---

## 📄 License

MIT
