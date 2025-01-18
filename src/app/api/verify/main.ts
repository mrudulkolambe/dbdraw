// src/app/api/token/route.ts

import { createClerkClient } from '@clerk/backend';
import jwt from 'jsonwebtoken';
import { connect } from '@/lib/db';
import Tokens from '@/lib/model/token.model';

const isTokenRevoked = async (token: string): Promise<boolean> => {
  try {
    const tokenPresent = await Tokens.findOne({ token });
    return tokenPresent == null;
  } catch (error) {
    return true; 
  }
};

const verifyToken = async (token: string) => {
 await connect();
 const secret = process.env.JWT_SECRET!;
 const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

 try {
   const tokenData = jwt.verify(token, secret) as any;

   const isRevoked = await isTokenRevoked(token);
   if (isRevoked) {
	 return { message: 'Token is revoked', valid: false };
   }

   if (tokenData) {
	 const user = await clerkClient.users.getUser(tokenData.user as string);
	 return { message: 'Auth Successful', user, valid: true };
   } else {
	 return { message: 'Invalid Token', valid: false };
   }
 } catch (error) {
   return { message: "Error", valid: false };
 }
};


export default verifyToken
