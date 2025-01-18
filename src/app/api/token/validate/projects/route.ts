// src/app/api/token/route.ts

import verifyToken from '@/app/api/verify/main';
import Diagrams from '@/lib/model/draw.model';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
	const token = req.headers.get('authorization')?.split(' ')[1];
	if (!token) {
		return NextResponse.json({ message: 'Token is required', valid: false }, { status: 400 });
	}

	try {
		const verificationResult = await verifyToken(token);

		if (!verificationResult.valid) {
			return NextResponse.json({ message: verificationResult.message, valid: false }, { status: 403 });
		}

		const user = verificationResult.user;
		const projects = await Diagrams.find({ user: user?.id }).select("title _id");
		return NextResponse.json({ message: 'Projects fetched successfully', projects, valid: true }, { status: 200 });

	} catch (error) {
		return NextResponse.json({ message: 'Error processing the request', valid: false }, { status: 500 });
	}
}

export async function POST(req: Request) {
	const token = req.headers.get('authorization')?.split(' ')[1];
	if (!token) {
		return NextResponse.json({ message: 'Token is required', valid: false }, { status: 400 });
	}

	try {
		const verificationResult = await verifyToken(token);
		if (!verificationResult.valid) {
			return NextResponse.json({ message: verificationResult.message, valid: false }, { status: 403 });
		}
		
		const request = await req.json();
		const user = verificationResult.user;
		const project = await Diagrams.findOne({ user: user?.id, _id: toProjectID(request.project) });
		console.log(project, toProjectID(request.project))
		if(project){
			return NextResponse.json({ message: 'Project fetched successfully', project, valid: true }, { status: 200 });
		}else{
			return NextResponse.json({ message: 'Project not found', project, valid: false }, { status: 200 });
		}

	} catch (error) {
		return NextResponse.json({ message: 'Error processing the request', valid: false }, { status: 500 });
	}
}


const toProjectID = (id: string) => {
	return id.slice(4)
}