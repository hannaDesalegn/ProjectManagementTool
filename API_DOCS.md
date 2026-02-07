# TaskFlow API Documentation

Base URL: `http://localhost:3000`

## 🔐 Authentication

### Register
```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
# Returns: {"token": "jwt-token", "user": {...}}
```

**Use token in all requests:**
```
Authorization: Bearer <your-jwt-token>
```

---

## 🏢 Workspaces

### Create Workspace
```bash
POST /api/workspaces
Authorization: Bearer <token>
{
  "name": "My Workspace",
  "type": "PERSONAL"
}
# Types: PERSONAL, TEAM, ORGANIZATION
```

### Get User Workspaces
```bash
GET /api/workspaces
Authorization: Bearer <token>
```

### Get Workspace Details
```bash
GET /api/workspaces/:workspaceId
Authorization: Bearer <token>
```

### Invite User to Workspace
```bash
POST /api/workspaces/:workspaceId/invite
Authorization: Bearer <token>
{
  "email": "user@example.com",
  "role": "Member"
}
# Roles: Admin, Member, Viewer
```

---

## 📋 Projects

### Create Project
```bash
POST /api/projects
Authorization: Bearer <token>
{
  "name": "Website Project",
  "description": "Build new website",
  "workspace_id": "workspace-uuid",
  "start_date": "2026-02-06",
  "end_date": "2026-12-31"
}
```

### Get Workspace Projects
```bash
GET /api/projects/workspace/:workspaceId
Authorization: Bearer <token>
```

### Get Project Details
```bash
GET /api/projects/:projectId
Authorization: Bearer <token>
```

---

## 📊 Boards

### Create Board
```bash
POST /api/boards
Authorization: Bearer <token>
{
  "name": "Sprint Board",
  "project_id": "project-uuid",
  "workspace_id": "workspace-uuid"
}
# Auto-creates: "To Do", "In Progress", "Done" lists
```

### Get Board with Lists & Cards
```bash
GET /api/boards/:boardId
Authorization: Bearer <token>
```

### Create Card
```bash
POST /api/boards/cards
Authorization: Bearer <token>
{
  "title": "Task Title",
  "description": "Task description",
  "list_id": "list-uuid"
}
```

### Move Card
```bash
PATCH /api/boards/cards/:cardId/move
Authorization: Bearer <token>
{
  "new_list_id": "list-uuid"
}
```

---

## 🔧 Organization Verification

### Request Verification
```bash
POST /api/workspaces/:workspaceId/verification/request
Authorization: Bearer <token>
{
  "legal_name": "Company Inc",
  "registration_id": "REG123456",
  "website": "https://company.com",
  "org_domain": "company.com"
}
```

### Get Verification Status
```bash
GET /api/workspaces/:workspaceId/verification
Authorization: Bearer <token>
```

---

## ⚡ Quick Start

1. **Register & Login**
2. **Create Workspace**
3. **Create Project**
4. **Create Board**
5. **Add Cards & Manage Tasks**

## 🚨 Error Format
```json
{
  "error": "Error message here"
}
```

**Token expires in 10 minutes - login again if expired**