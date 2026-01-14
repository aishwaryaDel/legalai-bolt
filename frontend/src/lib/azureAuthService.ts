import {
  PublicClientApplication,
  InteractionRequiredAuthError,
  AccountInfo,
  AuthenticationResult,
} from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_AD_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};

class AzureAuthService {
  private msalInstance: PublicClientApplication;
  private initialized: boolean = false;

  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.msalInstance.initialize();
      await this.msalInstance.handleRedirectPromise();
      this.initialized = true;
    } catch (error) {
      console.error('MSAL initialization error:', error);
      throw error;
    }
  }

  async loginPopup(): Promise<AuthenticationResult> {
    try {
      await this.initialize();
      const response = await this.msalInstance.loginPopup(loginRequest);
      return response;
    } catch (error) {
      console.error('Azure AD login error:', error);
      throw error;
    }
  }

  async loginRedirect(): Promise<void> {
    try {
      await this.initialize();
      await this.msalInstance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Azure AD login redirect error:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      await this.initialize();
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        return null;
      }

      const request = {
        scopes: loginRequest.scopes,
        account: accounts[0],
      };

      try {
        const response = await this.msalInstance.acquireTokenSilent(request);
        return response.accessToken;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          const response = await this.msalInstance.acquireTokenPopup(request);
          return response.accessToken;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.initialize();
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await this.msalInstance.logoutPopup({
          account: accounts[0],
        });
      }
    } catch (error) {
      console.error('Azure AD logout error:', error);
      throw error;
    }
  }

  getAccount(): AccountInfo | null {
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  isAuthenticated(): boolean {
    return this.msalInstance.getAllAccounts().length > 0;
  }
}

export const azureAuthService = new AzureAuthService();
