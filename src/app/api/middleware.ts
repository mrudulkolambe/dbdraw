// src/app/api/middleware/authMiddleware.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for token verification
import { createClerkClient } from '@clerk/backend';

const secretKey = process.env.JWT_SECRET!;

export async function middleware(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split(' ')[1] || '';

  if (!token) {
    return NextResponse.json({ message: 'No token provided, authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as any;

    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    const user = await clerkClient.users.getUser(decoded.user);

    if (!user) {
      return NextResponse.json({ message: 'User not found', valid: false }, { status: 404 });
    }
	console.log(user)

    req.headers.set('user', JSON.stringify(user));

    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token or session expired', valid: false }, { status: 403 });
  }
}

export const config = {
  matcher: ['/api/*'],
};
