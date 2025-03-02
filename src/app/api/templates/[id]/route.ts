import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  await connect();
  const user = await currentUser();
  if (user) {
    const diagram = await Diagrams.findOne({
      isTemplate: true,
      _id: id,
    })
    return NextResponse.json({ diagram, success: true });
  } else {
    return NextResponse.json({ message: 'User not authenticated' });
  }
}
