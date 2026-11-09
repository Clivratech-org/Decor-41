/** Build a wa.me deep link for ordering the given lines. */
export function whatsappOrderUrl(
  phone: string,
  lines: { name: string; variant?: string; size?: string; qty: number; price: number }[],
  total?: number,
) {
  const digits = phone.replace(/\D/g, "");
  const body = [
    "Hi Decor 41 — I'd like to place an order:",
    ...lines.map(
      (l, i) =>
        `${i + 1}. ${l.name}${l.variant ? ` (${l.variant})` : ""}${l.size ? ` · ${l.size}` : ""} × ${l.qty} — ₹${l.price * l.qty}`,
    ),
    total != null ? `Total: ₹${total}` : "",
    "",
    "Please confirm availability and payment.",
  ]
    .filter(Boolean)
    .join("\n");
  return `https://wa.me/${digits}?text=${encodeURIComponent(body)}`;
}
