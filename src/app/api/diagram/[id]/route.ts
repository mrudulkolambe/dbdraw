import Diagrams from '@/lib/model/draw.model';
import { currentUser } from "@clerk/nextjs/server";
import { connect } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
	await connect();
	const { id } = params;
	const user = await currentUser();

	if (user) {
		const request = await req.json();
		console.log(request)
		const drawUpdate = await Diagrams.findByIdAndUpdate(id, request, {
			returnOriginal: false
		})
		return NextResponse.json({ success: true, message: "updated", draw: drawUpdate }, { status: 200 });
	} else {
		return NextResponse.json({ success: false, message: "something went wrong", draw: undefined }, { status: 500 });
	}
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
	await connect();
	const { id } = params;
	const user = await currentUser();
	if (isValidObjectId(id)) {
		if (user) {
			const draw = await Diagrams.findOne({ _id: id, user: user.id })
			if (draw) return NextResponse.json({ success: true, message: "found", draw: draw }, { status: 200 });
			return NextResponse.json({ success: false, message: "not found", draw: undefined }, { status: 404 });
		} else {
			return NextResponse.json({ success: false, message: "Diagram Doesn't exist", draw: undefined }, { status: 500 });
		}
	} else {
		return NextResponse.json({ success: false, message: "not found", draw: undefined }, { status: 404 });
	}
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	await connect();
	const { id } = params;
	const user = await currentUser();

	if (user) {
		const request = await req.json();
		const drawUpdate = await Diagrams.findByIdAndUpdate(id, request, {
			returnOriginal: false
		})
		return NextResponse.json({ success: true, message: "updated", draw: drawUpdate }, { status: 200 });
	} else {
		return NextResponse.json({ success: false, message: "something went wrong", draw: undefined }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
	await connect();
	const { id } = params;
	const user = await currentUser();

	if (user) {
		await Diagrams.findByIdAndDelete(id)
		return NextResponse.json({ success: true, message: "deleted" }, { status: 200 });
	} else {
		return NextResponse.json({ success: false, message: "something went wrong", }, { status: 500 });
	}
}
