// src/app/api/diagram/route.ts

import { NextResponse } from 'next/server';
import Diagrams from '@/lib/model/draw.model';
import { currentUser } from "@clerk/nextjs/server";
import { connect } from '@/lib/db';

export async function POST(req: Request) {
  await connect();
  const user = await currentUser();
  if (user) {
    const request = await req.json();
    console.log(request.flow)
    const drawInit = new Diagrams({
      user: user.id,
      title: request.title,
      tag: request.tag || null, // Handle empty tag by setting it to null
      flow: request.flow,
      description: request.description,
      icon: request.icon,
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
    try {
      // Modified query to handle both populated and non-populated tag fields
      const diagrams = await Diagrams.find({
        user: user.id,
        $or: [
          { tag: { $exists: true, $ne: "" } },
          { tag: null }
        ]
      }).populate("tag");
      
      return NextResponse.json({ diagrams, success: true });
    } catch (error) {
      console.error("Error fetching diagrams:", error);
      return NextResponse.json({ message: 'Error fetching diagrams', error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ message: 'User not authenticated' });
  }
}
