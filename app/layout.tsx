import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Falcon X — AI Viral Content Generator",
  description:
    "Generate viral content for Instagram, TikTok, X, and LinkedIn using AI. Built for creators, marketers, and growth hackers.",
  keywords: [
    "AI content generator",
    "viral Instagram captions",
    "TikTok AI posts",
    "social media growth tool",
    "content creator AI",
    "marketing AI tool",
    "Falcon X",
  ],
  openGraph: {
    title: "Falcon X — AI Viral Content Generator",
    description:
      "Create viral social media content in seconds using AI.",
    url: "https://falcon-x-six.vercel.app",
    siteName: "Falcon X",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Falcon X",
    description: "AI tool for viral social media content generation",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}