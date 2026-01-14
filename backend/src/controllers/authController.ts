import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { azureAdService } from '../services/azureAdService';

/**
 * Login controller - Authenticate user with email and password
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    // Find user by email
    const user = await userService.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return success with token and user data (exclude password)
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during login',
    });
  }
}

/**
 * Azure AD SSO Login - Authenticate user with Azure AD token
 * POST /api/auth/azure
 */
export async function azureLogin(req: Request, res: Response): Promise<void> {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      res.status(400).json({
        success: false,
        error: 'Azure AD access token is required',
      });
      return;
    }

    const userInfo = await azureAdService.getUserInfoFromToken(accessToken);

    let user = await userService.getUserByEmail(userInfo.email);

    if (!user && userInfo.azureAdId) {
      const existingAzureUser = await userService.getUserByAzureAdId(userInfo.azureAdId);
      if (existingAzureUser) {
        user = existingAzureUser;
      }
    }

    if (!user) {
      user = await userService.createUser({
        email: userInfo.email,
        name: userInfo.name,
        role: userInfo.role,
        azure_ad_id: userInfo.azureAdId,
        department: userInfo.department,
        is_sso_user: true,
      });
    } else {
      user = await userService.updateUser(user.id, {
        azure_ad_id: userInfo.azureAdId,
        department: userInfo.department,
        role: userInfo.role,
        is_sso_user: true,
      });
    }

    if (!user) {
      res.status(500).json({
        success: false,
        error: 'Failed to create or update user',
      });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          is_sso_user: user.is_sso_user,
        },
      },
      message: 'Azure AD login successful',
    });
  } catch (error) {
    console.error('Azure AD login error:', error);
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Azure AD authentication failed',
    });
  }
}

/**
 * Logout controller - Client-side token removal
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  // With JWT, logout is primarily client-side (removing token)
  // This endpoint can be used for logging purposes or future token blacklisting
  res.json({
    success: true,
    message: 'Logout successful',
  });
}

/**
 * Get current user controller - Returns authenticated user's information
 * GET /api/auth/me
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    // User is attached to request by authMiddleware
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Return user data (exclude password)
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        is_sso_user: user.is_sso_user,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while fetching user data',
    });
  }
}

/**
 * SSO Migration Note:
 * When migrating to SSO:
 * 1. Replace login() with SSO redirect/callback handler
 * 2. Exchange SSO authorization code for tokens
 * 3. Extract user info from SSO claims
 * 4. Keep the same response format for frontend compatibility
 * 5. Logout should redirect to SSO logout endpoint
 * 6. getMe() can remain similar, extracting user from SSO token
 */
