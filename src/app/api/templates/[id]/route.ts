import { NextRequest, NextResponse } from 'next/server';
import Diagrams from '@/lib/model/draw.model';
import Tags from '@/lib/model/tags.model';
import { currentUser } from "@clerk/nextjs/server";
import { connect } from '@/lib/db';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    await connect();
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const request = await req.json();
    const drawInit = new Diagrams({
      user: user.id,
      title: request.title,
      tag: request.tag,
      flow: request.flow,
      description: request.description,
      isTemplate: true,
      icon: request.icon
    });

    const savedDraw = await drawInit.save();
    return NextResponse.json({ _id: savedDraw._id });
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json({ message: 'Error creating template', error: error?.message || 'Unknown error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
  

    const { id } = params;

    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid template ID format' }, { status: 400 });
    }

    const diagram = await Diagrams.findOne({
      _id: id
    })
      .populate({
        path: 'tag',
        model: Tags,
        select: 'title _id'
      });

    if (!diagram) {
      return NextResponse.json({ message: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      diagram: diagram
    });
  } catch (error: any) {
    console.error('Error fetching template:', error);
    return NextResponse.json({ message: 'Error fetching template', error: error?.message || 'Unknown error' }, { status: 500 });
  }
}