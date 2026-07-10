import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Package, DollarSign, Users, TrendingUp, Zap, Search, Bell, Settings,
  ArrowUpRight, ArrowDownRight, MoreHorizontal
} from "lucide-react";
import { products } from "@/lib/products";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — VOLTCORE" },
      { name: "description", content: "Internal operations dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const kpis = [
  { label: "Revenue (MTD)", value: "$2.84M", delta: "+12.4%", up: true, icon: DollarSign },
  { label: "Open Orders", value: "1,284", delta: "+8.1%", up: true, icon: Package },
  { label: "Active Customers", value: "3,647", delta: "+3.2%", up: true, icon: Users },
  { label: "Fulfillment SLA", value: "98.4%", delta: "-0.3%", up: false, icon: TrendingUp },
];

const orders = [
  { id: "VC-84291", customer: "ExxonMobil Refining", value: 84200, status: "Shipped", region: "Houston" },
  { id: "VC-84288", customer: "Siemens Energy", value: 42800, status: "Processing", region: "Rotterdam" },
  { id: "VC-84285", customer: "Petronas", value: 128400, status: "Confirmed", region: "Singapore" },
  { id: "VC-84281", customer: "ADNOC", value: 62100, status: "Shipped", region: "Dubai" },
  { id: "VC-84279", customer: "Equinor", value: 28900, status: "Processing", region: "Rotterdam" },
];

const statusColors: Record<string, string> = {
  Shipped: "bg-primary/15 text-primary border-primary/30",
  Processing: "bg-copper/15 text-copper border-copper/30",
  Confirmed: "bg-muted text-muted-foreground border-border",
};

function Admin() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-surface/50">
        <Link to="/" className="flex items-center gap-2 px-6 h-16 border-b border-border">
          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-primary/10 border border-primary/30">
            <Zap className="w-4 h-4 text-primary" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold tracking-tight">
            VOLT<span className="text-primary">CORE</span>
          </span>
        </Link>
        <nav className="p-3 space-y-1 flex-1">
          {[
            { label: "Overview", active: true },
            { label: "Orders" },
            { label: "Inventory" },
            { label: "Customers" },
            { label: "Shipments" },
            { label: "Reports" },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                item.active
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-surface">
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search orders, SKUs, customers…"
                className="w-full pl-10 pr-4 py-2 rounded-md bg-surface border border-border text-sm focus:border-primary/40 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-md hover:bg-surface">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-copper" />
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-border">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium">Alex Reyes</div>
                <div className="text-xs text-muted-foreground">Ops Manager</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-semibold text-sm">
                AR
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="mb-8">
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">
              / Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground mt-1">Real-time operations · Updated 2 min ago</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((k, i) => (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="p-5 rounded-lg border border-border bg-surface"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <k.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className={`inline-flex items-center gap-1 text-xs font-mono ${k.up ? "text-primary" : "text-destructive"}`}>
                    {k.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {k.delta}
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-display font-bold">{k.value}</div>
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
                  {k.label}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-2 p-6 rounded-lg border border-border bg-surface"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold">Revenue trend</h2>
                  <p className="text-xs text-muted-foreground">Last 12 months</p>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <MiniChart />
            </motion.div>

            {/* Top products */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="p-6 rounded-lg border border-border bg-surface"
            >
              <h2 className="font-semibold mb-6">Top SKUs (MTD)</h2>
              <div className="space-y-4">
                {products.slice(0, 5).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-background shrink-0">
                      <img src={p.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{p.sku}</div>
                    </div>
                    <div className="text-xs font-mono text-primary shrink-0">
                      {(240 - i * 32)} u
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Orders table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-6 p-6 rounded-lg border border-border bg-surface"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold">Recent orders</h2>
                <p className="text-xs text-muted-foreground">Across all warehouses</p>
              </div>
              <button className="text-xs font-semibold text-primary hover:underline">View all →</button>
            </div>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-mono uppercase tracking-widest text-muted-foreground border-b border-border">
                    <th className="text-left py-3 pr-6 font-normal">Order</th>
                    <th className="text-left py-3 pr-6 font-normal">Customer</th>
                    <th className="text-left py-3 pr-6 font-normal">Region</th>
                    <th className="text-left py-3 pr-6 font-normal">Status</th>
                    <th className="text-right py-3 font-normal">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                      <td className="py-4 pr-6 font-mono text-primary">{o.id}</td>
                      <td className="py-4 pr-6 font-medium">{o.customer}</td>
                      <td className="py-4 pr-6 text-muted-foreground">{o.region}</td>
                      <td className="py-4 pr-6">
                        <span className={`inline-block px-2 py-1 rounded border text-xs font-mono ${statusColors[o.status]}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-4 text-right font-semibold">${o.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function MiniChart() {
  const data = [42, 58, 51, 68, 62, 78, 74, 88, 82, 96, 92, 108];
  const max = Math.max(...data);
  const w = 100;
  const h = 40;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
  const area = `0,${h} ${points} ${w},${h}`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-48">
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.19 240)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="oklch(0.72 0.19 240)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#g)" />
        <polyline
          points={points}
          fill="none"
          stroke="oklch(0.72 0.19 240)"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-4 flex justify-between text-xs font-mono text-muted-foreground">
        {["Jan", "Mar", "May", "Jul", "Sep", "Nov"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}
