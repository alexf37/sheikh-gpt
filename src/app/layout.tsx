import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "SheikhGPT",
  description:
    "SheikhGPT is a GPT powered chatbot that can answer your questions about Islam.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "SheikhGPT | Islamic Rulings Made Easy",
    description:
      "Get instant answers about what is halal or haram according to Islamic teachings, powered by AI.",
    url: "https://sheikhgpt.app",
    siteName: "SheikhGPT",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "SheikhGPT - Islamic Rulings Made Easy",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#005e3a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Analytics />
      </body>
    </html>
  );
}
