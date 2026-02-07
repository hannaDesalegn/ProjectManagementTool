# HayTask

A complete project management backend API built with Node.js, Express, Prisma, and PostgreSQL (Neon). Features include user authentication, workspaces, projects, Kanban boards, and task management.


## 🚀 Features

- **User Authentication** - JWT-based registration and login
- **Workspaces** - Personal, Team, and Organization workspaces
- **Projects** - Create and manage projects within workspaces
- **Kanban Boards** - Visual task management with drag-and-drop lists
- **Task Cards** - Create, assign, and move tasks between lists
- **Role-based Access** - Different permission levels for users
- **Database Integration** - PostgreSQL with Neon cloud database

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Environment:** ES Modules

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Neon Database Account** (free tier available)

## ⚡ Quick Start

### Step 1: Clone the Repository
```bash
git clone https://github.com/hannaDesalegn/ProjectManagementTool.git
cd ProjectManagementTool
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Setup
Create a `.env` file in the root directory:
```bash
# Database URL (replace with your Neon database URL)
DATABASE_URL="postgresql://username:password@hostname:5432/database_name?sslmode=require"

# JWT Secret (change this to a secure random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Port
PORT=3000
```

**🔗 Get your Neon Database URL:**
1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project (if you don't have one)
3. Copy the connection string from Dashboard
4. Paste it in your `.env` file

### Step 4: Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push
```

### Step 5: Start the Server
```bash
# Development mode (with auto-restart)
npx nodemon src/server.js

# Or production mode
npm start
```

You should see:
```
Server running on http://localhost:3000
TaskFlow API is running 🚀
```

## 🧪 Testing the API

### Method 1: Using curl (Command Line)

**1. Register a user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'
```

**2. Login to get token:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

**3. Create a workspace:**
```bash
curl -X POST http://localhost:3000/api/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name": "My Workspace", "type": "PERSONAL"}'
```

### Method 2: Using the Test Script
```bash
# Make the script executable
chmod +x test-api.sh

# Run the complete test
./test-api.sh
```

### Method 3: Using Postman/Thunder Client
Import the API endpoints from `API_DOCUMENTATION.md`

## 📁 Project Structure

```
ProjectManagementTool/
├── src/
│   ├── config/          # Database and JWT configuration
│   │   ├── prisma.js
│   │   ├── jwt.js
│   │   └── db.js
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.js
│   │   ├── workspace.controller.js
│   │   ├── project.controller.js
│   │   └── board.controller.js
│   ├── services/        # Business logic
│   │   ├── auth.service.js
│   │   ├── workspace.service.js
│   │   ├── project.service.js
│   │   └── board.service.js
│   ├── middleware/      # Authentication middleware
│   │   └── auth.middleware.js
│   ├── routes/          # API routes
│   │   ├── auth.routes.js
│   │   ├── workspace.routes.js
│   │   ├── project.routes.js
│   │   └── board.routes.js
│   ├── utils/           # Utility functions
│   │   └── hash.js
│   ├── app.js           # Express app configuration
│   └── server.js        # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── .env                 # Environment variables
├── package.json
├── API_DOCUMENTATION.md # Complete API guide
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces` - Get user workspaces
- `GET /api/workspaces/:id` - Get workspace details
- `POST /api/workspaces/:id/invite` - Invite user to workspace

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects/workspace/:workspaceId` - Get workspace projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects/:id/members` - Add project member

### Boards & Tasks
- `POST /api/boards` - Create Kanban board
- `GET /api/boards/:id` - Get board with lists and cards
- `POST /api/boards/lists` - Create new list
- `POST /api/boards/cards` - Create task card
- `PATCH /api/boards/cards/:cardId/move` - Move card between lists

**📖 For detailed API usage with examples, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

## 🔧 Configuration

### JWT Token Expiration
Edit `src/config/jwt.js` to change token expiration:
```javascript
// Current: 10 minutes
expiresIn: "30m"

// Options: "30s", "5m", "1h", "24h", "7d"
```

### Database Schema
The database schema is defined in `prisma/schema.prisma`. After making changes:
```bash
npx prisma db push
```

## 🚨 Troubleshooting

### Common Issues

**1. "Failed to connect to localhost"**
- Make sure the server is running: `npx nodemon src/server.js`

**2. "The table does not exist"**
- Run database setup: `npx prisma db push`

**3. "Invalid or expired token"**
- Login again to get a fresh token (tokens expire in 10 minutes)

**4. "Access denied to this workspace"**
- Make sure you're using the correct workspace ID that belongs to your user

**5. Database connection errors**
- Verify your `DATABASE_URL` in `.env` file
- Check if your Neon database is active (not sleeping)

### Reset Database
```bash
npx prisma migrate reset
npx prisma db push
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Hanna Desalegn**
- GitHub: [@hannaDesalegn](https://github.com/hannaDesalegn)
- GitHub: [@yordi-7-cyber](https://github.com/yordi-7-cyber)

## 🙏 Acknowledgments

- Built with [Prisma](https://prisma.io/) for database management
- Hosted on [Neon](https://neon.tech/) for PostgreSQL database
- JWT authentication with [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

---

**🎉 Happy coding! If you find this project helpful, please give it a ⭐**
