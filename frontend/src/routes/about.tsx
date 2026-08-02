import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Layout } from "@/components/site/Layout";
import about from "@/assets/about.jpg";
import { CheckCircle2 } from "lucide-react";
import { companyContact, useCompany } from "@/lib/products";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About VOLTCORE — Industrial Electrical Distribution Since 1987" },
      { name: "description", content: "Family-owned industrial electrical distributor serving oil & gas, utilities, manufacturing, and data-center customers across 62 countries." },
      { property: "og:title", content: "About VOLTCORE" },
      { property: "og:description", content: "37+ years of engineering electrical infrastructure for the world's most demanding industries." },
    ],
  }),
  component: About,
});

const timeline = [
  { year: "1987", title: "Founded in Houston", desc: "Started as a two-person switchgear supplier to Gulf Coast refineries." },
  { year: "1998", title: "ISO 9001 Certified", desc: "First distributor in the region to achieve full quality-system certification." },
  { year: "2011", title: "Global Expansion", desc: "Opened logistics hubs in Rotterdam, Singapore, and Dubai." },
  { year: "2019", title: "Automation Division", desc: "Launched dedicated PLC, VFD, and industrial-IoT product line." },
  { year: "2026", title: "42K SKUs, 62 Countries", desc: "Today, one of the largest independent industrial distributors worldwide." },
];

const values = [
  "Uptime is non-negotiable — every component is type-tested before it ships.",
  "Every quote goes through a licensed electrical engineer.",
  "48-hour dispatch from three global warehouses.",
  "Manufacturer-authorized service across 40+ premium brands.",
];

function About() {
  const { data: company, isLoading: companyLoading, isError: companyError } = useCompany();
  const info = companyContact(company);

  return (
    <Layout>
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-4">
              / About
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
              Built for the plants that
              <br />
              <span className="text-gradient-voltage">never stop running.</span>
            </h1>
            <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
              {companyLoading ? "Loading company information…" : companyError ? "Company information is unavailable right now." : info.about || "No company information has been published yet."}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 md:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl overflow-hidden border border-border aspect-[16/9] md:aspect-[21/9]"
          >
            <img src={about} alt="Factory floor" width={1600} height={1000} loading="lazy" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-32 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-10 md:gap-16">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3">/ Principles</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              How we operate.
            </h2>
          </div>
          <div className="space-y-5 sm:space-y-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex gap-4 items-start"
              >
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <p className="text-base sm:text-lg leading-relaxed">{v}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3">/ Timeline</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-12 md:mb-16">
            Nearly four decades of infrastructure.
          </h2>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-12">
              {timeline.map((t, i) => (
                <motion.div
                  key={t.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                  className={`relative grid md:grid-cols-2 gap-8 ${i % 2 ? "md:text-right" : ""}`}
                >
                  <div className={`pl-12 md:pl-0 ${i % 2 ? "md:order-2 md:pl-12" : "md:pr-12"}`}>
                    <div className="text-3xl font-display font-bold text-primary">{t.year}</div>
                    <h3 className="mt-2 text-xl font-semibold">{t.title}</h3>
                    <p className="mt-2 text-muted-foreground">{t.desc}</p>
                  </div>
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-2 w-3 h-3 rounded-full bg-primary shadow-[0_0_20px_var(--color-primary)]" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
