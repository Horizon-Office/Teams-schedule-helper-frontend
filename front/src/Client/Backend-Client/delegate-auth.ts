export interface AuthDeviceCodeResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}


export interface ValidateTokenResponse {
    validate: boolean;
}

export interface RefreshTokenResponse {
    access_token: string
    refresh_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

export class BackendDelegateAuth {
    private baseURL: string;
    private scope: string;

    constructor() {
        const baseURL = process.env.BACKEND_BASE_URL;
        const scope = process.env.SCOPE || 'User.Read';
        if (!baseURL || !baseURL) {
            throw new Error('BACKEND_BASE_URL environment variable is required');
        }
        this.baseURL = baseURL;
        this.scope = scope;
    }

    /**
    * To get delegate token
    * @param authCode - The access token to validate (string)
    * @returns delegate tokem
    * @throws Exception if auth code is invalid or expired
    */
    async getDelegateToken(authCode: string): Promise<AuthDeviceCodeResponse> {
        const url = `${this.baseURL}/auth/delegateToken`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                authCode: authCode,
                scope: this.scope,
                redirectUri: process.env.REDIRECT_URI || '',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get delegate token: ${response.status} ${response.statusText}. Details: ${errorText}`
            );
        }

        const json = await response.json();
        const tokenData = json.data;
        return {
            access_token: tokenData.access_token,
            token_type: tokenData.token_type,
            expires_in: tokenData.expires_in,
            scope: tokenData.scope,
            refresh_token: tokenData.refresh_token
        };
    }


    /**
    * Validates if the access token 
    * @param token - The access token to validate (string)
    * @returns True or false
    * @throws UnauthorizedException if token is invalid or expired
    */
    async validateToken(token: string): Promise<ValidateTokenResponse> {
        const url = `${this.baseURL}/auth/validateToken`;
        try {

            const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_token: token }),
            });
            if (!response.ok) {
            return { validate: false };
            }

            const data = await response.json() as ValidateTokenResponse;
            return { 
            validate: data.validate === true 
            };
        } catch {
            return { validate: false };
        }
    }

    /**
    * Refresh if the access token 
    * @param token - The access token to validate (string)
    * @returns True or false
    * @throws UnauthorizedException if token is invalid or expired
    */
    async refreshToken(refresh_token: string): Promise<RefreshTokenResponse> {
        const url = `${this.baseURL}/auth/refreshToken`;
        try {

            const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                refresh_token: refresh_token, 
                scope: this.scope }),
            });
            console.log(response.json)
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Failed to refresh delegate token: ${response.status} ${response.statusText}. Details: ${errorText}`
                );
            }

            const refreshTokenData = await response.json();
            return {
                access_token: refreshTokenData.access_token,
                refresh_token: refreshTokenData.refresh_token,
                expires_in: refreshTokenData.expires_in,
                token_type: refreshTokenData.token_type,
                scope: refreshTokenData.scope,
            };
        } catch (err: unknown) {
            console.error('BackendClient.refreshToken error:', err);
            if (err instanceof Error) throw err;
            throw new Error(String(err));
        }
    }
}


