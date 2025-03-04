// src/app/api/diagram/route.ts

import { NextResponse } from 'next/server';
import Diagrams from '@/lib/model/draw.model';
import { currentUser } from "@clerk/nextjs/server";
import { connect } from '@/lib/db';

// Ensure dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await connect();
  const user = await currentUser();
  if (user) {
    const request = await req.json();
    const drawInit = new Diagrams({
      user: user.id,
      title: request.title,
      tag: request.tag,
      flow: request.flow,
      description: request.description,
      isTemplate: true,
    });

    const savedDraw = await drawInit.save();
    return NextResponse.json({ _id: savedDraw._id });
  } else {
    return NextResponse.json({ message: 'User not authenticated' });
  }
}

export async function GET() {
  await connect();
  const user = await currentUser();
  if (user) {
    const diagrams = await Diagrams.find({
      isTemplate: true,
      tag: { $exists: true, $ne: "" }
    }).populate({
      path: 'tag',
      select: 'title _id'
    });
    return NextResponse.json({ diagrams, success: true });
  } else {
    return NextResponse.json({ message: 'User not authenticated' });
  }
}
