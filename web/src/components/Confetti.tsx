"use client";

import { useEffect } from "react";

export function Confetti() {
  useEffect(() => {
    const cols = ["#8B5E3C", "#C4A484", "#A33B2B", "#5C4030", "#FAF6F0"];
    const nodes: HTMLElement[] = [];
    for (let i = 0; i < 70; i++) {
      const e = document.createElement("i");
      e.className = "cf";
      e.style.cssText = `left:${Math.random() * 100}vw;background:${cols[i % 5]};animation-delay:${Math.random() * 0.8}s;animation-duration:${2.4 + Math.random() * 1.6}s;border-radius:${i % 2 ? "50%" : "2px"}`;
      document.body.appendChild(e);
      nodes.push(e);
    }
    const t = setTimeout(() => nodes.forEach((n) => n.remove()), 5000);
    return () => {
      clearTimeout(t);
      nodes.forEach((n) => n.remove());
    };
  }, []);
  return null;
}
