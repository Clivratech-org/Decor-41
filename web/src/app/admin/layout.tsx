import { getAdminSession } from "@/lib/auth";
import AdminLayoutClient from "./AdminLayoutClient";
import "./admin.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  return <AdminLayoutClient hasSession={!!session}>{children}</AdminLayoutClient>;
}
