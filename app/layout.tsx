import "./globals.css"

import type { Metadata } from "next"
import { Suspense } from "react"
import { Barlow_Condensed, Barlow } from "next/font/google"
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server"
import { ConvexClientProvider } from "@/components/convex-client-provider"
import { PostHogProvider } from "@/components/posthog-provider"
import { Toaster } from "@/components/ui/sonner"
import Footer from "@/components/footer"

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
})

const barlow = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: {
    default: "SportsDeck - Discover the Best Sports Apps",
    template: "%s | SportsDeck"
  },
  description: "Find and explore top sports apps for fantasy sports, betting, score tracking, simulators, analytics, and communities. Your ultimate sports app directory.",
  keywords: ["sports apps", "fantasy sports", "sports betting", "score tracking", "sports analytics", "sports communities", "app directory"],
  authors: [{ name: "SportsDeck Team" }],
  creator: "SportsDeck",
  publisher: "SportsDeck",
  metadataBase: new URL("https://sportsdeck.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sportsdeck.com",
    siteName: "SportsDeck",
    title: "SportsDeck - Discover the Best Sports Apps",
    description: "Find and explore top sports apps for fantasy sports, betting, score tracking, simulators, analytics, and communities.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SportsDeck - Sports App Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SportsDeck - Discover the Best Sports Apps",
    description: "Find and explore top sports apps for fantasy sports, betting, score tracking, simulators, analytics, and communities.",
    images: ["/og-image.jpg"],
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
  verification: {
    google: "your-google-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SportsDeck",
    "description": "Find and explore top sports apps for fantasy sports, betting, score tracking, simulators, analytics, and communities.",
    "url": "https://sportsdeck.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://sportsdeck.com/?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SportsDeck",
      "url": "https://sportsdeck.com"
    }
  };

  return (
    <html lang="en" className="border-solid border-2">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
          />
        </head>
        <body
          className={`${barlowCondensed.variable} ${barlow.variable} antialiased bg-background font-body`}
        >
          <ConvexAuthNextjsServerProvider>
            <ConvexClientProvider>
              <Suspense fallback={null}>
                <PostHogProvider>
                  {children}
                  <Footer />
                  <Toaster />
                </PostHogProvider>
              </Suspense>
            </ConvexClientProvider>
          </ConvexAuthNextjsServerProvider>
        </body>
    </html>
  )
}








