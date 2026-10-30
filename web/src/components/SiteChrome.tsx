"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { CursorGlow } from "@/components/CursorGlow";
import { ScrollReveal } from "@/components/ScrollReveal";

type Cat = { slug: string; name: string };

export function SiteChrome({
  children,
  categories,
  whatsapp,
}: {
  children: React.ReactNode;
  categories: Cat[];
  whatsapp: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menu, setMenu] = useState(false);
  const isCheckout = pathname.startsWith("/checkout") || pathname.startsWith("/done");
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (isAdmin) return;
    const page = pathname.startsWith("/cart")
      ? "cart"
      : pathname.startsWith("/checkout")
        ? "checkout"
        : pathname.startsWith("/done")
          ? "done"
          : "home";
    document.body.dataset.pg = page;
  }, [pathname, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    const onScroll = () => {
      const h = document.documentElement;
      setProgress((scrollY / Math.max(1, h.scrollHeight - innerHeight)) * 100);
      setScrolled(scrollY > 10);
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [isAdmin]);

  if (isAdmin) return <>{children}</>;

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim();
    if (q) router.push(`/s?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <header className={scrolled ? "sc" : ""}>
        <div className="w">
          <Link className="logo" href="/" aria-label="Decor 41 home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/decor41-logo-clear.png" alt="Decor41" />
          </Link>
          <button
            className="tg menu"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            onClick={() => setMenu((open) => !open)}
            type="button"
          >
            {menu ? "✕" : "☰"}
          </button>
          {!isCheckout && (
            <nav id="nav" className={menu ? "open" : ""}>
              {categories.map((c) => (
                <Link key={c.slug} href={`/c/${c.slug}`}>
                  {c.name}
                </Link>
              ))}
              <Link href="/custom">Custom order</Link>
              <Link href="/cart">Cart</Link>
            </nav>
          )}
          {isCheckout && <div className="sf">Secure checkout</div>}
          {!isCheckout && (
            <form className="srch" onSubmit={onSearch}>
              <span>🔍</span>
              <input name="q" placeholder="Search décor, cars…" aria-label="Search" />
            </form>
          )}
          <Link className="btn" id="cb" href="/cart">
            <span aria-hidden>🛒</span>
            <span className="cart-lbl">Cart</span>
            <span id="cc">{count}</span>
          </Link>
        </div>
      </header>
      <div id="pg" style={{ width: `${progress}%` }} />
      <main id="app">{children}</main>
      <ScrollReveal />
      <CursorGlow />
      {!isCheckout && (
        <a
          className="wa"
          href={`https://wa.me/${whatsapp}`}
          title="Chat on WhatsApp"
          aria-label="Chat on WhatsApp"
          target="_blank"
          rel="noreferrer"
        >
          💬
        </a>
      )}
    </>
  );
}
