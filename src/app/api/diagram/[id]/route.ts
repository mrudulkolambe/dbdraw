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
		try {
			const request = await req.json();
			console.log(request);
			
			// Handle empty tag value
			if (request.tag === "") {
				request.tag = null;
			}
			
			const drawUpdate = await Diagrams.findByIdAndUpdate(id, request, {
				returnOriginal: false,
				new: true // Ensure we get the updated document back
			}).populate("tag");
			
			return NextResponse.json({ success: true, message: "updated", draw: drawUpdate }, { status: 200 });
		} catch (error) {
			console.error("Error updating diagram:", error);
			return NextResponse.json({ 
				success: false, 
				message: "Error updating diagram", 
				error: error 
			}, { status: 500 });
		}
	} else {
		return NextResponse.json({ success: false, message: "User not authenticated", draw: undefined }, { status: 401 });
	}
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
	await connect();
	const { id } = params;
	const user = await currentUser();
	if (isValidObjectId(id)) {
		if (user) {
			try {
				const draw = await Diagrams.findOne({ _id: id, user: user.id }).populate("tag");
				if (draw) return NextResponse.json({ success: true, message: "found", draw: draw }, { status: 200 });
				return NextResponse.json({ success: false, message: "not found", draw: undefined }, { status: 404 });
			} catch (error) {
				console.error("Error fetching diagram:", error);
				return NextResponse.json({ 
					success: false, 
					message: "Error fetching diagram", 
					error: error 
				}, { status: 500 });
			}
		} else {
			return NextResponse.json({ success: false, message: "User not authenticated", draw: undefined }, { status: 401 });
		}
	} else {
		return NextResponse.json({ success: false, message: "Invalid diagram ID", draw: undefined }, { status: 400 });
	}
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	await connect();
	const { id } = params;
	const user = await currentUser();

	if (user) {
		try {
			const request = await req.json();
			
			// Handle empty tag value
			if (request.tag === "") {
				request.tag = null;
			}
			
			const drawUpdate = await Diagrams.findByIdAndUpdate(id, request, {
				returnOriginal: false,
				new: true // Ensure we get the updated document back
			}).populate("tag");
			
			return NextResponse.json({ success: true, message: "updated", draw: drawUpdate }, { status: 200 });
		} catch (error) {
			console.error("Error updating diagram:", error);
			return NextResponse.json({ 
				success: false, 
				message: "Error updating diagram", 
				error: error 
			}, { status: 500 });
		}
	} else {
		return NextResponse.json({ success: false, message: "User not authenticated", draw: undefined }, { status: 401 });
	}
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
	await connect();
	const { id } = params;
	const user = await currentUser();

	if (user) {
		try {
			await Diagrams.findByIdAndDelete(id);
			return NextResponse.json({ success: true, message: "deleted" }, { status: 200 });
		} catch (error) {
			console.error("Error deleting diagram:", error);
			return NextResponse.json({ 
				success: false, 
				message: "Error deleting diagram", 
				error: error 
			}, { status: 500 });
		}
	} else {
		return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });
	}
}
