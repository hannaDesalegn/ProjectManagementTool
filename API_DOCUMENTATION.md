# TaskFlow API - Command Line Guide

Base URL: `http://localhost:3000`

## 🚀 Complete Step-by-Step Commands

### Step 1: Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'
```

### Step 2: Login to Get Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```
**📝 Copy the token from the response and use it in all commands below!**

### Step 3: Create a Workspace
```bash
curl -X POST http://localhost:3000/api/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name": "My Personal Workspace", "type": "PERSONAL"}'
```
**📝 Copy the workspace `id` from the response!**

### Step 4: Get Your Workspaces
```bash
curl -X GET http://localhost:3000/api/workspaces \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 5: Create a Project> 

### Step 6: Get Workspace Projects
```bash
curl -X GET http://localhost:3000/api/projects/workspace/YOUR_WORKSPACE_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 7: Create a Board (Kanban)
```bash
curl -X POST http://localhost:3000/api/boards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Sprint 1 Board",
    "project_id": "YOUR_PROJECT_ID_HERE",
    "workspace_id": "YOUR_WORKSPACE_ID_HERE"
  }'
```
**📝 Copy the board `id` from the response!**

### Step 8: View Your Board (with lists)
```bash
curl -X GET http://localhost:3000/api/boards/YOUR_BOARD_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
**📝 Copy a list `id` from the response (To Do, In Progress, or Done)!**

### Step 9: Create a Task Card
```bash
curl -X POST http://localhost:3000/api/boards/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Design Homepage",
    "description": "Create mockup for the homepage design",
    "list_id": "YOUR_LIST_ID_HERE"
  }'
```

### Step 10: Create Another Card
```bash
curl -X POST http://localhost:3000/api/boards/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Setup Database",
    "description": "Configure PostgreSQL database",
    "list_id": "YOUR_LIST_ID_HERE"
  }'
```

### Step 11: Move a Card to Different List
```bash
curl -X PATCH http://localhost:3000/api/boards/cards/YOUR_CARD_ID_HERE/move \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"new_list_id": "YOUR_NEW_LIST_ID_HERE"}'
```

### Step 12: View Updated Board
```bash
curl -X GET http://localhost:3000/api/boards/YOUR_BOARD_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Additional Commands

### Create Organization Workspace
```bash
curl -X POST http://localhost:3000/api/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "My Company",
    "type": "ORGANIZATION",
    "legal_name": "My Company Inc",
    "org_domain": "mycompany.com",
    "website": "https://mycompany.com"
  }'
```

### Invite User to Workspace
```bash
curl -X POST http://localhost:3000/api/workspaces/YOUR_WORKSPACE_ID_HERE/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"email": "teammate@example.com", "role": "Member"}'
```

### Add Member to Project
```bash
curl -X POST http://localhost:3000/api/projects/YOUR_PROJECT_ID_HERE/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"user_id": "USER_ID_HERE", "role": "Contributor"}'
```

### Create Custom List
```bash
curl -X POST http://localhost:3000/api/boards/lists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name": "Review", "board_id": "YOUR_BOARD_ID_HERE"}'
```

### Test Protected Route
```bash
curl -X GET http://localhost:3000/api/protected \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📋 Quick Copy-Paste Workflow

**1. Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'
```

**2. Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email": "john@example.com", "password": "password123"}'
```

**3. Create Workspace:**
```bash
curl -X POST http://localhost:3000/api/workspaces -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{"name": "My Workspace", "type": "PERSONAL"}'
```

**4. Create Project:**
```bash
curl -X POST http://localhost:3000/api/projects -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{"name": "My Project", "description": "Test project", "workspace_id": "WORKSPACE_ID", "start_date": "2026-02-06", "end_date": "2026-12-31"}'
```

**5. Create Board:**
```bash
curl -X POST http://localhost:3000/api/boards -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{"name": "My Board", "project_id": "PROJECT_ID", "workspace_id": "WORKSPACE_ID"}'
```

---

## ⚠️ Important Notes

- **Token expires in 10 minutes** - login again if you get "Invalid or expired token"
- **Replace placeholders:** `YOUR_TOKEN_HERE`, `YOUR_WORKSPACE_ID_HERE`, etc.
- **Copy IDs:** Always copy the `id` values from responses to use in subsequent commands
- **JSON format:** Make sure your JSON is properly formatted with quotes around strings

## 🐛 Common Errors

- `"Invalid or expired token"` → Login again to get a new token
- `"Access denied to this workspace"` → Use the correct workspace ID that belongs to your user
- `"The table does not exist"` → Run `npx prisma db push` to create database tables
- `"Failed to connect to localhost"` → Make sure your server is running with `npx nodemon src/server.js`
