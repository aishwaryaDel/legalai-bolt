import axios from 'axios';
import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';

const AZURE_AD_TENANT_ID = process.env.AZURE_AD_TENANT_ID || '';
const AZURE_AD_CLIENT_ID = process.env.AZURE_AD_CLIENT_ID || '';

const ROLE_MAPPING: { [key: string]: string } = {
  'legal-admin': 'legal_admin',
  'dept-admin': 'dept_admin',
  'user': 'user',
};

const DEFAULT_ROLE = 'user';

interface AzureAdTokenPayload {
  oid?: string;
  email?: string;
  preferred_username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  department?: string;
  groups?: string[];
  roles?: string[];
  tid?: string;
  aud?: string;
  iss?: string;
  exp?: number;
}

interface AzureAdUserInfo {
  azureAdId: string;
  email: string;
  name: string;
  department?: string;
  groups: string[];
  role: string;
}

export class AzureAdService {
  private jwksClient: jwksClient.JwksClient;

  constructor() {
    const jwksUri = `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/discovery/v2.0/keys`;
    this.jwksClient = jwksClient({
      jwksUri,
      cache: true,
      cacheMaxAge: 86400000,
    });
  }

  private getSigningKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void => {
    this.jwksClient.getSigningKey(header.kid!, (err, key) => {
      if (err) {
        callback(err);
        return;
      }
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    });
  };

  async validateToken(token: string): Promise<AzureAdTokenPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        this.getSigningKey,
        {
          audience: AZURE_AD_CLIENT_ID,
          issuer: `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/v2.0`,
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err) {
            reject(new Error(`Azure AD token validation failed: ${err.message}`));
            return;
          }
          resolve(decoded as AzureAdTokenPayload);
        }
      );
    });
  }

  async getUserInfoFromToken(token: string): Promise<AzureAdUserInfo> {
    try {
      const payload = await this.validateToken(token);

      const azureAdId = payload.oid || '';
      const email = payload.email || payload.preferred_username || '';
      const name = payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim();
      const department = payload.department || '';
      const groups = payload.groups || [];

      const role = this.mapGroupsToRole(groups, payload.roles);

      if (!azureAdId || !email) {
        throw new Error('Invalid token: missing required user information');
      }

      return {
        azureAdId,
        email,
        name,
        department,
        groups,
        role,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to extract user info: ${error.message}`);
      }
      throw new Error('Failed to extract user info from Azure AD token');
    }
  }

  async getUserInfoFromGraph(accessToken: string): Promise<Partial<AzureAdUserInfo>> {
    try {
      const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data;

      const groupsResponse = await axios.get('https://graph.microsoft.com/v1.0/me/memberOf', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(() => ({ data: { value: [] } }));

      const groups = groupsResponse.data.value
        .filter((item: any) => item['@odata.type'] === '#microsoft.graph.group')
        .map((group: any) => group.displayName || group.id);

      return {
        azureAdId: data.id,
        email: data.mail || data.userPrincipalName,
        name: data.displayName,
        department: data.department,
        groups,
      };
    } catch (error) {
      throw new Error('Failed to fetch user info from Microsoft Graph');
    }
  }

  private mapGroupsToRole(groups: string[], roles?: string[]): string {
    const allClaims = [...groups, ...(roles || [])];

    const normalizedClaims = allClaims.map(claim =>
      claim.toLowerCase().replace(/\s+/g, '-')
    );

    if (normalizedClaims.some(claim =>
      claim.includes('legal') && claim.includes('admin')
    )) {
      return 'legal_admin';
    }

    if (normalizedClaims.some(claim =>
      claim.includes('dept') && claim.includes('admin') ||
      claim.includes('department') && claim.includes('admin')
    )) {
      return 'dept_admin';
    }

    for (const claim of normalizedClaims) {
      if (ROLE_MAPPING[claim]) {
        return ROLE_MAPPING[claim];
      }
    }

    return DEFAULT_ROLE;
  }
}

export const azureAdService = new AzureAdService();
