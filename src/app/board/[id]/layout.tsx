import {  Quicksand } from "next/font/google";
import "../../globals.css";
import { ReactFlowProvider } from "@xyflow/react";

const quicksand = Quicksand({ subsets: ["latin"], weight: 'variable' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body
          className={`${quicksand.className} antialiased dark`}
        >
			<ReactFlowProvider>
				{children}
			</ReactFlowProvider>
        </body>
    </html>
  );
}
