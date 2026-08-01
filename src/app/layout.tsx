import type { Metadata } from "next";
import { Sora, Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IEEE Zerone 7.0 — Central Control Plane",
  description: "IEEE Zerone 7.0 central management platform for volunteers, teams, event controls, and live leaderboard.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} dark antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="bg-[#050505] text-[#f2f2f2] font-mono min-h-screen selection:bg-[#00e5ff] selection:text-black">
        {/* Top Accent Gradient Bar */}
        <div className="fixed top-0 left-0 right-0 h-[2px] z-[70] bg-gradient-to-r from-[#3b82f6] via-[#00e5ff] to-[#7c3aed]" />

        {/* Ambient Grid Matrix & Blueprint SVG Background */}
        <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage: "radial-gradient(ellipse 90% 70% at 50% 30%, black 20%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "120px 120px",
              maskImage: "radial-gradient(ellipse 90% 70% at 50% 30%, black 20%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(900px 600px at 18% -8%, rgba(59,130,246,0.06), transparent 60%), radial-gradient(700px 500px at 95% 12%, rgba(0,229,255,0.04), transparent 60%), radial-gradient(900px 650px at 55% 110%, rgba(124,58,237,0.04), transparent 60%)",
            }}
          />
          <svg
            className="blueprint-anim absolute inset-0 w-full h-full opacity-[0.14]"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <path className="draw-stroke" d="M-20 220 H240 l40 40 H520 l30 -30 H760 v120 l50 50 H1060" stroke="#00e5ff" strokeWidth="1" />
            <path className="draw-stroke" style={{ animationDelay: "0.5s" }} d="M1460 640 H1180 l-40 -40 H880 l-30 30 H600 v-90 l-50 -50 H320" stroke="#3b82f6" strokeWidth="1" />
            <path className="draw-stroke" style={{ animationDelay: "1s" }} d="M180 900 V760 l60 -60 H460 v-120" stroke="#7c3aed" strokeWidth="1" />
            <circle cx="240" cy="220" r="3" fill="#00e5ff" opacity="0.7" />
            <circle cx="760" cy="340" r="3" fill="#00e5ff" opacity="0.5" />
            <circle cx="1180" cy="640" r="3" fill="#3b82f6" opacity="0.7" />
            <circle cx="600" cy="540" r="3" fill="#3b82f6" opacity="0.5" />
            <circle cx="460" cy="580" r="3" fill="#7c3aed" opacity="0.6" />
          </svg>
        </div>

        <AppProvider>
          <div className="relative z-10">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
