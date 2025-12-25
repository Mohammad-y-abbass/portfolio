import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Suspense } from "react"
import { ReactLenis } from 'lenis/react'


export const metadata: Metadata = {
  title: "Mohammad Abbass",
  description: "Full Stack Developer",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-black overflow-x-hidden">
        <ReactLenis root>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </ReactLenis>
      </body>
    </html>
  )
}
