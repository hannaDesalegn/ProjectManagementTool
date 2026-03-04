# TaskFlow API Documentation

Base URL: `http://localhost:3000`

## 🔐 Authentication

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Test123",
  "termsAccepted": true
}

# Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}

# Note: User receives verification email. Must verify before login.
```

### Verify Email
```bash
GET /api/auth/verify-email?token=<verification-token>

# Response:
{
  "success": true,
  "message": "Email verified"
}

# User clicks link in email to verify
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Test123"
}

# Response:
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}

# Note: Email must be verified to login
```

### Verify Token
```bash
GET /api/auth/verify
Authorization: Bearer <token>

# Response:
{
  "success": true,
  "message": "Token is valid",
  "user": {...}
}
```

### Forgot Password
```bash
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "email": "john@example.com"
}

# Response:
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NewPass123"
}

# Response:
{
  "success": true,
  "message": "Password has been reset"
}
```

### Request Email Verification (Resend)
```bash
POST /api/auth/request-verification
Content-Type: application/json

{
  "email": "john@example.com"
}

# Response:
{
  "success": true,
  "message": "Verification email sent"
}
```

**Use token in all protected requests:**
```
Authorization: Bearer <your-jwt-token>
```

---

## 👤 User Management (Admin Only)

### Get All Users (Admin)
```bash
GET /api/users
Authorization: Bearer <admin-token>

# Response: Array of all users
```

### Delete User (Admin)
```bash
DELETE /api/users/:userId
Authorization: Bearer <admin-token>

# Response:
{
  "success": true,
  "message": "User deleted"
}

# Note: Only system admins can delete users
```

### Update User Role (Admin)
```bash
PATCH /api/users/:userId/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "is_system_admin": true
}

# Response:
{
  "success": true,
  "user": {...}
}
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

1. **Register** → Receive verification email
2. **Verify Email** → Click link in email
3. **Login** → Get JWT token
4. **Create Workspace**
5. **Create Project**
6. **Create Board**
7. **Add Cards & Manage Tasks**

## 🔒 Password Requirements
- Minimum 6 characters
- At least 1 uppercase letter
- At least 1 number

## 🚨 Error Format
```json
{
  "success": false,
  "message": "Error message here",
  "errors": [...]  // Validation errors if any
}
```

## ⏰ Token Expiration
- JWT tokens expire in **1 hour**
- Login again if token expires

## 🛡️ Rate Limiting

All authentication endpoints are rate-limited to prevent abuse:

### Rate Limits by Endpoint

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `/api/auth/login` | 5 attempts | 15 minutes | Only failed attempts count |
| `/api/auth/register` | 3 attempts | 1 hour | Prevents spam accounts |
| `/api/auth/request-password-reset` | 3 attempts | 1 hour | Prevents abuse |
| `/api/auth/reset-password` | 3 attempts | 1 hour | Prevents brute force |
| `/api/auth/request-verification` | 5 attempts | 10 minutes | Email verification resend |

### Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 5           # Maximum requests allowed
X-RateLimit-Remaining: 3       # Requests remaining
X-RateLimit-Reset: 2026-02-18T10:30:00Z  # When limit resets
```

### Rate Limit Exceeded Response

```json
{
  "error": "Too many authentication attempts, please try again later.",
  "retryAfter": 450  // Seconds until you can retry
}
```

**Status Code**: `429 Too Many Requests`

### Important Notes
- Successful logins don't count against the limit
- Rate limits are per IP address
- Trusted IPs can bypass rate limiting
- In production, uses Redis for distributed rate limiting

## 📧 Email Verification
- Users must verify email before login
- Verification link expires in 24 hours
- Can request new verification email if expired