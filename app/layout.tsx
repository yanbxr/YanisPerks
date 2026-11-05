import "./globals.css"

import type { Metadata, Viewport } from "next"
import { Space_Grotesk, Space_Mono } from "next/font/google"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-spaceGrotesk" })
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-spaceMono" })

export const metadata: Metadata = {
  title: "yp",
  description: "fast perk searcher for destiny 2",
}

export const viewport: Viewport = { themeColor: "#000000" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  )
}
