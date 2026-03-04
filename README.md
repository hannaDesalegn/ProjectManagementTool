# HayTask - Project Management System

Complete full-stack project management system with real-time collaboration features.

## 🚀 Features
- ✅ User authentication (JWT)
- ✅ Workspace management
- ✅ Project & board creation
- ✅ Kanban task management
- ✅ Organization verification
- ✅ Role-based permissions
- ✅ Real-time WebSocket communication
- ✅ Responsive frontend UI

## 🛠️ Tech Stack
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Prisma
- **Frontend**: HTML5 + TailwindCSS + Vanilla JS
- **Authentication**: JWT + bcrypt
- **Real-time**: WebSocket

## ⚡ Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Create `.env` file with:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/haytask"
JWT_SECRET="your-secret-key"
PORT=3001
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 3. Setup Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Start the Application
```bash
# Quick start (recommended)
npm run quick-start

# Or manual start
npm run start
```

### 5. Access the Application
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3001/api
- **WebSocket**: ws://localhost:3001/ws

## 🧪 Testing

Test server functionality:
```bash
npm run test-server
```

## 📖 API Documentation
See [API_DOCS.md](API_DOCS.md) for complete API reference.

## 🎯 Current Status

### ✅ Completed Features
- User registration and login
- JWT authentication system
- Workspace creation and management
- Project creation and management
- Board creation (Kanban-style)
- Real-time WebSocket communication
- Responsive dashboard UI
- Team member invitations
- Role-based access control

### 🚧 In Progress (Week 2)
- Real-time board collaboration
- Advanced card management
- Activity logging system
- Search functionality
- Enhanced UI/UX

### 📋 Planned (Week 3-4)
- Production deployment
- Performance optimization
- Security audit
- Documentation completion

## 👥 Team
- **Yordanos Tesfaye**: Authentication & Frontend
- **Hanna Desalegn**: Database & Architecture

## 📋 Weekly Progress
See [WEEKLY_TASKS.md](WEEKLY_TASKS.md) for detailed weekly tasks and progress.

## 🔧 Development

### Available Scripts
- `npm run dev` - Development mode with auto-reload
- `npm run start` - Production mode
- `npm run quick-start` - Easy startup with logging
- `npm run test-server` - Test server functionality
- `npm run db:reset` - Reset database
- `npm run health` - Health check

### Project Structure
```
├── client/                 # Frontend files
│   ├── js/                # JavaScript modules
│   ├── styles/            # CSS files
│   └── *.html            # HTML pages
├── src/                   # Backend source
│   ├── controllers/       # Route controllers
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── utils/            # Utilities
│   └── websocket/        # WebSocket server
├── prisma/               # Database schema
└── logs/                 # Application logs
```

## 🚀 Deployment

The application is ready for deployment. Key features:
- Environment-based configuration
- Production-ready logging
- Security middleware
- Database migrations
- Health check endpoints

## 📞 Support

For issues or questions:
- **Yordanos**: +251 922 786 645
- **Hanna**: +251 912 679 116
- **Email**: support@haytask.com
