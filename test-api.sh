#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Testing TaskFlow API ===${NC}\n"

# 1. Register
echo -e "${GREEN}1. Registering new user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "test123"}')
echo $REGISTER_RESPONSE | jq .
echo ""

# 2. Login
echo -e "${GREEN}2. Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}')
echo $LOGIN_RESPONSE | jq .

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo -e "\n${BLUE}Token: $TOKEN${NC}\n"

# 3. Test protected route
echo -e "${GREEN}3. Testing protected route...${NC}"
curl -s -X GET http://localhost:3000/api/protected \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 4. Create workspace
echo -e "${GREEN}4. Creating workspace...${NC}"
WORKSPACE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "My Test Workspace", "type": "PERSONAL"}')
echo $WORKSPACE_RESPONSE | jq .
echo ""

# 5. Get workspaces
echo -e "${GREEN}5. Getting user workspaces...${NC}"
curl -s -X GET http://localhost:3000/api/workspaces \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo -e "${BLUE}=== Test Complete ===${NC}"
