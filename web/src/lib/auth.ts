import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const COOKIE = "d41_admin";

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "decor41-dev-secret");
}

export async function loginAdmin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!admin) return null;
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return null;
  const token = await new SignJWT({ sub: admin.id, email: admin.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return admin;
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getAdminSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const id = String(payload.sub || "");
    if (!id) return null;
    return prisma.admin.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}
