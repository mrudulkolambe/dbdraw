// src/app/api/diagram/route.ts

import { NextResponse } from 'next/server';
import Diagrams from '@/lib/model/draw.model';
import { currentUser } from "@clerk/nextjs/server";
import { connect } from '@/lib/db';
import Tags from '@/lib/model/tags.model';

export async function POST(req: Request) {
  await connect();
  const user = await currentUser();

  if (user) {
    const request = await req.json();
    const tagInit = new Tags({
      user: user.id,
      title: request.title,
      description: request.description,
    });

    const savedInit = await tagInit.save();
    return NextResponse.json({ _id: savedInit._id });
  } else {
    return NextResponse.json({ message: 'User not authenticated' });
  }
}

export async function GET() {
  await connect();
  const user = await currentUser();

  if (user) {
    const tags = await Tags.find({
      user: user.id
    })
    return NextResponse.json({ tags, success: true });
  } else {
    return NextResponse.json({ message: 'User not authenticated' });
  }
}
