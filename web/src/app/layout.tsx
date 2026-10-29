import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { SiteChrome } from "@/components/SiteChrome";
import { getCategories } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const dm = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: "Decor 41 — Style it. Cut it. Drive it.",
    template: "%s · Decor 41",
  },
  description:
    "Laser-cut décor, posters, wallpapers, faux greens and car accessories — made in Coimbatore.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);

  return (
    <html lang="en" className={`${dm.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body>
        <CartProvider>
          <SiteChrome
            categories={categories.filter((c) => !c.parentId).map((c) => ({ slug: c.slug, name: c.name }))}
            whatsapp={settings.whatsapp}
          >
            {children}
          </SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
