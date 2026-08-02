import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { ApiError, api } from "@/lib/api";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.login(email, password);
      await navigate({ to: "/admin" });
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 401 ? "Incorrect email or password." : "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-border bg-surface p-6 sm:p-8">
        <div className="text-xs font-mono uppercase tracking-widest text-primary">/ Admin access</div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use your VOLTCORE administrator account.</p>
        {error && <p role="alert" className="mt-5 text-sm text-destructive">{error}</p>}
        <label className="mt-6 block text-xs font-mono uppercase tracking-widest text-muted-foreground">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" /></label>
        <label className="mt-5 block text-xs font-mono uppercase tracking-widest text-muted-foreground">Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" /></label>
        <button disabled={submitting} type="submit" className="mt-7 w-full rounded-md bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">{submitting ? "Signing in…" : "Sign in"}</button>
        <Link to="/" className="mt-5 block text-center text-sm text-muted-foreground hover:text-primary">Return to site</Link>
      </form>
    </main>
  );
}
