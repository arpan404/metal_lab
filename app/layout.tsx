import { type Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FloatingNavDemo } from "@/components/nav/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Well Name Not Found",
  description: "A modern well management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SignedOut>
            <SignIn />
          </SignedOut>
          <SignedIn>
            <FloatingNavDemo>{children}</FloatingNavDemo>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}
