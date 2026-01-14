# Azure AD SSO Integration Guide

This guide explains how to set up and configure Azure AD Single Sign-On (SSO) for the LegalAI application.

## Overview

The application uses Azure AD SSO with the following architecture:

- **Frontend**: Uses MSAL.js for Azure AD authentication in the browser
- **Backend**: Validates Azure AD tokens and issues JWT tokens for API access
- **Authentication Flow**: JSON-only API (no redirects, no HTML responses)
- **Role Assignment**: Automatic based on Azure AD group memberships
- **Department Detection**: Automatic from Azure AD user claims

## Prerequisites

1. Azure AD tenant with admin access
2. Node.js 18+ and npm installed
3. PostgreSQL database
4. Access to create app registrations in Azure AD

## Azure AD Configuration

### Step 1: Create an App Registration

1. Sign in to the [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: `LegalAI` (or your preferred name)
   - **Supported account types**:
     - Choose "Accounts in this organizational directory only" for single tenant
     - Or "Accounts in any organizational directory" for multi-tenant
   - **Redirect URI**:
     - Platform: Single-page application (SPA)
     - URI: `http://localhost:5173` (for local development)
     - Add production URLs when deploying
5. Click **Register**

### Step 2: Configure API Permissions

1. In your app registration, navigate to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add the following permissions:
   - `User.Read` (to read basic user profile)
   - `openid` (for OpenID Connect)
   - `profile` (for user profile information)
   - `email` (for user email)
   - `Directory.Read.All` (optional, for reading group memberships)
6. Click **Add permissions**
7. Click **Grant admin consent** (requires admin privileges)

### Step 3: Configure Authentication

1. Navigate to **Authentication** in your app registration
2. Under **Platform configurations**, ensure your SPA redirect URI is listed
3. Under **Implicit grant and hybrid flows**, check:
   - ✅ Access tokens
   - ✅ ID tokens
4. Under **Advanced settings**:
   - Set **Allow public client flows** to **No**
5. Click **Save**

### Step 4: Set Up Security Groups for Role Mapping

The application maps Azure AD groups to application roles:

- **Legal Admin**: Create a group named "Legal Admin" or "legal-admin"
- **Department Admin**: Create a group named "Dept Admin" or "department-admin"
- **User**: Default role for all authenticated users

To create groups:

1. Navigate to **Azure Active Directory** → **Groups**
2. Click **New group**
3. Select **Security** as group type
4. Enter group name (e.g., "Legal Admin")
5. Add members to the group
6. Click **Create**

### Step 5: Configure Department Field

To enable automatic department detection:

1. Navigate to **Azure Active Directory** → **Users**
2. Select a user
3. Click **Edit properties**
4. Under **Job info**, fill in the **Department** field
5. Save changes

Note: The department field will be automatically populated from your organization's HR system if Azure AD is synced with on-premises Active Directory.

### Step 6: Get Your Azure AD Configuration Values

You'll need two values from your app registration:

1. **Tenant ID**:
   - Navigate to **Overview** in your app registration
   - Copy the **Directory (tenant) ID**

2. **Client ID**:
   - Navigate to **Overview** in your app registration
   - Copy the **Application (client) ID**

## Application Configuration

### Backend Configuration

1. Navigate to the `backend` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Update the following variables in `.env`:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/legalai

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h

   # Azure AD Configuration
   AZURE_AD_TENANT_ID=your-tenant-id-from-azure-portal
   AZURE_AD_CLIENT_ID=your-client-id-from-azure-portal

   # Azure Storage (optional, for file uploads)
   AZURE_STORAGE_ACCOUNT_NAME=your-storage-account-name
   AZURE_STORAGE_ACCOUNT_KEY=your-storage-account-key
   AZURE_STORAGE_CONTAINER_NAME=legal-documents
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Run database migrations:
   ```bash
   node run-migration.js 006_add_azure_ad_fields.sql
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Configuration

1. Navigate to the `frontend` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Update the following variables in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_AZURE_AD_CLIENT_ID=your-client-id-from-azure-portal
   VITE_AZURE_AD_TENANT_ID=your-tenant-id-from-azure-portal
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Testing the Integration

### Local Development Testing

1. Ensure both backend and frontend servers are running
2. Open your browser and navigate to `http://localhost:5173`
3. You should see the login page with an Azure AD SSO button
4. Click the SSO button
5. You'll be redirected to Microsoft's login page
6. Sign in with your Azure AD credentials
7. Grant consent to the requested permissions (first time only)
8. You'll be redirected back to the application
9. The application will:
   - Validate your Azure AD token
   - Extract your user info, department, and groups
   - Assign you a role based on group membership
   - Issue a JWT token
   - Log you into the application

### Verify Role Assignment

After logging in:

1. Check the browser console for any errors
2. The application should display your user info including:
   - Name
   - Email
   - Department (from Azure AD)
   - Role (mapped from groups)
3. Navigate to different sections to verify your permissions

### Testing Different Roles

To test different roles:

1. **Test Legal Admin**:
   - Add your user to the "Legal Admin" group in Azure AD
   - Log out and log back in
   - Verify you have full admin access

2. **Test Department Admin**:
   - Remove from "Legal Admin", add to "Dept Admin" group
   - Log out and log back in
   - Verify you have department-level access

3. **Test Regular User**:
   - Remove from all admin groups
   - Log out and log back in
   - Verify you have basic user access

### Testing Department Auto-Detection

1. Update the department field for your user in Azure AD
2. Log out and log back in
3. Verify the department is correctly displayed in your profile

## Role Mapping Logic

The backend maps Azure AD groups to application roles using the following logic:

```typescript
// Priority order (first match wins):
1. If user is in a group containing "legal" AND "admin" → legal_admin
2. If user is in a group containing "dept" AND "admin" → dept_admin
3. If user is in a group containing "department" AND "admin" → dept_admin
4. Otherwise → user (default role)
```

Group names are case-insensitive and spaces are converted to hyphens for matching.

## Troubleshooting

### Common Issues

**1. "AADSTS50011: The redirect URI specified in the request does not match"**
- Solution: Add the exact redirect URI to your app registration's redirect URIs list

**2. "AADSTS65001: The user or administrator has not consented"**
- Solution: Grant admin consent for the API permissions in Azure AD

**3. "Azure AD token validation failed"**
- Check that AZURE_AD_TENANT_ID and AZURE_AD_CLIENT_ID are correct
- Verify the token is not expired
- Check backend logs for detailed error messages

**4. "User is assigned 'user' role instead of admin role"**
- Verify the user is a member of the correct Azure AD group
- Check that group names match the expected patterns
- Ensure groups are security groups (not Microsoft 365 groups)
- Log out and log back in to refresh the token

**5. "Department is not showing up"**
- Verify the department field is set in Azure AD user profile
- Department field must be populated before login
- Log out and log back in to refresh the token

**6. "Cannot read properties of undefined (reading 'loginPopup')"**
- MSAL.js initialization issue
- Check browser console for MSAL configuration errors
- Verify VITE_AZURE_AD_CLIENT_ID and VITE_AZURE_AD_TENANT_ID are set

### Debug Mode

To enable detailed logging:

**Backend:**
```typescript
// In backend/src/services/azureAdService.ts
// Add console.log statements to track token validation
```

**Frontend:**
```typescript
// In frontend/src/lib/azureAuthService.ts
// Check browser console for MSAL logs
```

## Security Best Practices

1. **Never commit .env files**: Keep your tenant ID and client ID secret
2. **Use HTTPS in production**: Azure AD requires HTTPS for production apps
3. **Implement token refresh**: Handle expired tokens gracefully
4. **Validate tokens server-side**: Never trust client-side authentication alone
5. **Use least privilege**: Grant only necessary API permissions
6. **Enable MFA**: Require multi-factor authentication for admin users
7. **Audit logs**: Monitor Azure AD sign-in logs for suspicious activity
8. **Rotate secrets**: Regularly update JWT_SECRET and other secrets

## Production Deployment

### Frontend

1. Add production redirect URIs to Azure AD app registration:
   ```
   https://your-domain.com
   ```

2. Update `.env` for production:
   ```env
   VITE_API_BASE_URL=https://api.your-domain.com
   VITE_AZURE_AD_CLIENT_ID=your-client-id
   VITE_AZURE_AD_TENANT_ID=your-tenant-id
   ```

3. Build and deploy:
   ```bash
   npm run build
   ```

### Backend

1. Update production environment variables
2. Ensure DATABASE_URL points to production database
3. Use strong, unique JWT_SECRET
4. Enable HTTPS/TLS
5. Set NODE_ENV=production

## API Endpoints

### POST /api/auth/azure

Authenticate with Azure AD access token.

**Request:**
```json
{
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@company.com",
      "name": "John Doe",
      "role": "legal_admin",
      "department": "Legal",
      "is_sso_user": true
    }
  },
  "message": "Azure AD login successful"
}
```

### GET /api/auth/me

Get current authenticated user (requires JWT token).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@company.com",
    "name": "John Doe",
    "role": "legal_admin",
    "department": "Legal",
    "is_sso_user": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

## Success Criteria

The POC is considered complete when:

- ✅ Users can log in via Azure AD SSO
- ✅ Department is automatically detected from Azure AD
- ✅ Role is correctly assigned based on Azure AD group membership
- ✅ Backend returns JSON-only responses (no HTML, no redirects)
- ✅ All API endpoints require Bearer JWT authentication
- ✅ Frontend manages authentication state using JWT
- ✅ Logout clears both Azure AD session and application JWT

## Support and Resources

- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Microsoft Graph API Reference](https://docs.microsoft.com/en-us/graph/api/overview)

## License

This integration follows the same license as the main application.
