// src/app/api/token/route.ts

import { NextResponse } from 'next/server';
import { currentUser } from "@clerk/nextjs/server";
import { connect } from '@/lib/db';
import Tags from '@/lib/model/tags.model';
import Tokens from '@/lib/model/token.model';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
	await connect();
	const user = await currentUser();

	if (user) {
		const secret = process.env.JWT_SECRET!;
		const request = await req.json();
		const tokenPayload = {
			user: user.id,
			createdAt: Date.now(),
			title: request.title
		};

		const token = jwt.sign(tokenPayload, secret);

		const tokenInit = new Tokens({
			user: user.id,
			title: request.title,
			token,
			createdAt: Date.now(),
		});

		const savedToken = await tokenInit.save();
		return NextResponse.json(savedToken);
	} else {
		return NextResponse.json({ message: 'User not authenticated' });
	}
}

export async function GET() {
	await connect();
	const user = await currentUser();

	if (user) {
		const tokens = await Tokens.find({
			user: user.id
		})
		return NextResponse.json({ tokens, success: true });
	} else {
		return NextResponse.json({ message: 'User not authenticated' });
	}
}
