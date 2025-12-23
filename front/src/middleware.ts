import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { BackendClient } from '@/Client/Backend-Client/Backend-Client'; 
import { MicrosoftGraphClient } from './Client/Microsoft-Graph-Client/Microsoft-Graph-Client';

export async function middleware(request: NextRequest) {

  const authCode = request.cookies.get('auth_code')?.value;
  const delegateToken = request.cookies.get('delegate_token')?.value;

  const ClientMicrosoftGraph = new MicrosoftGraphClient();
  const ClientBackend = new BackendClient();
  const redirectResponse = await ClientMicrosoftGraph.getAuthorizationRedirect();
  type ValidateResponse = { validate: boolean };
  type TokenResponse = { access_token: string; expires_in?: number };
  const hasToken = typeof delegateToken === 'string' && delegateToken.length > 0;
  const hasCode = typeof authCode === 'string' && authCode.length > 0;
  const authUrl = new URL(redirectResponse.authorization_url, request.url);

switch (true) {

  case hasToken: {
    try {
      const validate: ValidateResponse = await ClientBackend.validateToken(delegateToken!);
      if (validate.validate) {
        return NextResponse.next();
      }
      throw new Error('Invalid Token');
      } catch (error) {
        console.error('Ошибка валидации:', error);
        const res = NextResponse.redirect(authUrl);
        res.cookies.delete('delegate_token');
        res.cookies.delete('auth_code');
        return res;
      }
  }

  case hasCode: {
    try {
      const tokenData: TokenResponse = await ClientBackend.getDelegateToken(authCode!);
      const res = NextResponse.redirect(new URL('/', request.url)); // Редирект на главную после логина
      res.cookies.set({
        name: 'delegate_token',
        value: tokenData.access_token,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: tokenData.expires_in ?? 3600,
        path: '/',
        secure: process.env.NODE_ENV === 'production', 
      });
      res.cookies.delete('auth_code');
      return res;
    } catch {
      return NextResponse.redirect(authUrl);
    }
  }


  default:
    return NextResponse.redirect(authUrl);
}
}

export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|robots.txt|public|login|auth).*)',
  ],
};
