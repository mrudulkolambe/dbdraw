'use client';

import { currentUser } from "@clerk/nextjs/server";
import { connect } from '../db';
import Tokens from '../model/token.model';
import jwt from 'jsonwebtoken';

// Ensure dynamic rendering
export const dynamic = 'force-dynamic'; // This ensures dynamic rendering for this module

class TokenActions {
	constructor() {}

	async createToken(title: string, expiry?: number) {
		await connect();
		const user = await currentUser();
		const secret = process.env.JWT_SECRET!;

		if (user) {
			const tokenPayload = {
				user: user.id,
				createdAt: Date.now(),
			};

			const tokenOptions: jwt.SignOptions = expiry ? { expiresIn: expiry } : {};
			const token = jwt.sign(tokenPayload, secret, tokenOptions);

			const tokenInit = new Tokens({
				user: user.id,
				title,
				token,
				createdAt: Date.now(),
				expiry: expiry ? new Date(Date.now() + expiry * 1000) : null,
			});

			const savedToken = await tokenInit.save();
			return savedToken;
		} else {
			throw new Error("User not authenticated");
		}
	}
}

export default TokenActions;
