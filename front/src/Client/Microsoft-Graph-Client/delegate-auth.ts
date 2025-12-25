export interface AuthorizationRedirectResponse {
  authorization_url: string;
}

export class MicrosoftGraphDelegateAuth {
  private tenantId: string;
  private clientId: string;
  private scope: string;
  private redirectUri: string;

  constructor() {
    this.tenantId = process.env.TENANT_ID || '';
    this.clientId = process.env.CLIENT_ID || '';
    this.scope = process.env.SCOPE || 'User.Read';
    this.redirectUri = process.env.REDIRECT_URI || '';

    if (!this.tenantId || !this.clientId || !this.redirectUri) {
      throw new Error('TENANT_ID, CLIENT_ID and REDIRECT_URI are required');
    }
  }

    /**
    * To get Microsoft form redirect
    * @returns redirect url
    * @throws Exception of some elements missing
    */
    async getAuthorizationRedirect(): Promise<AuthorizationRedirectResponse> {
    const authorizationUrl =
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize` +
        `?client_id=${encodeURIComponent(this.clientId)}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
        `&response_mode=query` +
        `&scope=${encodeURIComponent(this.scope)}`;

      return {
        authorization_url: authorizationUrl,
      };
    }

}
