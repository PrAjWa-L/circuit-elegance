import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { FormEvent, useState, type ComponentProps } from "react";
import {
  LogOut, Package, Image, Layers, Plus, Star, Upload, Zap, Search, Bell, Settings, MoreHorizontal
} from "lucide-react";
import { api, assetUrl, type Category, type CompanyInfo, type Product, type ProductInput } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

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

function Admin() {
  const queryClient = useQueryClient();
  const [productEditor, setProductEditor] = useState<Product | "new" | null>(null);
  const [categoryEditor, setCategoryEditor] = useState<Category | "new" | null>(null);
  const [actionError, setActionError] = useState("");
  const currentUser = useQuery({ queryKey: ["current-admin"], queryFn: () => api.me(getAccessToken() ?? ""), retry: false });
  const products = useQuery({ queryKey: ["admin-products"], queryFn: () => api.getAdminProducts(getAccessToken() ?? "", { limit: 100 }), enabled: Boolean(currentUser.data) });
  const categories = useQuery({ queryKey: ["admin-categories"], queryFn: () => api.getAdminCategories(getAccessToken() ?? ""), enabled: Boolean(currentUser.data) });
  const company = useQuery({ queryKey: ["admin-company"], queryFn: () => api.getCompany(), enabled: Boolean(currentUser.data) });
  const items = products.data?.items ?? [];
  const kpis = [
    { label: "Catalog products", value: products.data?.total ?? 0, icon: Package },
    { label: "Featured products", value: items.filter((product) => product.is_featured).length, icon: Star },
    { label: "Categories", value: categories.data?.length ?? 0, icon: Layers },
    { label: "Product images", value: items.reduce((count, product) => count + product.images.length, 0), icon: Image },
  ];

  if (currentUser.isLoading) return <div className="min-h-screen bg-background p-8 text-muted-foreground">Checking your session…</div>;
  if (currentUser.isError) return <div className="min-h-screen bg-background p-8 text-destructive">Your session has expired. Redirecting to sign in…</div>;

  function invalidateCatalog() {
    setActionError("");
    void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  function reportError(message: string) {
    setActionError(message);
    toast.error(message);
  }

  async function logout() {
    await api.logout();
    window.location.assign("/login");
  }

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
        <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md min-w-0">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search…"
                className="w-full pl-10 pr-3 py-2 rounded-md bg-surface border border-border text-sm focus:border-primary/40 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button className="relative p-2 rounded-md hover:bg-surface">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-copper" />
            </button>
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-border">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium">{currentUser.data.full_name}</div>
                <div className="text-xs text-muted-foreground">Administrator</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-semibold text-sm shrink-0">
                {currentUser.data.full_name.split(" ").map((name) => name[0]).join("").slice(0, 2)}
              </div>
            </div>
            <button onClick={() => void logout()} className="p-2 text-muted-foreground hover:text-primary" aria-label="Sign out"><LogOut className="w-4 h-4" /></button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <div className="mb-8">
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">
              / Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground mt-1">Live catalog operations</p>
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
                  <div className="text-xs font-mono text-primary">Live</div>
                </div>
                <div className="text-2xl md:text-3xl font-display font-bold">{products.isLoading || categories.isLoading ? "…" : k.value}</div>
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
                  {k.label}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Catalog status */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-2 p-6 rounded-lg border border-border bg-surface"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold">Catalog status</h2>
                  <p className="text-xs text-muted-foreground">Data available from the current backend</p>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              {products.isError || categories.isError ? <p className="text-sm text-destructive">Catalog data could not be loaded.</p> : <div className="py-14 text-center text-sm text-muted-foreground">Product, category, and image counts update from the API.</div>}
            </motion.div>

            {/* Top products */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="p-6 rounded-lg border border-border bg-surface"
            >
              <h2 className="font-semibold mb-6">Featured products</h2>
              <div className="space-y-4">
                {products.isLoading ? <p className="text-sm text-muted-foreground">Loading featured products…</p> : products.isError ? <p className="text-sm text-destructive">Featured products could not be loaded.</p> : items.filter((product) => product.is_featured).length === 0 ? <p className="text-sm text-muted-foreground">No featured products are available.</p> : items.filter((product) => product.is_featured).slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-background shrink-0">
                      {p.image ? <img src={assetUrl(p.image)} alt="" className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{p.sku}</div>
                    </div>
                    <div className="text-xs font-mono text-primary shrink-0">
                      {p.images.length} img
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Catalog table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-6 p-4 sm:p-6 rounded-lg border border-border bg-surface"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold">Catalog products</h2>
                <p className="text-xs text-muted-foreground">Current products from the API</p>
              </div>
              <span className="text-xs font-semibold text-primary">{products.data?.total ?? 0} total</span>
            </div>
            <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-mono uppercase tracking-widest text-muted-foreground border-b border-border">
                    <th className="text-left py-3 pr-6 font-normal">SKU</th>
                    <th className="text-left py-3 pr-6 font-normal">Product</th>
                    <th className="text-left py-3 pr-6 font-normal">Category</th>
                    <th className="text-left py-3 pr-6 font-normal">Status</th>
                    <th className="text-right py-3 font-normal">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.isLoading ? <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Loading products…</td></tr> : products.isError ? <tr><td colSpan={5} className="py-6 text-center text-destructive">Products could not be loaded.</td></tr> : items.length === 0 ? <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No products are available.</td></tr> : items.map((product) => (
                    <tr key={product.id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                      <td className="py-4 pr-6 font-mono text-primary">{product.sku}</td>
                      <td className="py-4 pr-6 font-medium">{product.name}</td>
                      <td className="py-4 pr-6 text-muted-foreground">{product.category_name}</td>
                      <td className="py-4 pr-6">
                        <span className="inline-block px-2 py-1 rounded border text-xs font-mono bg-primary/15 text-primary border-primary/30">
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 text-right font-semibold">${Number(product.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {actionError && <p className="mt-6 text-sm text-destructive">{actionError}</p>}
          <AdminManagement
            categories={categories.data ?? []}
            company={company.data}
            companyLoading={company.isLoading}
            companyError={company.isError}
            products={items}
            onError={reportError}
            onProductEditor={setProductEditor}
            onCategoryEditor={setCategoryEditor}
            onCatalogChanged={invalidateCatalog}
            onCompanyChanged={() => { void queryClient.invalidateQueries({ queryKey: ["admin-company"] }); void queryClient.invalidateQueries({ queryKey: ["company"] }); }}
          />
        </main>
      </div>
      <ProductEditor product={productEditor} categories={categories.data ?? []} onClose={() => setProductEditor(null)} onError={reportError} onSaved={invalidateCatalog} />
      <CategoryEditor category={categoryEditor} onClose={() => setCategoryEditor(null)} onError={reportError} onSaved={invalidateCatalog} />
      <Toaster />
    </div>
  );
}

type ManagementProps = {
  products: Product[];
  categories: Category[];
  company: CompanyInfo | undefined;
  companyLoading: boolean;
  companyError: boolean;
  onError: (message: string) => void;
  onProductEditor: (product: Product | "new") => void;
  onCategoryEditor: (category: Category | "new") => void;
  onCatalogChanged: () => void;
  onCompanyChanged: () => void;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

function AdminManagement(props: ManagementProps) {
  const token = getAccessToken() ?? "";
  const [productToArchive, setProductToArchive] = useState<Product | null>(null);
  const [categoryToArchive, setCategoryToArchive] = useState<Category | null>(null);
  const deleteProduct = useMutation({
    mutationFn: (id: string) => api.deleteProduct(token, id),
    onSuccess: () => { props.onCatalogChanged(); setProductToArchive(null); toast.success("Product archived."); },
    onError: (error) => props.onError(errorMessage(error)),
  });
  const deleteCategory = useMutation({
    mutationFn: (id: string) => api.deleteCategory(token, id),
    onSuccess: () => { props.onCatalogChanged(); setCategoryToArchive(null); toast.success("Category archived."); },
    onError: (error) => props.onError(errorMessage(error)),
  });

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <section className="rounded-lg border border-border bg-surface p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="font-semibold">Manage products</h2><p className="text-xs text-muted-foreground">Create, edit, archive, and upload product images.</p></div><button onClick={() => props.onProductEditor("new")} disabled={props.categories.length === 0} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Plus className="w-4 h-4" /> Product</button></div>
        {props.categories.length === 0 && <p className="mb-4 text-sm text-destructive">Create a category before creating a product.</p>}
        <div className="max-h-80 overflow-auto">
          {props.products.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No products available.</p> : props.products.map((product) => <div key={product.id} className="flex items-center justify-between gap-3 border-t border-border py-3 first:border-t-0"><div className="min-w-0"><p className="truncate text-sm font-medium">{product.name}</p><p className="text-xs font-mono text-muted-foreground">{product.sku}</p></div><div className="flex shrink-0 gap-2"><button onClick={() => props.onProductEditor(product)} className="text-xs font-semibold text-primary hover:underline">Edit</button><button disabled={deleteProduct.isPending} onClick={() => setProductToArchive(product)} className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50">Archive</button></div></div>)}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="font-semibold">Manage categories</h2><p className="text-xs text-muted-foreground">Organize the public product catalog.</p></div><button onClick={() => props.onCategoryEditor("new")} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><Plus className="w-4 h-4" /> Category</button></div>
        <div className="max-h-80 overflow-auto">
          {props.categories.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No categories available.</p> : props.categories.map((category) => <div key={category.id} className="flex items-center justify-between gap-3 border-t border-border py-3 first:border-t-0"><div><p className="text-sm font-medium">{category.name}</p><p className="text-xs text-muted-foreground">{category.product_count} active products</p></div><div className="flex gap-2"><button onClick={() => props.onCategoryEditor(category)} className="text-xs font-semibold text-primary hover:underline">Edit</button><button disabled={deleteCategory.isPending || category.product_count > 0} onClick={() => setCategoryToArchive(category)} className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50">Archive</button></div></div>)}
        </div>
      </section>

      <CompanySettings company={props.company} isLoading={props.companyLoading} isError={props.companyError} onError={props.onError} onSaved={props.onCompanyChanged} />
      <ArchiveDialog open={Boolean(productToArchive)} name={productToArchive?.name ?? ""} loading={deleteProduct.isPending} onCancel={() => setProductToArchive(null)} onConfirm={() => productToArchive && deleteProduct.mutate(productToArchive.id)} />
      <ArchiveDialog open={Boolean(categoryToArchive)} name={categoryToArchive?.name ?? ""} loading={deleteCategory.isPending} onCancel={() => setCategoryToArchive(null)} onConfirm={() => categoryToArchive && deleteCategory.mutate(categoryToArchive.id)} />
    </div>
  );
}

function ArchiveDialog({ open, name, loading, onCancel, onConfirm }: { open: boolean; name: string; loading: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <AlertDialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Archive {name}?</AlertDialogTitle><AlertDialogDescription>This removes it from the active catalog. You can restore it later by editing it through the API.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel><AlertDialogAction disabled={loading} onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{loading ? "Archiving…" : "Archive"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}

function ProductEditor({ product, categories, onClose, onError, onSaved }: { product: Product | "new" | null; categories: Category[]; onClose: () => void; onError: (message: string) => void; onSaved: () => void }) {
  const token = getAccessToken() ?? "";
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: async (event: FormEvent<HTMLFormElement>) => {
      const form = new FormData(event.currentTarget);
      const specificationText = String(form.get("specifications") || "").trim();
      const payload: ProductInput = { sku: String(form.get("sku")), name: String(form.get("name")), category_id: String(form.get("category_id")), price: Number(form.get("price")), slug: String(form.get("slug") || "") || undefined, rating: String(form.get("rating") || "") || null, description: String(form.get("description") || "") || null, specifications: specificationText ? JSON.parse(specificationText) : null, is_featured: form.get("is_featured") === "on", is_active: form.get("is_active") === "on" };
      const saved = product === "new" ? await api.createProduct(token, payload) : await api.updateProduct(token, product!.id, payload);
      const files = form.getAll("images").filter((file): file is File => file instanceof File && file.size > 0);
      if (files.length) await api.uploadProductImages(token, saved.id, files, saved.images.length === 0);
    },
    onSuccess: () => { onSaved(); toast.success(product === "new" ? "Product created." : "Product updated."); onClose(); },
    onError: (error) => onError(errorMessage(error)),
  });
  const removeImage = useMutation({ mutationFn: (imageId: string) => api.deleteProductImage(token, product && product !== "new" ? product.id : "", imageId), onSuccess: () => { onSaved(); setImageToDelete(null); toast.success("Product image removed."); }, onError: (error) => onError(errorMessage(error)) });
  if (!product) return null;
  const existing = product === "new" ? undefined : product;
  return <><Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>{existing ? "Edit product" : "New product"}</DialogTitle><DialogDescription>Product details and multiple images are saved through the catalog API.</DialogDescription></DialogHeader><form onSubmit={(event) => { event.preventDefault(); save.mutate(event); }} className="grid gap-4"><div className="grid gap-4 sm:grid-cols-2"><Field name="name" label="Name" defaultValue={existing?.name} required /><Field name="sku" label="SKU" defaultValue={existing?.sku} required /><Field name="slug" label="Slug" defaultValue={existing?.slug} /><label className="grid gap-2 text-sm">Category<select name="category_id" defaultValue={existing?.category_id} required className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><Field name="price" label="Price" type="number" step="0.01" defaultValue={existing?.price} required /><Field name="rating" label="Rating" defaultValue={existing?.rating ?? ""} /></div><label className="grid gap-2 text-sm">Description<Textarea name="description" defaultValue={existing?.description ?? ""} /></label><label className="grid gap-2 text-sm">Specifications (JSON)<Textarea name="specifications" defaultValue={existing?.specifications ? JSON.stringify(existing.specifications, null, 2) : ""} placeholder='{"voltage":"690V"}' /></label><div className="flex gap-6 text-sm"><label className="flex items-center gap-2"><input name="is_featured" type="checkbox" defaultChecked={existing?.is_featured ?? false} /> Featured</label><label className="flex items-center gap-2"><input name="is_active" type="checkbox" defaultChecked={existing?.is_active ?? true} /> Active</label></div><label className="grid gap-2 text-sm">Images<Input name="images" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple /></label>{existing?.images.length ? <div className="flex flex-wrap gap-3">{existing.images.map((image) => <div key={image.id} className="relative h-20 w-20 overflow-hidden rounded border border-border"><img src={assetUrl(image.url)} alt={image.alt_text ?? ""} className="h-full w-full object-cover" /><button type="button" disabled={removeImage.isPending} onClick={() => setImageToDelete(image.id)} className="absolute inset-x-0 bottom-0 bg-background/90 py-1 text-[10px] text-destructive">Remove</button></div>)}</div> : null}<button disabled={save.isPending} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-50">{save.isPending ? "Saving…" : <><Upload className="w-4 h-4" /> Save product</>}</button></form></DialogContent></Dialog><AlertDialog open={Boolean(imageToDelete)} onOpenChange={(open) => !open && setImageToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove this product image?</AlertDialogTitle><AlertDialogDescription>This action permanently deletes the image file.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={removeImage.isPending}>Cancel</AlertDialogCancel><AlertDialogAction disabled={removeImage.isPending} onClick={() => imageToDelete && removeImage.mutate(imageToDelete)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{removeImage.isPending ? "Removing…" : "Remove image"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>;
}

function CategoryEditor({ category, onClose, onError, onSaved }: { category: Category | "new" | null; onClose: () => void; onError: (message: string) => void; onSaved: () => void }) {
  const token = getAccessToken() ?? "";
  const save = useMutation({ mutationFn: async (event: FormEvent<HTMLFormElement>) => { const form = new FormData(event.currentTarget); const payload = { name: String(form.get("name")), slug: String(form.get("slug") || "") || undefined, description: String(form.get("description") || "") || null, sort_order: Number(form.get("sort_order") || 0), is_active: form.get("is_active") === "on" }; if (category === "new") await api.createCategory(token, payload); else await api.updateCategory(token, category!.id, payload); }, onSuccess: () => { onSaved(); toast.success(category === "new" ? "Category created." : "Category updated."); onClose(); }, onError: (error) => onError(errorMessage(error)) });
  if (!category) return null;
  const existing = category === "new" ? undefined : category;
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>{existing ? "Edit category" : "New category"}</DialogTitle><DialogDescription>Changes are reflected in the public catalog.</DialogDescription></DialogHeader><form onSubmit={(event) => { event.preventDefault(); save.mutate(event); }} className="grid gap-4"><Field name="name" label="Name" defaultValue={existing?.name} required /><Field name="slug" label="Slug" defaultValue={existing?.slug} /><Field name="sort_order" label="Sort order" type="number" defaultValue={existing?.sort_order ?? 0} /><label className="grid gap-2 text-sm">Description<Textarea name="description" defaultValue={existing?.description ?? ""} /></label><label className="flex items-center gap-2 text-sm"><input name="is_active" type="checkbox" defaultChecked={existing?.is_active ?? true} /> Active</label><button disabled={save.isPending} className="rounded-md bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-50">{save.isPending ? "Saving…" : "Save category"}</button></form></DialogContent></Dialog>;
}

function CompanySettings({ company, isLoading, isError, onError, onSaved }: { company: CompanyInfo | undefined; isLoading: boolean; isError: boolean; onError: (message: string) => void; onSaved: () => void }) {
  const token = getAccessToken() ?? "";
  const save = useMutation({ mutationFn: async (event: FormEvent<HTMLFormElement>) => { const form = new FormData(event.currentTarget); await api.updateCompany(token, { name: String(form.get("name")), address: String(form.get("address") || "") || null, phone: String(form.get("phone") || "") || null, email: String(form.get("email") || "") || null, about: String(form.get("about") || "") || null }); const logo = form.get("logo"); if (logo instanceof File && logo.size > 0) await api.uploadCompanyLogo(token, logo); }, onSuccess: () => { onSaved(); toast.success("Company settings saved."); }, onError: (error) => onError(errorMessage(error)) });
  return <section className="rounded-lg border border-border bg-surface p-4 sm:p-6 xl:col-span-2"><div className="mb-5"><h2 className="font-semibold">Company settings</h2><p className="text-xs text-muted-foreground">Public company details and logo.</p></div>{isLoading ? <p className="text-sm text-muted-foreground">Loading company information…</p> : isError || !company ? <p className="text-sm text-destructive">Company information could not be loaded.</p> : <form onSubmit={(event) => { event.preventDefault(); save.mutate(event); }} className="grid gap-4 md:grid-cols-2"><Field name="name" label="Company name" defaultValue={company.name} required /><Field name="email" label="Email" type="email" defaultValue={company.email ?? ""} /><Field name="phone" label="Phone" defaultValue={company.phone ?? ""} /><Field name="address" label="Address" defaultValue={company.address ?? ""} /><label className="grid gap-2 text-sm md:col-span-2">About<Textarea name="about" defaultValue={company.about ?? ""} /></label><label className="grid gap-2 text-sm">Logo<Input name="logo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label>{company.logo_url ? <img src={assetUrl(company.logo_url)} alt="Current company logo" className="h-10 w-auto self-end object-contain" /> : null}<button disabled={save.isPending} className="rounded-md bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-50 md:col-span-2">{save.isPending ? "Saving…" : "Save company settings"}</button></form>}</section>;
}

function Field({ label, ...props }: { label: string } & ComponentProps<typeof Input>) {
  return <label className="grid gap-2 text-sm">{label}<Input {...props} /></label>;
}
