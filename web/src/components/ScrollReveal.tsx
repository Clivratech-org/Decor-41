"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SELECTOR = [
  ".collect",
  ".card",
  ".cat",
  ".steps>div",
  ".tm",
  ".feat",
  ".nl",
  ".k2",
  "h2",
  ".sh",
  ".panel",
  ".fgrid li",
  ".strip",
  ".ci",
  ".det",
  ".pgh",
  ".gal",
  ".crumb",
  ".lead-form",
  ".empty",
  ".perks",
  ".tabs",
  ".hero-inner > *",
].join(",");

function countUp(el: HTMLElement) {
  const target = Number(el.dataset.n || 0);
  const decimals = (el.dataset.n || "").includes(".") ? 1 : 0;
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / 1500);
    el.textContent = (target * (1 - Math.pow(1 - t, 3)))
      .toFixed(decimals)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          const n = e.target.querySelector("[data-n]") as HTMLElement | null;
          if (n && !n.dataset.counted) {
            n.dataset.counted = "1";
            countUp(n);
          }
          io.unobserve(e.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -48px 0px" },
    );

    let i = 0;
    const mark = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        const node = el as HTMLElement;
        if (node.dataset.rv === "1") return;
        node.dataset.rv = "1";
        node.classList.add("rv");
        const kind = i % 3;
        if (kind === 1) node.classList.add("rv-left");
        else if (kind === 2) node.classList.add("rv-scale");
        node.style.setProperty("--rv-delay", `${(i % 6) * 70}ms`);
        i += 1;
        io.observe(node);
      });
    };

    mark();
    const t1 = window.setTimeout(mark, 80);
    const t2 = window.setTimeout(mark, 400);
    let debounce = 0;
    const mo = new MutationObserver(() => {
      clearTimeout(debounce);
      debounce = window.setTimeout(mark, 60);
    });
    const root = document.getElementById("app");
    if (root) mo.observe(root, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(debounce);
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
