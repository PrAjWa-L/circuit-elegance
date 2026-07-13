import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Activity, Cpu, Factory, Award } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { products } from "@/lib/products";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VOLTCORE — Industrial Electrical Components & Distribution" },
      { name: "description", content: "Premium electrical parts distributor. Circuit breakers, drives, PLCs, and switchgear for industrial power infrastructure." },
      { property: "og:title", content: "VOLTCORE — Industrial Electrical Components" },
      { property: "og:description", content: "Engineered for the world's most demanding infrastructure. ISO 9001, UL, CE certified." },
    ],
  }),
  component: Home,
});




const capabilities = [
  { icon: ShieldCheck, title: "Circuit Protection", desc: "MCCBs, ACBs, and RCDs rated up to 6300A with type-tested arc-flash containment." },
  { icon: Activity, title: "Power Control", desc: "Contactors, soft-starters, and motor management from 9A to 1600A." },
  { icon: Cpu, title: "Automation", desc: "PLCs, HMIs, VFDs, and I/O systems certified to IEC 61131-3 and IEC 61508." },
  { icon: Factory, title: "Distribution", desc: "Busbar trunking, panelboards, and switchgear for LV and MV networks." },
];

function Home() {
  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <div className="absolute inset-0">
          <img
            src={hero}
            alt=""
            width={1920}
            height={1200}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-24 sm:pt-32 pb-24 sm:pb-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel text-[10px] sm:text-xs font-mono uppercase tracking-widest text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Est. 1987 · Distribution Centre
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.95]">
              Power the{" "}
              <span className="text-gradient-voltage">critical</span>
              <br />
              infrastructure.
            </h1>
            <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Industrial-grade circuit protection, motor control, and automation
              components. Engineered for uptime. Certified for scale.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Link
                to="/products"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold shadow-[0_0_40px_-8px_var(--color-primary)] hover:shadow-[0_0_60px_-4px_var(--color-primary)] transition-all"
              >
                Browse Catalog
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md border border-border hover:border-primary/50 hover:bg-surface transition-colors font-semibold"
              >
                Request a Quote
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="relative py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-16">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3">
                / 01 · Capabilities
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">
                Four pillars of industrial power distribution.
              </h2>
            </div>
            <Link to="/products" className="text-sm font-semibold text-primary hover:underline">
              View all products →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {capabilities.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative p-6 rounded-lg border border-border bg-surface hover:border-primary/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <c.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                <div className="absolute top-6 right-6 text-xs font-mono text-muted-foreground/50">
                  0{i + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-32 border-t border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3">
              / 02 · Featured Inventory
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight max-w-3xl">
              In-stock. Type-tested. Shipped in 48 hours.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 3).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  to="/products"
                  className="group block rounded-lg overflow-hidden border border-border bg-surface hover:border-primary/40 transition-all"
                >
                  <div className="aspect-square overflow-hidden bg-background">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">
                      {p.sku}
                    </div>
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{p.rating}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-12 md:p-16">
            <div className="absolute inset-0 grid-lines opacity-30" />
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-copper/20 blur-3xl" />
            <div className="relative">
              <Award className="w-10 h-10 text-copper mb-6" />
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-2xl">
                Have a project that can't afford downtime?
              </h2>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                Browse our catalog of industrial-grade components ready to ship
                from our distribution centre.
              </p>
              <Link
                to="/products"
                className="mt-10 inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Browse Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
