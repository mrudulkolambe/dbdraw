import type { Metadata } from "next";
import { Manrope, Nunito, Quicksand, Raleway } from "next/font/google";
import { ReactFlowProvider } from "@xyflow/react";
import { ClerkProvider, SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import { dark } from '@clerk/themes';
import { v4 as uuidv4 } from 'uuid';
import { Toaster } from 'sonner';

const raleway = Quicksand({ subsets: ["latin"], weight: 'variable' });

export const metadata: Metadata = {
	title: "DBDraw",
	description: "Build schemas in minutes",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${raleway.className} dark`}>
				<Toaster
					duration={3000}
					position="bottom-right"
					theme="dark"
					toastOptions={{
						className: "border-white/30 border bg-black/5 backdrop-blur-md",
						actionButtonStyle: {
							color: "white",
							backgroundColor: "rgba(255, 255, 255, 0.1)",
							padding: "20"
						},
						classNames: {
							title: 'text-white',
						}
					}} />
				<ReactFlowProvider>
					<SignedOut>
						<section className="bg-primary h-screen w-screen flex items-center justify-center">
							<SignIn routing="hash" fallbackRedirectUrl={`/board`} />
						</section>
					</SignedOut>
					<SignedIn>
						{children}
					</SignedIn>
				</ReactFlowProvider>
			</body>
		</html>
	);
}
