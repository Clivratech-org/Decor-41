export function rupees(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function mrpFrom(price: number) {
  return Math.round((price * 1.25) / 10) * 10;
}
