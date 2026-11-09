"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Minimal brand cursor dot — desktop only. */
export function CursorGlow() {
  const pathname = usePathname();
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = dot.current;
    if (!el) return;

    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const hero = (e.target as Element | null)?.closest?.(".hero-bleed");
      if (hero instanceof HTMLElement) {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
        hero.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
        hero.style.setProperty("--hx", `${((e.clientX / innerWidth - 0.5) * 12).toFixed(2)}px`);
        hero.style.setProperty("--hy", `${((e.clientY / innerHeight - 0.5) * 8).toFixed(2)}px`);
      }
    };

    const loop = () => {
      x += (tx - x) * 0.28;
      y += (ty - y) * 0.28;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    document.documentElement.classList.add("has-cursor");
    addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;
  return <div ref={dot} className="cursor-dot" aria-hidden />;
}
