# Haytask - Project Management Backend

Complete backend API for task and project management system.

## 🚀 Features
- User authentication (JWT)
- Workspace management
- Project & board creation
- Kanban task management
- Organization verification
- Role-based permissions

## 🛠️ Tech Stack
- Node.js + Express
- PostgreSQL + Prisma
- JWT Authentication
- bcrypt Security

## ⚡ Quick Start

1. **Install dependencies**
```bash
npm install
```

2. **Setup environment**
```bash
# Create .env file with:
DATABASE_URL="your-postgresql-url"
JWT_SECRET="your-secret-key"
PORT=3000
```

3. **Setup database**
```bash
npx prisma generate
npx prisma db push
```

4. **Start server**
```bash
npm run dev
```

## 📖 API Documentation
See [API_DOCS.md](API_DOCS.md) for complete API reference.

## 👥 Team
- **Yordanos**: Authentication & Security
- **Hanna**: Database & Architecture

## 📋 Weekly Progress
See [WEEKLY_TASKS.md](WEEKLY_TASKS.md) for detailed weekly tasks.
