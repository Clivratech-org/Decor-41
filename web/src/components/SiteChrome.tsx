"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { CursorGlow } from "@/components/CursorGlow";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Icon } from "@/components/Icons";
import { signOut, useSession } from "next-auth/react";
import { rupees } from "@/lib/money";

type Cat = { slug: string; name: string };
type SearchHit = {
  id: number;
  slug: string;
  name: string;
  categoryName: string;
  fromPrice: number;
  imageUrl: string | null;
};

export function SiteChrome({
  children,
  categories,
  whatsapp,
  minOrderAmount = 0,
}: {
  children: React.ReactNode;
  categories: Cat[];
  whatsapp: string;
  minOrderAmount?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { count, subtotal } = useCart();
  const { data: session } = useSession();
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const isCheckout = pathname.startsWith("/checkout") || pathname.startsWith("/done");
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    setMenu(false);
    setSearchOpen(false);
    setSuggestOpen(false);
    setHits([]);
    setSearchQ("");
  }, [pathname]);

  useEffect(() => {
    if (isAdmin) return;
    const q = searchQ.trim();
    if (q.length < 1) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setHits(Array.isArray(data.results) ? data.results : []);
        setSuggestOpen(true);
      } catch {
        setHits([]);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [searchQ, isAdmin]);

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

  useEffect(() => {
    if (isAdmin || isCheckout) return;
    const el = navRef.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setCanLeft(el.scrollLeft > 4);
      setCanRight(max > 8 && el.scrollLeft < max - 4);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
      removeEventListener("resize", update);
    };
  }, [isAdmin, isCheckout, categories, pathname]);

  if (isAdmin) return <>{children}</>;

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = (new FormData(e.currentTarget).get("q")?.toString() || searchQ).trim();
    if (q) {
      router.push(`/s?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
      setSuggestOpen(false);
    }
  }

  function goToHit(slug: string) {
    setSuggestOpen(false);
    setSearchOpen(false);
    setSearchQ("");
    setHits([]);
    router.push(`/p/${slug}`);
  }

  const suggestList =
    suggestOpen && searchQ.trim() ? (
      <div className="srch-suggest" role="listbox" aria-label="Search suggestions">
        {hits.length ? (
          hits.map((hit) => (
            <button key={hit.id} type="button" className="srch-hit" onClick={() => goToHit(hit.slug)}>
              <span className="srch-hit-copy">
                <b>{hit.name}</b>
                <small>
                  {hit.categoryName} · from {rupees(hit.fromPrice)}
                </small>
              </span>
            </button>
          ))
        ) : (
          <p className="srch-empty">No matches for “{searchQ.trim()}”</p>
        )}
        <Link
          className="srch-all"
          href={`/s?q=${encodeURIComponent(searchQ.trim())}`}
          onClick={() => {
            setSuggestOpen(false);
            setSearchOpen(false);
          }}
        >
          View all results →
        </Link>
      </div>
    ) : null;

  function scrollNav(dir: -1 | 1) {
    const el = navRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(160, el.clientWidth * 0.55), behavior: "smooth" });
  }

  return (
    <>
      <header className={`${scrolled ? "sc" : ""}${searchOpen ? " search-open" : ""}`.trim()}>
        <div className="w">
          <Link className="logo" href="/" aria-label="Decor 41 home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/decor41-logo-clear.png" alt="Decor41" />
          </Link>
          {!isCheckout && (
            <div className={`nav-shell${canLeft ? " has-left" : ""}${canRight ? " has-right" : ""}`}>
              {canLeft ? (
                <button type="button" className="nav-cue left" aria-label="Scroll categories left" onClick={() => scrollNav(-1)}>
                  <Icon.ChevronLeft />
                </button>
              ) : null}
              <nav id="nav" ref={navRef} className={menu ? "open" : ""}>
                {categories.map((c) => (
                  <Link key={c.slug} href={`/c/${c.slug}`}>
                    {c.name}
                  </Link>
                ))}
                <Link href="/custom">Custom order</Link>
                <Link href="/cart">Cart</Link>
              </nav>
              {canRight ? (
                <button type="button" className="nav-cue right" aria-label="Scroll categories right" onClick={() => scrollNav(1)}>
                  <Icon.ChevronRight />
                </button>
              ) : null}
            </div>
          )}
          {isCheckout && <div className="sf">Secure checkout</div>}
          {!isCheckout && (
            <>
              <div className="srch-wrap srch-desk-wrap">
                <form className="srch srch-desk" onSubmit={onSearch} autoComplete="off">
                  <Icon.Search />
                  <input
                    name="q"
                    value={searchQ}
                    onChange={(e) => {
                      setSearchQ(e.target.value);
                      setSuggestOpen(true);
                    }}
                    onFocus={() => searchQ.trim() && setSuggestOpen(true)}
                    onBlur={() => setTimeout(() => setSuggestOpen(false), 160)}
                    placeholder="Search décor, cars…"
                    aria-label="Search"
                    aria-autocomplete="list"
                  />
                </form>
                {suggestList}
              </div>
              <button
                type="button"
                className={`tg srch-mob-btn${searchOpen ? " on" : ""}`}
                aria-label="Search"
                aria-expanded={searchOpen}
                onClick={() => setSearchOpen((v) => !v)}
              >
                {searchOpen ? <Icon.Close /> : <Icon.Search />}
              </button>
            </>
          )}
          {!isCheckout &&
            (session?.user ? (
              <button
                type="button"
                className="tg account-btn"
                title={session.user.email || "Account"}
                aria-label="Sign out"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="" className="avatar-sm" />
                ) : (
                  <Icon.User />
                )}
              </button>
            ) : (
              <Link className="tg account-btn" href="/login" aria-label="Sign in with Google" title="Sign in">
                <Icon.Login />
              </Link>
            ))}
          <Link className="btn" id="cb" href="/cart">
            <Icon.Cart />
            <span className="cart-lbl">Cart</span>
            <span id="cc">{count}</span>
          </Link>
          <button
            className="tg menu"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            onClick={() => setMenu((open) => !open)}
            type="button"
          >
            {menu ? <Icon.Close /> : <Icon.Menu />}
          </button>
        </div>
        {!isCheckout && searchOpen ? (
          <div className="srch-drop w">
            <div className="srch-wrap">
              <form className="srch srch-drop-form" onSubmit={onSearch} autoComplete="off">
                <Icon.Search />
                <input
                  name="q"
                  value={searchQ}
                  onChange={(e) => {
                    setSearchQ(e.target.value);
                    setSuggestOpen(true);
                  }}
                  onFocus={() => searchQ.trim() && setSuggestOpen(true)}
                  placeholder="Search décor, cars…"
                  aria-label="Search"
                  autoFocus
                />
              </form>
              {suggestList}
            </div>
          </div>
        ) : null}
      </header>
      <div id="pg" style={{ width: `${progress}%` }} />
      {!isAdmin && !isCheckout && count > 0 && minOrderAmount > 0 ? (
        <div className="min-order-strip">
          <div className="w">
            <p>
              {subtotal >= minOrderAmount
                ? "Minimum order reached — you can checkout"
                : `Add ₹${Math.max(0, minOrderAmount - subtotal).toLocaleString("en-IN")} more to reach the ₹${minOrderAmount.toLocaleString("en-IN")} minimum`}
            </p>
            <div className="bar">
              <i style={{ width: `${Math.min(100, (subtotal / minOrderAmount) * 100)}%` }} />
            </div>
          </div>
        </div>
      ) : null}
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
          <Icon.WhatsApp size={22} />
        </a>
      )}
    </>
  );
}
