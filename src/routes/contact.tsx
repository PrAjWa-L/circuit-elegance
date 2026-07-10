import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { Layout } from "@/components/site/Layout";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact VOLTCORE — Talk to an Engineer" },
      { name: "description", content: "Reach our field-engineering team for quotes, specifications, and project support. Response within 4 business hours." },
      { property: "og:title", content: "Contact VOLTCORE" },
      { property: "og:description", content: "Talk directly to a licensed electrical engineer." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <Layout>
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-4">/ Contact</div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
              Talk to an
              <br />
              <span className="text-gradient-voltage">engineer.</span>
            </h1>
            <p className="mt-8 text-lg text-muted-foreground max-w-2xl">
              Every quote goes through a licensed electrical engineer. Expect a
              response within four business hours.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-32">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: Phone, label: "Phone", value: "+1 (713) 555-0142", meta: "Mon–Fri · 6am–8pm CT" },
              { icon: Mail, label: "Email", value: "engineering@voltcore.io", meta: "24-hour response SLA" },
              { icon: MapPin, label: "HQ", value: "1200 Industrial Ave, Houston TX 77002", meta: "Warehouses: Rotterdam · Singapore · Dubai" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 rounded-lg border border-border bg-surface"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    {item.label}
                  </div>
                </div>
                <div className="font-semibold text-lg">{item.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{item.meta}</div>
              </motion.div>
            ))}
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="lg:col-span-3 p-8 md:p-10 rounded-lg border border-border bg-surface"
          >
            {sent ? (
              <div className="text-center py-16">
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-bold">Request received.</h3>
                <p className="mt-3 text-muted-foreground">
                  An engineer will be in touch within 4 business hours.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-8">Request a quote</h2>
                <div className="grid gap-5">
                  {[
                    { name: "name", label: "Full Name", type: "text" },
                    { name: "company", label: "Company", type: "text" },
                    { name: "email", label: "Work Email", type: "email" },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        {f.label}
                      </label>
                      <input
                        required
                        type={f.type}
                        className="mt-2 w-full px-4 py-3 rounded-md bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                      Project Requirements
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Specifications, quantities, timeline…"
                      className="mt-2 w-full px-4 py-3 rounded-md bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-2 inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-[0_0_30px_-8px_var(--color-primary)]"
                  >
                    Send Request <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </motion.form>
        </div>
      </section>
    </Layout>
  );
}
