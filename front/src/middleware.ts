import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { BackendDelegateAuth } from '@/Client/Backend-Client/delegate-auth'; 
import { MicrosoftGraphDelegateAuth } from './Client/Microsoft-Graph-Client/delegate-auth';

export async function middleware(request: NextRequest) {

  const authCode = request.cookies.get('auth_code')?.value;
  const delegateToken = request.cookies.get('delegate_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value
  const res = NextResponse.redirect(new URL('/', request.url)); 

  const ClientMicrosoftGraph = new MicrosoftGraphDelegateAuth();
  const ClientBackend = new BackendDelegateAuth();
  const redirectResponse = await ClientMicrosoftGraph.getAuthorizationRedirect();
  type ValidateResponse = { 
    validate: boolean 
  };
  type TokenResponse = { 
    access_token: string; 
    expires_in?: number;
    refresh_token: string;
  };

  const hasToken = typeof delegateToken === 'string' && delegateToken.length > 0; 
  const hasCode = typeof authCode === 'string' && authCode.length > 0; 
  const refresh = typeof refreshToken === 'string' && !delegateToken; 
  const authUrl = new URL(redirectResponse.authorization_url, request.url); 

  switch (true) {

    case refresh: {
      try {
        console.log('Attempting refresh with token:', refreshToken);
        const tokenData: TokenResponse = await ClientBackend.refreshToken(refreshToken!);
        const nextRes = NextResponse.next();

        nextRes.cookies.set({
          name: 'delegate_token',
          value: tokenData.access_token,
          httpOnly: true,
          sameSite: 'lax',
          maxAge: tokenData.expires_in ?? 3600,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        });

        nextRes.cookies.set({
          name: 'refresh_token',
          value: tokenData.refresh_token,
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 31104000,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        });
        nextRes.cookies.delete('auth_code');
        return nextRes;


      } catch (err: unknown) {
        console.error('Middleware refresh error:', err);
        const res = NextResponse.redirect(authUrl);
        res.cookies.delete('delegate_token');
        res.cookies.delete('refresh_token');
        res.cookies.delete('auth_code');
        return res;
      }
  }

  case hasToken: {
    try {
      const validate: ValidateResponse = await ClientBackend.validateToken(delegateToken!);
      if (validate.validate) {
        return NextResponse.next();
      }
      throw new Error('Invalid Token');
      } catch {
        const res = NextResponse.redirect(authUrl);
        res.cookies.delete('delegate_token');
        res.cookies.delete('refresh_token');
        res.cookies.delete('auth_code');
        return res;
      }
  }

  case hasCode: {
    try {
      const tokenData: TokenResponse = await ClientBackend.getDelegateToken(authCode!);
      res.cookies.delete('auth_code');
      res.cookies.delete('refresh_token')
      res.cookies.set({
        name: 'delegate_token',
        value: tokenData.access_token,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: tokenData.expires_in ?? 3600,
        path: '/',
        secure: process.env.NODE_ENV === 'production', 
      });

      res.cookies.set({
        name: 'refresh_token',
        value: tokenData.refresh_token,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 31104000,
        path: '/',
        secure: process.env.NODE_ENV === 'production', 
      });
       res.cookies.delete('auth_code');
      
      console.log("token ready and setted")
      return res;
    } catch {
      res.cookies.delete('auth_code');
      return NextResponse.redirect(authUrl);
    }
  }


  default:
    console.log('then defalt')
    return NextResponse.redirect(authUrl);
}
}

export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|robots.txt|public|login|auth).*)',
  ],
};
