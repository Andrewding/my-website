import { getPage } from "@/lib/pages";
import PageContent from "@/components/PageContent";
import ContactForm from "@/components/ContactForm";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const page = await getPage("contact");

  return (
    <div className="container-page py-14">
      <div className="grid md:grid-cols-2 gap-12 max-w-4xl">
        <div>
          <p className="eyebrow mb-3">Get in touch</p>
          <h1 className="font-display text-3xl font-semibold mb-4">{page.title}</h1>
          <PageContent content={page.content} />
          <p className="text-sm mb-2"><strong>Email:</strong> vip@comeawm.com</p>
          <p className="text-sm text-muted">Mon–Fri, 9am–5pm (GMT)</p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
