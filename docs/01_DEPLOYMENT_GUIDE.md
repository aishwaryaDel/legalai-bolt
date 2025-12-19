# Deployment Guide

This guide provides complete instructions for deploying the LegalAI platform in different environments.
---

## Prerequisites

### Development Environment
- **Node.js**: 20.x or higher
- **npm**: 9.x or higher
- **PostgreSQL**: 12.x or higher
- **Git**: Latest version

### Production Environment
- **Docker**: 24.x or higher
- **Docker Compose**: 2.x or higher (optional)
- **Azure CLI**: Latest version (for Azure deployment)
- **Azure Subscription**: Active subscription with sufficient quota

### Azure Services Required
- **Azure Container Registry** (ACR)
- **Azure Container Apps** (for hosting)
- **Azure Database for PostgreSQL** (or self-managed PostgreSQL)
- **Azure Blob Storage** (for document storage)

---

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=legalai
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Azure AI Projects
AZURE_AI_PROJECT_CONNECTION_STRING=your_connection_string

# Azure Storage (for document uploads)
AZURE_STORAGE_ACCOUNT_NAME=your_storage_account
AZURE_STORAGE_ACCOUNT_KEY=your_storage_key
AZURE_STORAGE_CONTAINER_NAME=legal-documents

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=pdf,docx,doc,txt
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
```


**Backend Production**:
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=<url-here>
DB_SSL=true
JWT_SECRET=<generate-with-openssl-rand-base64-32>
```

**Frontend Production**:
```env
VITE_API_BASE_URL=<url-here>
```

---

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE legalai;

# Create user (if needed)
CREATE USER legalai_user WITH PASSWORD 'secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE legalai TO legalai_user;

# Connect to the database
\c legalai
```

### 2. Run Migrations

Execute migration files in order:

```bash
# Navigate to backend directory
cd backend

# Run migrations
psql -h localhost -U postgres -d legalai -f migrations/001_create_users_table.sql
psql -h localhost -U postgres -d legalai -f migrations/002_create_roles_and_user_roles.sql
psql -h localhost -U postgres -d legalai -f migrations/004_seed_test_users.sql
psql -h localhost -U postgres -d legalai -f migrations/005_create_user_permissions.sql
```

Alternatively, use the migration script:

```bash
node run-migration.js
```

## Backend Deployment

### Development Mode

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev
```

The backend will start at `http://localhost:3001`.

### Production Build

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```