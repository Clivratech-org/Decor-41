"use client";

import { useEffect, useState } from "react";

/** Renders an img only after a successful load; otherwise null (or children). */
export function SafeImage({
  src,
  alt = "",
  className,
  style,
  fallback = null,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
}) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!src) {
      setOk(false);
      return;
    }
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (alive) setOk(true);
    };
    img.onerror = () => {
      if (alive) setOk(false);
    };
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);

  if (!src || !ok) return <>{fallback}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} style={style} />;
}
