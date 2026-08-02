import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/site/Layout";
import { assetUrl } from "@/lib/api";
import { useProduct } from "@/lib/products";

export const Route = createFileRoute("/products/$slug")({
  component: ProductDetails,
});

function ProductDetails() {
  const { slug } = Route.useParams();
  const { data: product, isLoading, isError } = useProduct(slug);
  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) {
    return <Layout><div className="mx-auto max-w-7xl px-4 sm:px-6 py-24 text-muted-foreground">Loading product…</div></Layout>;
  }

  if (isError || !product) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
          <p className="text-destructive">This product could not be loaded.</p>
          <Link to="/products" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">Back to products →</Link>
        </div>
      </Layout>
    );
  }

  const images = product.images.map((image) => ({ ...image, src: assetUrl(image.url) }));
  const mainImage = images[selectedImage]?.src || assetUrl(product.image);

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-20">
        <Link to="/products" className="text-xs font-mono uppercase tracking-widest text-primary hover:underline">← Catalog</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="aspect-square overflow-hidden rounded-lg border border-border bg-surface">
              {mainImage ? <img src={mainImage} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image available</div>}
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto">
                {images.map((image, index) => (
                  <button key={image.id} onClick={() => setSelectedImage(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-md border ${index === selectedImage ? "border-primary" : "border-border"}`}>
                    <img src={image.src} alt={image.alt_text || product.name} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-primary">{product.category_name} · {product.sku}</div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">{product.name}</h1>
            {product.rating && <p className="mt-3 text-lg text-muted-foreground">{product.rating}</p>}
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">{product.description || "Product details are available on request."}</p>
            <div className="mt-8 border-y border-border py-6">
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">From</div>
              <div className="mt-1 text-3xl font-display font-bold">${Number(product.price).toLocaleString()}</div>
            </div>
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-8">
                <h2 className="font-semibold">Specifications</h2>
                <dl className="mt-4 divide-y divide-border border-y border-border">
                  {Object.entries(product.specifications).map(([name, value]) => <div key={name} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-muted-foreground">{name.replaceAll("_", " ")}</dt><dd className="text-right font-medium">{String(value)}</dd></div>)}
                </dl>
              </div>
            )}
            <Link to="/contact" className="mt-8 inline-flex rounded-md bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Request a Quote</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
