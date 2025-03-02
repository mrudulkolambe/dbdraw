import { NextRequest, NextResponse } from 'next/server';
import Tokens from '@/lib/model/token.model';
import { currentUser } from "@clerk/nextjs/server";
import { connect } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { id } = params;
    const token = await Tokens.findOne({ _id: id, user: user.id });

    if (!token) {
      return NextResponse.json({ message: 'Token not found' }, { status: 404 });
    }

    await Tokens.deleteOne({ _id: id, user: user.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting token:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
