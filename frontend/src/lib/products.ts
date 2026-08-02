import { useQuery } from "@tanstack/react-query";
import { api, assetUrl, mapProduct, type CompanyInfo, type MappedProduct } from "./api";

export type ProductCategory = string;

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  rating: string;
  image: string;
  description: string;
  price: number;
};

export function useProducts(options?: { featured?: boolean; category?: string }) {
  return useQuery({
    queryKey: ["products", options],
    queryFn: async () => {
      const data = await api.getProducts({
        featured: options?.featured,
        category: options?.category,
        limit: 100,
      });
      return data.items.map(mapProduct) as Product[];
    },
    staleTime: 60_000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => api.getProduct(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.getCategories(),
    staleTime: 60_000,
  });
}

export function useCompany() {
  return useQuery({
    queryKey: ["company"],
    queryFn: () => api.getCompany(),
    staleTime: 60_000,
  });
}

export function companyContact(company: CompanyInfo | undefined) {
  return {
    phone: company?.phone ?? "",
    email: company?.email ?? "",
    name: company?.name ?? "",
    about: company?.about ?? "",
    logo: assetUrl(company?.logo_url),
  };
}

export type { MappedProduct };
