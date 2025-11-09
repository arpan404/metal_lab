import { type Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import { Header } from "@/components/nav/header";
import { NavbarProvider } from "@/lib/contexts/navbar-context";
import { AppStoreProvider } from "@/components/providers/app-store-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Metal Lab - Science & Motions",
  description: "Explore the wonders of science through interactive simulations and experiments.",
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
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen h-screen`}
        >
          <SignedIn>
            <AppStoreProvider>
              <NavbarProvider>
                <Header>{children}</Header>
              </NavbarProvider>
            </AppStoreProvider>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}