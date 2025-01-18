import type { Metadata } from "next";
import { Montserrat, Poppins, Raleway } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const montserrat = Montserrat({ subsets: ["latin"], weight: 'variable' });
const poppins = Poppins({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] });


export const metadata: Metadata = {
  title: "Node DB",
  description: "Build schemas in minutes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClerkProvider appearance={{
        baseTheme: dark,
        variables: {
          colorBackground: "#1D1D1D"
        },
        layout: {
          unsafe_disableDevelopmentModeWarnings: true
        }
      }}>
        <body className={montserrat.className + " custom-cursor"}>
          {children}
        </body>
      </ClerkProvider>
    </html >
  );
}
