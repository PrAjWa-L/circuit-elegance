import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50 mt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16 grid gap-10 md:gap-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-md bg-primary/10 border border-primary/30">
              <Zap className="w-4 h-4 text-primary" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold tracking-tight text-lg">
              VOLT<span className="text-primary">CORE</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            Industrial-grade electrical components engineered for the world's most demanding
            infrastructure. Trusted since 1987.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
            Company
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors">Products</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
            Contact
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="text-primary font-mono">+1 (713) 555-0142</li>
            <li>orders@voltcore.io</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
          <span>© 2026 VOLTCORE INDUSTRIAL SUPPLY</span>
          <span>ISO 9001:2015 · UL LISTED · CE CERTIFIED</span>
        </div>
      </div>
    </footer>
  );
}
