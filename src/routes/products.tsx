import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Layout } from "@/components/site/Layout";
import { products, categories } from "@/lib/products";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — Industrial Electrical Components | VOLTCORE" },
      { name: "description", content: "Browse circuit breakers, contactors, VFDs, PLCs, busbars, and surge protection. In-stock, type-tested, 48-hour dispatch." },
      { property: "og:title", content: "VOLTCORE Product Catalog" },
      { property: "og:description", content: "42,000+ SKUs of industrial electrical components." },
    ],
  }),
  component: Products,
});

function Products() {
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const filtered = cat === "All" ? products : products.filter((p) => p.category === cat);

  return (
    <Layout>
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-4">
              / Catalog · 42,000+ SKUs
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95] max-w-3xl">
              Every component,
              <br />
              <span className="text-gradient-voltage">type-tested.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              A selection of our most-requested industrial electrical components.
              Contact us for the full 42,000-SKU catalog.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap gap-2 mb-10 pb-6 border-b border-border">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-md text-sm font-mono uppercase tracking-widest transition-colors ${
                  cat === c
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <motion.div
                  layout
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group rounded-lg overflow-hidden border border-border bg-surface hover:border-primary/40 transition-all"
                >
                  <div className="aspect-square overflow-hidden bg-background relative">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 px-2 py-1 rounded glass-panel text-[10px] font-mono uppercase tracking-widest text-primary">
                      {p.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">
                      {p.sku}
                    </div>
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{p.rating}</p>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-2">
                      {p.description}
                    </p>
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                          From
                        </div>
                        <div className="text-lg font-display font-bold">
                          ${p.price.toLocaleString()}
                        </div>
                      </div>
                      <button className="text-xs font-semibold text-primary hover:underline">
                        Request Quote →
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
