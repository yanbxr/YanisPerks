import "./globals.css"

import type { Metadata, Viewport } from "next"
import { Inter_Tight } from "next/font/google"

const interTight = Inter_Tight({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-interTight" })

export const metadata: Metadata = {
  title: "YanisPerks",
  description: "Fast perk searcher for Destiny 2",
}

export const viewport: Viewport = { themeColor: "#12171c" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={interTight.variable}>
      <body className="bg-app min-h-screen font-sans antialiased">{children}</body>
    </html>
  )
}
