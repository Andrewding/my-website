import { getPage } from "@/lib/pages";
import PageContent from "@/components/PageContent";

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const page = await getPage("shipping");

  return (
    <section className="container-page py-14 max-w-3xl">
      <p className="eyebrow mb-3">Delivery information</p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mb-8">{page.title}</h1>
      <PageContent content={page.content} />
      <p className="text-xs text-muted mt-10">Last updated: {new Date(page.updated_at).toLocaleDateString()}.</p>
    </section>
  );
}
