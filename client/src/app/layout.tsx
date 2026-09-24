import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import "./mobile-ux.css";
import { UserProvider } from "@/context/UserContext";
import { Toaster } from "@/components/ui/toaster";
import { CookieConsentBanner } from "@/components/legal/CookieConsentBanner";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ascend-os.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Ascend OS - Continuous Progression Platform",
    template: "%s | Ascend OS",
  },
  description: "Gamified SaaS architecture and personal progression life operating system combining habit mastery, physical telemetry, and RPG tower trials.",
  keywords: ["habit tracker", "gamified productivity", "rpg habits", "fitness telemetry", "AIRA AI companion", "discipline system"],
  authors: [{ name: "Ascend OS Architecture" }],
  creator: "Ascend OS",
  publisher: "Ascend OS",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ascend OS - Continuous Progression Platform",
    description: "Transform daily habits, physical training, and cognitive milestones into an epic RPG progression journey.",
    url: appUrl,
    siteName: "Ascend OS",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ascend OS - Continuous Progression Platform",
    description: "Transform daily habits, physical training, and cognitive milestones into an epic RPG progression journey.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "dark",
        "h-full",
        spaceGrotesk.variable,
        inter.variable,
        jetbrainsMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body
        suppressHydrationWarning
        className="h-full bg-[#0B1020] text-slate-100 antialiased selection:bg-[#3b82f6] selection:text-white flex flex-col font-sans"
      >
        <div suppressHydrationWarning className="flex flex-col h-full w-full">
          <UserProvider>
            {children}
            <Toaster />
            <CookieConsentBanner />
          </UserProvider>
        </div>
      </body>
    </html>
  );
}
