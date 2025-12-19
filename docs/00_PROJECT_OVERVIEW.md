# LegalAI Platform - Project Overview

## Introduction

LegalAI is an enterprise-grade legal automation platform designed to streamline contract management, legal review, document generation, and AI-powered legal assistance. Built for legal teams, the platform combines artificial intelligence with robust role-based access control to deliver secure, compliant, and efficient legal operations.

## Project Vision

To transform legal operations through intelligent automation while maintaining the highest standards of security, compliance, and user experience. The platform empowers legal teams to:

- **Reduce contract review time** by up to 70% through AI-powered analysis
- **Standardize legal processes** with customizable templates and playbooks
- **Ensure compliance** through jurisdiction-aware document generation
- **Enhance collaboration** between legal teams and business stakeholders
- **Maintain audit trails** for all legal operations and decisions

## Core Value Propositions

### For Legal Teams
- **AI-Powered Contract Review**: Automated clause analysis and risk detection
- **Document Builder**: Generate compliant legal documents in minutes
- **Playbook Management**: Standardize review processes across the organization
- **Multi-Jurisdiction Support**: Handle contracts across different legal systems
- **Intelligent Search**: Find relevant clauses and precedents instantly

### For Business Users
- **Self-Service Contract Generation**: Create standard agreements without legal involvement
- **Contract Status Tracking**: Monitor all contracts in one centralized repository
- **Intake Management**: Streamlined contract request workflow
- **Analytics & Insights**: Understand contract portfolio health and risks

### For Administrators
- **Fine-Grained Access Control**: RBAC system with custom permissions
- **Audit Trails**: Complete visibility into all platform activities
- **Integration Ready**: API-first architecture for enterprise integrations
- **Multi-Model AI**: Choose from multiple AI providers and models

## Technical Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  - TypeScript, React Router, TailwindCSS                    │
│  - Real-time chat with Socket.IO                            │
│  - Multi-language support (EN/DE)                           │
│  - Dark/Light theme                                         │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/WSS
┌────────────────────┴────────────────────────────────────────┐
│                  Backend API (Node.js + Express)            │
│  - RESTful API with TypeScript                              │
│  - JWT Authentication                                       │
│  - Role-Based Access Control (RBAC)                         │
│  - Socket.IO for real-time communication                    │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        │            │            │              │
   ┌────▼─────┐  ┌───▼─────┐  ┌───▼──────┐  ┌───▼────────┐
   │PostgreSQL│  │Azure AI │  │ Azure    │  │ Azure      │
   │ Database │  │Projects │  │ Storage  │  │ OpenAI     │
   └──────────┘  └─────────┘  └──────────┘  └────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 18.3+ with TypeScript
- **Build Tool**: Vite 5.4+
- **Styling**: TailwindCSS 3.4+
- **Routing**: React Router DOM 7.9+
- **Icons**: Lucide React
- **Real-time**: Socket.IO Client
- **State Management**: React Context API

#### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.19+
- **Language**: TypeScript 5.9+
- **Database ORM**: Sequelize 6.37+
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.IO 4.8+
- **Security**: Helmet, CORS
- **File Upload**: Multer
- **Testing**: Jest 30+

#### Database
- **Primary Database**: PostgreSQL 8+

#### AI & Cloud Services
- **Azure AI Projects**: Multi-model AI orchestration
- **Azure Storage Blob**: Document storage
- **DeepL API**: High-quality German translations

#### DevOps & Deployment
- **Containerization**: Docker (multi-stage builds)
- **CI/CD**: GitHub Actions
- **Container Registry**: Azure Container Registry
- **Hosting**: Azure Container Apps
- **Reverse Proxy**: Nginx (for frontend static files)


## Project Structure

```
legalai-bolt/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── repository/        # Data access layer
│   │   ├── models/            # Sequelize models
│   │   ├── routes/            # API routes
│   │   ├── middlewares/       # Auth, error handling
│   │   ├── types/             # TypeScript definitions
│   │   └── config/            # Configuration files
│   ├── migrations/            # Database migrations
│   ├── __tests__/             # Jest tests
│   ├── Dockerfile             # Container image
│   └── package.json
│
├── frontend/                  # React/Vite SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── contexts/         # React contexts (Auth, Theme, Locale)
│   │   ├── lib/              # Utilities, config, services
│   │   └── types/            # TypeScript definitions
│   ├── public/               # Static assets
│   ├── Dockerfile            # Container image
│   ├── nginx.conf            # Nginx configuration
│   └── package.json
│
├── .github/workflows/         # CI/CD pipelines
├── docs/                      # This documentation
└── README.md
```

## Deployment Architecture

### Container-Based Deployment

Both frontend and backend are containerized using multi-stage Docker builds:

```dockerfile
# Backend: Build stage → Runtime stage
Build: TypeScript compilation, dependency installation
Runtime: Only production dependencies, compiled JavaScript

# Frontend: Build stage → Nginx runtime
Build: Vite production build with optimizations
Runtime: Nginx serving static files
```

### CI/CD Pipeline

GitHub Actions workflows automate deployment:

1. **Trigger**: Push to `dev`, `main`, or `prod` branches
2. **Build**: Docker image creation with environment-specific configs
3. **Push**: Upload to Azure Container Registry
4. **Deploy**: Update Azure Container Apps
5. **Verify**: Health checks and smoke tests

### Environment Configuration

- **Development**: `dev` branch → Azure Container Apps (dev environment)
- **Production**: `prod` branch → Azure Container Apps (prod environment)
- **Environment Variables**: Managed via GitHub Secrets and Azure App Configuration

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 12+
- Docker (optional, for containerized development)
- Azure subscription (for cloud services)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/aishwaryaDel/legalai-bolt.git
   cd legalai-bolt
   ```

2. **Set up backend**
   ```bash
   cd backend
   npm install
   # Configure .env file
   npm run dev
   ```

3. **Set up frontend**
   ```bash
   cd frontend
   npm install
   # Configure .env file
   npm run dev
   ```

4. **Run database migrations**
   ```bash
   # Connect to PostgreSQL and run migration files
   psql -h localhost -U postgres -d legalai -f backend/migrations/001_create_users_table.sql
   psql -h localhost -U postgres -d legalai -f backend/migrations/002_create_roles_and_user_roles.sql
   ```

For detailed setup instructions, see `01_DEPLOYMENT_GUIDE.md`.
