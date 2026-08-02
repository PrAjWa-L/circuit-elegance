import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
