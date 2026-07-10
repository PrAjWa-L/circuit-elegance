import breaker from "@/assets/prod-breaker.jpg";
import contactor from "@/assets/prod-contactor.jpg";
import vfd from "@/assets/prod-vfd.jpg";
import plc from "@/assets/prod-plc.jpg";
import busbar from "@/assets/prod-busbar.jpg";
import spd from "@/assets/prod-spd.jpg";

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: "Protection" | "Control" | "Automation" | "Distribution";
  rating: string;
  image: string;
  description: string;
  price: number;
};

export const products: Product[] = [
  {
    id: "mccb-400",
    sku: "VC-MCCB-400A",
    name: "Molded Case Circuit Breaker",
    category: "Protection",
    rating: "400A · 690V · 65kA",
    image: breaker,
    description: "Thermal-magnetic protection for LV distribution networks with integrated arc-flash mitigation.",
    price: 1284,
  },
  {
    id: "cont-95",
    sku: "VC-CT-95A",
    name: "Industrial Contactor",
    category: "Control",
    rating: "95A · 45kW · AC-3",
    image: contactor,
    description: "Heavy-duty three-pole contactor with auxiliary contacts and 24V DC coil actuation.",
    price: 342,
  },
  {
    id: "vfd-75",
    sku: "VC-VFD-75kW",
    name: "Variable Frequency Drive",
    category: "Automation",
    rating: "75kW · IP20 · Modbus",
    image: vfd,
    description: "Sensorless vector-control drive with sinusoidal filter and Ethernet/IP fieldbus.",
    price: 4820,
  },
  {
    id: "plc-c8",
    sku: "VC-PLC-C8",
    name: "Compact PLC Controller",
    category: "Automation",
    rating: "32 I/O · Ethernet · CODESYS",
    image: plc,
    description: "IEC 61131-3 programmable controller with expandable I/O and OPC UA server.",
    price: 1650,
  },
  {
    id: "bb-1600",
    sku: "VC-BB-1600A",
    name: "Copper Busbar System",
    category: "Distribution",
    rating: "1600A · 3P+N+PE · IP55",
    image: busbar,
    description: "Compact busbar trunking with tin-plated copper conductors and plug-in tap-off units.",
    price: 6420,
  },
  {
    id: "spd-t2",
    sku: "VC-SPD-T2",
    name: "Type 2 Surge Protector",
    category: "Protection",
    rating: "40kA · 275V · Class II",
    image: spd,
    description: "MOV-based surge protection with remote signaling and pluggable modules.",
    price: 289,
  },
];

export const categories = ["All", "Protection", "Control", "Automation", "Distribution"] as const;
