import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="container-page py-14 max-w-3xl">
      <p className="eyebrow mb-3">Our story</p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mb-6">About ThermalWear</h1>
      <p className="text-muted leading-relaxed mb-5">
        [Brand introduction placeholder — replace with your real brand story: why the company started, the problem it solves, and what makes the product line different.]
      </p>
      <p className="text-muted leading-relaxed mb-10">
        ThermalWear designs heated massage wearables — belts, socks, and gloves — built around adjustable heat and on-demand vibration massage.
      </p>
      <Link href="/products" className="btn-primary">Explore Our Products</Link>
    </section>
  );
}
