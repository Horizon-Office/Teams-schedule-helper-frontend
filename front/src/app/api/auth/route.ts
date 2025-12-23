import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') || undefined;

  if (!code) {
    return NextResponse.json(
      { message: 'Authorization code missing', code: '', state },
      { status: 400 }
    );
  }

  const response = NextResponse.redirect(new URL('/', req.url));

  response.cookies.set('auth_code', code, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 300,
  });
  

  return response;
}
