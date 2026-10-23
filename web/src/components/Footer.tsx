import Link from "next/link";
import type { ShippingSettings } from "@/lib/settings";

export function Footer({
  categories,
  settings,
}: {
  categories: { slug: string; name: string; parentId?: string | null }[];
  settings: ShippingSettings;
}) {
  const top = categories.filter((c) => !c.parentId);
  return (
    <footer>
      <div className="w">
        <div className="fg">
          <div>
            <Link className="logo" href="/" style={{ fontSize: 22 }}>
              Decor<b>41</b>
            </Link>
            <p>
              Laser-cut décor, posters, wallpapers, faux greens and car accessories — designed and made in
              Coimbatore.
            </p>
          </div>
          <div>
            <h4>Shop</h4>
            {top.slice(0, 4).map((c) => (
              <Link key={c.slug} href={`/c/${c.slug}`}>
                {c.name}
              </Link>
            ))}
          </div>
          <div>
            <h4>More</h4>
            {top.slice(4).map((c) => (
              <Link key={c.slug} href={`/c/${c.slug}`}>
                {c.name}
              </Link>
            ))}
            <Link href="/cart">Your cart</Link>
            <Link href="/custom">Custom laser cut</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
            <a href={`https://wa.me/${settings.whatsapp}`}>WhatsApp: +91 {settings.contactPhone}</a>
            <span style={{ display: "block", padding: "3px 0" }}>{settings.contactAddress}</span>
          </div>
        </div>
        <p style={{ marginTop: 28 }}>© Decor 41 · UPI · Cards · 7-day returns</p>
      </div>
    </footer>
  );
}
