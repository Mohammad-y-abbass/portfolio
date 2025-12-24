import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Suspense } from "react"
import { ReactLenis } from 'lenis/react'


export const metadata: Metadata = {
  title: "Damilare Osofisan | Designer & Builder",
  description: "Designer and builder.",
  metadataBase: new URL("https://damilareoo.xyz"),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Damilare Osofisan | Designer & Builder",
    description: "Designer and builder.",
    url: "https://damilareoo.xyz",
    siteName: "Damilare Osofisan",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Damilare Osofisan - Designer and builder",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Damilare Osofisan | Designer & Builder",
    description: "Designer and builder.",
    images: ["/images/og-image.png"],
    creator: "@damilareoo",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />

        <meta property="og:image" content="https://damilareoo.xyz/images/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Damilare Osofisan - Designer and builder" />
        <meta property="og:image:type" content="image/png" />

        <meta name="twitter:image" content="https://damilareoo.xyz/images/og-image.png" />
        <meta name="twitter:image:alt" content="Damilare Osofisan - Designer and builder" />
        <meta name="twitter:card" content="summary_large_image" />

        <meta property="og:image:secure_url" content="https://damilareoo.xyz/images/og-image.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://damilareoo.xyz" />
        <meta property="og:title" content="Damilare Osofisan | Designer & Builder" />
        <meta property="og:description" content="Designer and builder." />
        <meta property="og:site_name" content="Damilare Osofisan" />
      </head>
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
