"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const nav = [
  { href: "/admin", label: "📊 Dashboard", exact: true },
  { href: "/admin/sales", label: "💰 Sales" },
  { href: "/admin/leads", label: "📥 Leads" },
  { href: "/admin/products", label: "📦 Products" },
  { href: "/admin/coupons", label: "🏷️ Coupons" },
  { href: "/admin/shipping", label: "🚚 Shipping" },
];

export default function AdminLayoutClient({
  hasSession,
  children,
}: {
  hasSession: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!hasSession && !isLogin) {
      router.replace("/admin/login");
    }
    if (hasSession && isLogin) {
      router.replace("/admin");
    }
  }, [hasSession, isLogin, router]);

  if (isLogin) {
    return <div className="admin-app">{children}</div>;
  }

  if (!hasSession) {
    return (
      <div className="admin-app">
        <main style={{ padding: 26 }}>Loading…</main>
      </div>
    );
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-app">
      <aside>
        <div className="logo">
          Decor<b>41</b> Admin
        </div>
        {nav.map((item) => {
          const on = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={on ? "on" : ""}>
              {item.label}
            </Link>
          );
        })}
        <div className="nav-foot">
          <button type="button" className="nav" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main>{children}</main>
    </div>
  );
}
