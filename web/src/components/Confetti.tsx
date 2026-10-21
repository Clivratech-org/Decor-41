"use client";

import { useEffect } from "react";

export function Confetti() {
  useEffect(() => {
    const cols = ["#c6ff3d", "#3dd6ff", "#ff5a6e", "#ffc93d", "#fff"];
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
