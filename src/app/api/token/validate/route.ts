import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import verifyToken from '../../verify/main';

export async function POST(req: Request) {
  await connect();
  const request = await req.json();
  console.log(request);

  try {
    const verificationResult = await verifyToken(request.token);
    if (!verificationResult.valid) {
      return NextResponse.json({ message: verificationResult.message, valid: false }, { status: 403 });
    }
    const user = verificationResult.user;
    return NextResponse.json({ message: 'Auth Successful', user, valid: true }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Error", valid: false }, { status: 500 });
  }
}
