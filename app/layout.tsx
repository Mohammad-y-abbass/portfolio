import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { CustomCursor } from "@/components/custom-cursor"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Mohammad Abbas | Full Stack Developer",
  description:
    "Full Stack Developer specializing in backend optimization and scalable architectures. Proven ability to design and deploy production systems using Go, Node.js, and GCP.",
  generator: "v0.app",
  keywords: [
    "full stack developer",
    "backend engineer",
    "database engine",
    "devops",
    "Go",
    "Next.js",
    "portfolio",
  ],
  authors: [{ name: "Mohammad Abbas" }],
  openGraph: {
    title: "Mohammad Abbas | Full Stack Developer",
    description:
      "Full Stack Developer specializing in backend optimization and scalable architectures.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d12" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} bg-background scroll-smooth`}
    >
      <body className="font-sans antialiased text-foreground cursor-none">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CustomCursor />
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
