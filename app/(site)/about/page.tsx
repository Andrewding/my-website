import Link from "next/link";
import { getPage } from "@/lib/pages";
import PageContent from "@/components/PageContent";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const page = await getPage("about");

  return (
    <section className="container-page py-14 max-w-3xl">
      <p className="eyebrow mb-3">Our story</p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mb-6">{page.title}</h1>
      <PageContent content={page.content} />
      <Link href="/products" className="btn-primary inline-flex mt-6">Explore Our Products</Link>
    </section>
  );
}
