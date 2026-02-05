# TaskFlow API Documentation

Base URL: `http://localhost:3000`

## Authentication

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: 201
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200
{
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Note:** Use the token in all subsequent requests:
```
Authorization: Bearer <your-jwt-token>
```

---

## Workspaces

### Create Workspace
```
POST /api/workspaces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Company",
  "type": "ORGANIZATION",
  "legal_name": "My Company Inc",
  "org_domain": "mycompany.com",
  "website": "https://mycompany.com"
}

Types: PERSONAL, TEAM, ORGANIZATION

Response: 201
{
  "message": "Workspace created successfully",
  "workspace": { ... }
}
```

### Get User's Workspaces
```
GET /api/workspaces
Authorization: Bearer <token>

Response: 200
{
  "workspaces": [ ... ]
}
```

### Get Workspace Details
```
GET /api/workspaces/:id
Authorization: Bearer <token>

Response: 200
{
  "workspace": {
    "id": "uuid",
    "name": "My Company",
    "memberships": [ ... ],
    "projects": [ ... ],
    "teams": [ ... ]
  }
}
```

### Invite User to Workspace
```
POST /api/workspaces/:id/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "user@example.com",
  "role": "Member"
}

Roles: Owner, Admin, Member, Viewer

Response: 201
{
  "message": "User invited successfully",
  "membership": { ... }
}
```

---

## Projects

### Create Project
```
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Redesign company website",
  "workspace_id": "workspace-uuid",
  "start_date": "2024-01-01",
  "end_date": "2024-06-30",
  "team_id": "team-uuid" (optional)
}

Response: 201
{
  "message": "Project created successfully",
  "project": { ... }
}
```

### Get Workspace Projects
```
GET /api/projects/workspace/:workspaceId
Authorization: Bearer <token>

Response: 200
{
  "projects": [ ... ]
}
```

### Get Project Details
```
GET /api/projects/:id
Authorization: Bearer <token>

Response: 200
{
  "project": {
    "id": "uuid",
    "name": "Website Redesign",
    "boards": [ ... ],
    "project_memberships": [ ... ]
  }
}
```

### Add Project Member
```
POST /api/projects/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": "user-uuid",
  "role": "Contributor"
}

Roles: ProjectAdmin, Contributor, Viewer

Response: 201
{
  "message": "Member added successfully",
  "membership": { ... }
}
```

---

## Boards (Kanban)

### Create Board
```
POST /api/boards
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sprint 1",
  "project_id": "project-uuid",
  "workspace_id": "workspace-uuid"
}

Note: Automatically creates 3 default lists: "To Do", "In Progress", "Done"

Response: 201
{
  "message": "Board created successfully",
  "board": { ... }
}
```

### Get Board with Lists and Cards
```
GET /api/boards/:id
Authorization: Bearer <token>

Response: 200
{
  "board": {
    "id": "uuid",
    "name": "Sprint 1",
    "lists": [
      {
        "id": "list-uuid",
        "name": "To Do",
        "position": 1,
        "cards": [
          {
            "id": "card-uuid",
            "title": "Design homepage",
            "description": "Create mockups",
            "status": "ToDo",
            "assignee": { ... }
          }
        ]
      }
    ]
  }
}
```

### Create List
```
POST /api/boards/lists
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Review",
  "board_id": "board-uuid"
}

Response: 201
{
  "message": "List created successfully",
  "list": { ... }
}
```

### Create Card
```
POST /api/boards/cards
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Design homepage",
  "description": "Create mockups for the new homepage",
  "list_id": "list-uuid",
  "assigned_to": "user-uuid" (optional)
}

Response: 201
{
  "message": "Card created successfully",
  "card": { ... }
}
```

### Move Card to Different List
```
PATCH /api/boards/cards/:cardId/move
Authorization: Bearer <token>
Content-Type: application/json

{
  "new_list_id": "list-uuid"
}

Note: Card status automatically updates based on list name

Response: 200
{
  "message": "Card moved successfully",
  "card": { ... }
}
```

---

## Complete Workflow Example

1. **Register & Login**
   - Register a user
   - Login to get JWT token

2. **Create Workspace**
   - Create a workspace (you become the owner)

3. **Invite Team Members**
   - Invite other users to your workspace

4. **Create Project**
   - Create a project in your workspace
   - Add members to the project

5. **Create Board**
   - Create a Kanban board for the project
   - Default lists are created automatically

6. **Manage Tasks**
   - Create cards in lists
   - Assign cards to team members
   - Move cards between lists as work progresses

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error
