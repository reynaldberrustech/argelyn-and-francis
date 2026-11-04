import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Ephesis } from "next/font/google";
import { wedding } from "@/content/wedding";
import "./globals.css";

// Clean, flowing calligraphy for names and titles.
const script = Ephesis({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ephesis",
  display: "swap",
});

// Classic serif for reading text and the small spaced capitals.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const { groom, bride } = wedding.couple;
const title = `${groom} & ${bride} | ${wedding.date.short}`;
const description = `You're invited to the wedding of ${groom} and ${bride} on ${wedding.date.long} at ${wedding.venue.name}, ${wedding.venue.town}.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_PH",
    siteName: `${groom} & ${bride}`,
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#13244A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${script.variable} ${serif.variable} is-sealed`} suppressHydrationWarning>
      <body>
        <noscript>
          <style>{`html.is-sealed{overflow:auto}.gate{display:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
