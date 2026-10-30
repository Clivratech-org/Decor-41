"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Soft brand cursor ring + spotlight — desktop only. */
export function CursorGlow() {
  const pathname = usePathname();
  const ring = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const r = ring.current;
    const s = spot.current;
    if (!r || !s) return;

    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;
    let hovering = false;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const hero = (e.target as Element | null)?.closest?.(".hero-bleed");
      document.documentElement.dataset.cursor = hero ? "hero" : "page";
      if (hero instanceof HTMLElement) {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
        hero.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
        const px = (e.clientX / innerWidth - 0.5) * 16;
        const py = (e.clientY / innerHeight - 0.5) * 12;
        hero.style.setProperty("--hx", `${px.toFixed(2)}px`);
        hero.style.setProperty("--hy", `${py.toFixed(2)}px`);
      }
    };

    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      hovering = Boolean(t?.closest?.("a,button,.btn,.card,.collect,.qa,.op"));
      document.documentElement.classList.toggle("cursor-hot", hovering);
    };

    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      r.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      s.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    document.documentElement.classList.add("has-cursor");
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerover", onOver, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerover", onOver);
      document.documentElement.classList.remove("has-cursor", "cursor-hot");
      delete document.documentElement.dataset.cursor;
    };
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <div ref={spot} className="cursor-spot" aria-hidden />
      <div ref={ring} className="cursor-ring" aria-hidden />
    </>
  );
}
