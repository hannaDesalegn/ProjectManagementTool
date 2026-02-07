# 🚀 HayTask - Project Management API

A robust, scalable **SaaS project management backend** built with modern technologies and enterprise-grade architecture.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 📧 **Email Verification** - Secure token-based email verification flow
- 🔑 **Password Reset** - Complete password recovery system
- 👥 **Multi-Tenancy** - Workspace-based data isolation
- 🛡️ **Role-Based Access Control (RBAC)** - Granular permission system
- 📊 **Audit Logging** - Track all user activities
- 🗄️ **PostgreSQL + Prisma ORM** - Type-safe database operations
- ✅ **Input Validation** - Express-validator for request validation

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Email:** Nodemailer
- **Validation:** express-validator

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Gmail account (for SMTP)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/hannaDesalegn/ProjectManagementTool.git
cd ProjectManagementTool
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET=your-super-secret-jwt-key
APP_URL=http://localhost:3000
PORT=3000

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=HayTask <your-email@gmail.com>
```

### 4. Database Setup
```bash
# Run migrations
npx prisma migrate dev

# (Optional) Seed database
node seed.js
```

### 5. Start the server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3000`

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/request-verification` | Request email verification | ❌ |
| GET | `/api/auth/verify-email?token=` | Verify email | ❌ |
| POST | `/api/auth/request-password-reset` | Request password reset | ❌ |
| POST | `/api/auth/reset-password` | Reset password | ❌ |
| GET | `/api/protected` | Test protected route | ✅ |

### Example Requests

**Register:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "termsAccepted": true
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Protected Route:**
```bash
GET /api/protected
Headers: {
  "Authorization": "Bearer <your-jwt-token>"
}
```

## 🗄️ Database Schema

The project uses a comprehensive schema designed for SaaS applications:

- **User** - User accounts with authentication
- **Workspace** - Multi-tenant workspaces (FREE/PRO/BUSINESS plans)
- **Membership** - User-workspace relationships with roles
- **Team** - Team organization within workspaces
- **Project** - Project management
- **Board** - Kanban-style boards
- **List** - Task lists within boards
- **Card** - Individual tasks/cards
- **ActivityLog** - Audit trail for all actions

## 🏗️ Project Structure

```
src/
├── config/          # Configuration files (Prisma client)
├── controllers/     # Request handlers
├── services/        # Business logic layer
├── routes/          # API route definitions
├── middleware/      # Custom middleware (auth, error handling)
└── utils/           # Utility functions (JWT, hashing, email, logging)
```

## 🔒 Security Features

- ✅ **Password Hashing** - bcrypt with 10 salt rounds
- ✅ **JWT Tokens** - 1-hour expiration
- ✅ **Input Validation** - Strong password requirements
- ✅ **SQL Injection Prevention** - Prisma ORM parameterized queries
- ✅ **Secure Tokens** - Cryptographically secure random tokens
- ✅ **Soft Deletes** - Data retention for audit purposes

## 🧪 Testing

Use **Postman** or **Thunder Client** to test the API:

1. Start the server: `npm run dev`
2. Import the API collection (or create requests manually)
3. Test the authentication flow:
   - Register → Login → Get Token → Access Protected Route
   - Email Verification → Password Reset

## 📦 Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Hanna Desalegn**
- GitHub: [@hannaDesalegn](https://github.com/hannaDesalegn)

## 🙏 Acknowledgments

- Built with modern Node.js best practices
- Inspired by enterprise SaaS architectures
- Designed for scalability and maintainability

---

⭐ **Star this repo** if you find it helpful!