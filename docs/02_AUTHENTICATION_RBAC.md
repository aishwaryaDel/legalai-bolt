# Authentication & Role-Based Access Control (RBAC)

This document details the authentication system and comprehensive RBAC implementation in the LegalAI platform.


## Authentication Overview

### JWT-Based Authentication

The platform uses **JSON Web Tokens (JWT)** for stateless authentication:

```typescript
// Token Structure
{
  userId: string,    // User's unique identifier
  email: string,     // User's email address
  role: string,      // User's primary role
  iat: number,       // Issued at timestamp
  exp: number        // Expiration timestamp
}
```

### Authentication Flow

```
1. User Login
   ↓
2. Backend Validates Credentials
   ↓
3. JWT Token Generated (7-day expiry)
   ↓
4. Token Sent to Frontend
   ↓
5. Frontend Stores Token (localStorage)
   ↓
6. Token Included in API Requests (Authorization header)
   ↓
7. Backend Validates Token on Each Request
   ↓
8. Request Processed or Rejected
```

### Login Endpoints

**POST `/api/auth/login`**

Request:
```json
{
  "email": "user@tesa.com",
  "password": "SecurePassword123"
}
```

Response (Success):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@tesa.com",
      "name": "John Doe",
      "role": "legal_admin"
    }
  },
  "message": "Login successful"
}
```

**GET `/api/auth/me`** (Get Current User)

Headers:
```
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@tesa.com",
    "name": "John Doe",
    "role": "legal_admin",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## RBAC Architecture

### Three-Tier Permission Model

1. **Role-Based Permissions**: Predefined roles with standard permissions
2. **Custom User Permissions**: Granular permissions assigned directly to users
3. **Hybrid Mode**: Combines role and custom permissions

### Database Schema

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT,  -- Optional: for backward compatibility
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Roles Table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB,  -- Flexible permission structure
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User-Role Mapping (Many-to-Many)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, role_id)
);

-- Custom User Permissions
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by UUID REFERENCES users(id),
  UNIQUE(user_id, permission_key)
);
```

## API Endpoints

### User Roles Management

**GET `/api/user-roles/user/:userId`** - Get all roles for a user

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "role-assignment-uuid",
      "user_id": "user-uuid",
      "role_id": "role-uuid",
      "assigned_at": "2024-01-15T10:30:00Z",
      "is_active": true,
      "role": {
        "id": "role-uuid",
        "name": "legal_admin",
        "description": "Legal department administrator",
        "permissions": { /* ... */ }
      }
    }
  ]
}
```

**GET `/api/user-roles/user/:userId/active`** - Get active roles only

**POST `/api/user-roles`** - Assign role to user

Request:
```json
{
  "user_id": "user-uuid",
  "role_id": "role-uuid"
}
```

**DELETE `/api/user-roles/:id`** - Remove role assignment

---

### User Permissions Management

**GET `/api/users/:userId/permissions`** - Get custom permissions

Response:
```json
{
  "success": true,
  "data": ["/copilot", "/review", "/builder", "/repository"]
}
```

**POST `/api/users/:userId/permissions`** - Grant custom permission

Request:
```json
{
  "permission_key": "/analytics"
}
```

**DELETE `/api/users/:userId/permissions/:permission_key`** - Revoke permission

---

### Roles Management

**GET `/api/roles`** - List all roles

**GET `/api/roles/:id`** - Get specific role

**POST `/api/roles`** - Create new role

Request:
```json
{
  "name": "contract_reviewer",
  "description": "Specialized contract reviewer role",
  "permissions": {
    "contracts:read": true,
    "contracts:write": true,
    "ai:analyze": true,
    "playbooks:read": true
  }
}
```

**PUT `/api/roles/:id`** - Update role

**DELETE `/api/roles/:id`** - Delete role (soft delete)

---

## Custom Permissions

### When to Use Custom Permissions

Use custom permissions for:
- **Exceptions**: User needs permissions outside their role
- **Temporary Access**: Grant access for specific projects
- **Granular Control**: Fine-tune access per user
- **Compliance**: Meet regulatory requirements for access control

### Granting Custom Permissions

```typescript
// Example: Grant analytics access to a department user
POST /api/users/user-uuid/permissions
{
  "permission_key": "/analytics"
}
```

### Permission Precedence

1. **Custom User Permissions** (highest priority)
2. **Role-Based Permissions** (from user_roles)
3. **Legacy Role Field** (users.role column)
4. **Default Deny** (if none above grant access)
---

## Migration from SSO (Future)

The current JWT system is designed for easy migration to SSO:

```typescript
// Current JWT flow can be replaced with:
// 1. Redirect to SSO provider (Azure AD, Okta, etc.)
// 2. Handle OAuth callback
// 3. Exchange code for SSO token
// 4. Extract user info from SSO claims
// 5. Create user session with same structure
// 6. Continue using same permission system
```

The RBAC system remains unchanged during SSO migration.
