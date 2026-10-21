"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

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
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const isCheckout = pathname.startsWith("/checkout") || pathname.startsWith("/done");
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    try {
      const t = (localStorage.getItem("d41theme") as "dark" | "light") || "dark";
      setTheme(t);
      document.documentElement.dataset.theme = t;
    } catch {
      document.documentElement.dataset.theme = "dark";
    }
  }, []);

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
      document.querySelectorAll(".par").forEach((el) => {
        const e = el as HTMLElement;
        e.style.marginTop = String(-scrollY * Number(e.dataset.s || 0)) + "px";
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    const onMove = (e: MouseEvent) => {
      const g = document.getElementById("gl");
      if (g) {
        g.style.left = e.clientX + "px";
        g.style.top = e.clientY + "px";
      }
    };
    addEventListener("mousemove", onMove);
    return () => removeEventListener("mousemove", onMove);
  }, [isAdmin]);

  if (isAdmin) return <>{children}</>;

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    const h = document.documentElement;
    h.classList.add("tr");
    h.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem("d41theme", next);
    } catch {}
    setTimeout(() => h.classList.remove("tr"), 600);
  }

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim();
    if (q) router.push(`/s?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <header className={scrolled ? "sc" : ""}>
        <div className="w">
          <Link className="logo" href="/">
            <svg width="26" height="26" viewBox="0 0 26 26">
              <g style={{ fill: "var(--at)" }}>
                <ellipse cx="13" cy="6" rx="3" ry="6" />
                <ellipse cx="13" cy="6" rx="3" ry="6" transform="rotate(60 13 13)" />
                <ellipse cx="13" cy="6" rx="3" ry="6" transform="rotate(120 13 13)" />
              </g>
              <circle cx="13" cy="13" r="3" style={{ fill: "var(--bg)" }} />
            </svg>
            <span className="t">
              Decor<b>41</b>
            </span>
          </Link>
          {!isCheckout && (
            <nav id="nav">
              {categories.map((c) => (
                <Link key={c.slug} href={`/c/${c.slug}`}>
                  {c.name}
                </Link>
              ))}
            </nav>
          )}
          {isCheckout && <div className="sf">🔒 Secure checkout</div>}
          {!isCheckout && (
            <form className="srch" onSubmit={onSearch}>
              <span>🔍</span>
              <input name="q" placeholder="Search décor, cars…" aria-label="Search" />
            </form>
          )}
          <button className="tg" aria-label="Switch theme" title="Switch theme" onClick={toggleTheme} type="button">
            <svg className="mn" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
            <svg className="sn" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </button>
          <Link className="btn" id="cb" href="/cart">
            🛒 Cart <span id="cc">{count}</span>
          </Link>
        </div>
      </header>
      <div id="pg" style={{ width: `${progress}%` }} />
      <div id="gl" />
      <div className="blob" style={{ top: "5%", left: "-8%", background: "#c6ff3d" }} />
      <div className="blob" style={{ bottom: 0, right: "-8%", background: "#3dd6ff", animationDelay: "-4s" }} />
      <div id="bgs" dangerouslySetInnerHTML={{ __html: bgShapes() }} />
      <main id="app">{children}</main>
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

function bgShapes() {
  const shapes: [string, string, string, number, string][] = [
    ["6%", "12%", "ring", 70, "var(--sa)"],
    ["88%", "18%", "plus", 46, "var(--sb)"],
    ["4%", "58%", "tri", 58, "var(--sb)"],
    ["92%", "62%", "ring", 90, "var(--sa)"],
    ["46%", "86%", "plus", 40, "var(--sa)"],
    ["72%", "8%", "tri", 44, "var(--sa)"],
    ["20%", "88%", "ring", 50, "var(--sb)"],
  ];
  return shapes
    .map((s, i) => {
      const sh = {
        ring: `<circle cx="50" cy="50" r="40" fill="none" style="stroke:${s[4]}" stroke-width="3" stroke-dasharray="6 8"/>`,
        plus: `<path d="M50 14v72M14 50h72" style="stroke:${s[4]}" stroke-width="4" stroke-linecap="round"/>`,
        tri: `<path d="M50 14L88 82H12Z" fill="none" style="stroke:${s[4]}" stroke-width="3" stroke-linejoin="round"/>`,
      }[s[2]];
      return `<svg class="par" data-s="${((i % 3) + 1) * 0.04}" style="left:${s[0]};top:${s[1]};animation-delay:-${i * 1.3}s" width="${s[3]}" height="${s[3]}" viewBox="0 0 100 100">${sh}</svg>`;
    })
    .join("");
}
