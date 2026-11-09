import { auth, signIn } from "@/lib/auth-user";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await auth();
  const { next } = await searchParams;
  if (session?.user) redirect(next || "/");

  const configured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="w" style={{ maxWidth: 480, padding: "80px 20px 100px" }}>
      <div className="crumb">
        <Link href="/">Home</Link> / Sign in
      </div>
      <div className="panel" style={{ textAlign: "center", marginTop: 24 }}>
        <h1 style={{ fontSize: 36, margin: "0 0 10px" }}>Sign in</h1>
        <p className="mut" style={{ marginBottom: 28 }}>
          Use Google for a quick Decor 41 account — save checkout details and track requests.
        </p>
        {configured ? (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: next || "/" });
            }}
          >
            <button className="btn full" type="submit">
              Continue with Google
            </button>
          </form>
        ) : (
          <p className="mut">
            Google login is not configured yet. Add <code>GOOGLE_CLIENT_ID</code> and{" "}
            <code>GOOGLE_CLIENT_SECRET</code> to the environment.
          </p>
        )}
      </div>
    </div>
  );
}
