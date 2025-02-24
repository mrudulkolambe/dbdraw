import { NextResponse } from 'next/server';
import initSocket from '@/lib/socket';

export async function GET(req: Request) {
  try {
    await initSocket(req as any, NextResponse as any);
    return new NextResponse('Socket initialized', { status: 200 });
  } catch (error) {
    console.error('Socket initialization error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
