import { clearAuthTokens, getAccessToken, setAuthTokens } from "./auth";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & {
  token?: string;
};

let refreshInFlight: Promise<AuthTokens | null> | null = null;

function redirectToLogin() {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

async function refreshSession(): Promise<AuthTokens | null> {
  refreshInFlight ??= fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  })
    .then(async (response) => {
      if (!response.ok) return null;
      const tokens = (await response.json()) as AuthTokens;
      setAuthTokens(tokens);
      return tokens;
    })
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

async function request<T>(path: string, options: RequestOptions = {}, retried = false): Promise<T> {
  const { token, headers, ...rest } = options;
  const authToken = token ?? getAccessToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(rest.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  if (response.status === 401 && !retried && !["/auth/login", "/auth/refresh", "/auth/logout"].includes(path)) {
    const tokens = await refreshSession();
    if (tokens) return request<T>(path, { ...options, token: tokens.access_token }, true);
    clearAuthTokens();
    redirectToLogin();
  }

  if (!response.ok) {
    let detail: unknown;
    try {
      detail = await response.json();
    } catch {
      detail = await response.text();
    }
    throw new ApiError(`API request failed: ${response.status}`, response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function assetUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const origin = API_BASE.replace(/\/api\/v1\/?$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export type ProductImage = {
  id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category_id: string;
  category_name: string;
  rating: string | null;
  description: string | null;
  price: number;
  specifications: Record<string, unknown> | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  images: ProductImage[];
  image: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductList = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
};

export type ProductQuery = {
  category?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  product_count: number;
};

export type CompanyInfo = {
  id: string;
  name: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  about: string | null;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
};

export type CategoryInput = {
  name: string;
  slug?: string;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

export type ProductInput = {
  sku: string;
  name: string;
  slug?: string;
  category_id: string;
  rating?: string | null;
  description?: string | null;
  price: number;
  specifications?: Record<string, unknown> | null;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
};

export type CompanyInfoInput = Partial<Pick<CompanyInfo, "name" | "address" | "phone" | "email" | "about">>;

export type Upload = {
  id: string | null;
  url: string;
  filename: string;
};

export const api = {
  getProducts(params?: ProductQuery) {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.featured !== undefined) query.set("featured", String(params.featured));
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return request<ProductList>(`/products${qs ? `?${qs}` : ""}`);
  },

  getProduct(slug: string) {
    return request<Product>(`/products/${slug}`);
  },

  getCategories() {
    return request<Category[]>("/categories");
  },

  getCompany() {
    return request<CompanyInfo>("/company");
  },

  login(email: string, password: string) {
    return request<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then((tokens) => {
      setAuthTokens(tokens);
      return tokens;
    });
  },

  refresh(refreshToken?: string) {
    return request<AuthTokens>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
    }).then((tokens) => {
      setAuthTokens(tokens);
      return tokens;
    });
  },

  me(token: string) {
    return request<AdminUser>("/auth/me", { token });
  },

  logout(refreshToken?: string) {
    return request<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
    }).finally(clearAuthTokens);
  },

  getAdminProducts(token: string, params?: ProductQuery) {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.featured !== undefined) query.set("featured", String(params.featured));
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return request<ProductList>(`/admin/products${qs ? `?${qs}` : ""}`, { token });
  },

  createProduct(token: string, payload: ProductInput) {
    return request<Product>("/admin/products", { method: "POST", token, body: JSON.stringify(payload) });
  },

  updateProduct(token: string, productId: string, payload: Partial<ProductInput>) {
    return request<Product>(`/admin/products/${productId}`, { method: "PUT", token, body: JSON.stringify(payload) });
  },

  deleteProduct(token: string, productId: string) {
    return request<void>(`/admin/products/${productId}`, { method: "DELETE", token });
  },

  getAdminCategories(token: string) {
    return request<Category[]>("/admin/categories", { token });
  },

  createCategory(token: string, payload: CategoryInput) {
    return request<Category>("/admin/categories", { method: "POST", token, body: JSON.stringify(payload) });
  },

  updateCategory(token: string, categoryId: string, payload: Partial<CategoryInput>) {
    return request<Category>(`/admin/categories/${categoryId}`, { method: "PUT", token, body: JSON.stringify(payload) });
  },

  deleteCategory(token: string, categoryId: string) {
    return request<void>(`/admin/categories/${categoryId}`, { method: "DELETE", token });
  },

  updateCompany(token: string, payload: CompanyInfoInput) {
    return request<CompanyInfo>("/admin/company", { method: "PUT", token, body: JSON.stringify(payload) });
  },

  uploadProductImages(token: string, productId: string, files: File[], setPrimary = false) {
    const body = new FormData();
    files.forEach((file) => body.append("files", file));
    return request<Product>(`/admin/products/${productId}/images?set_primary=${setPrimary}`, { method: "POST", token, body });
  },

  deleteProductImage(token: string, productId: string, imageId: string) {
    return request<Product>(`/admin/products/${productId}/images/${imageId}`, { method: "DELETE", token });
  },

  uploadCompanyLogo(token: string, file: File) {
    const body = new FormData();
    body.append("file", file);
    return request<CompanyInfo>("/admin/company/logo", { method: "POST", token, body });
  },

  uploadImages(token: string, files: File[], subdirectory: "products" | "company" | "misc" = "misc") {
    const body = new FormData();
    files.forEach((file) => body.append("files", file));
    return request<{ uploads: Upload[] }>(`/admin/uploads?subdirectory=${subdirectory}`, { method: "POST", token, body });
  },
};

export function mapProduct(p: Product) {
  return {
    id: p.slug,
    sku: p.sku,
    name: p.name,
    category: p.category_name as Product["category_name"] & string,
    rating: p.rating ?? "",
    image: assetUrl(p.image),
    description: p.description ?? "",
    price: Number(p.price),
  };
}

export type MappedProduct = ReturnType<typeof mapProduct>;

export const categoriesWithAll = ["All"] as const;
