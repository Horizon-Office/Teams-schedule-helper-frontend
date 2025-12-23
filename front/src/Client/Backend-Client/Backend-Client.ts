export interface AuthDeviceCodeResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}


export interface ValidateTokenResponse {
    validate: boolean;
}

export class BackendClient {
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

        // Здесь сразу возвращаем распакованные данные из json.data
        const tokenData = json.data;


        return {
            access_token: tokenData.access_token,
            token_type: tokenData.token_type,
            expires_in: tokenData.expires_in,
            scope: tokenData.scope,
        };
    }



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
}


