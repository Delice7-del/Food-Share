import type { Metadata } from "next";
import { Saira_Condensed, Antic_Slab } from "next/font/google";
import "./globals.css";

const sairaCondensed = Saira_Condensed({
  weight: ['400', '500', '600', '700', '800'],
  variable: "--font-saira",
  subsets: ["latin"],
});

const anticSlab = Antic_Slab({
  weight: ['400'],
  variable: "--font-antic",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoodShare | Reduce Waste, Share Food",
  description: "A community platform to connect surplus food with those who need it.",
};

import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sairaCondensed.variable} ${anticSlab.variable} font-body antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
