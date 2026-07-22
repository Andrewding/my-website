"use client";

import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="container-page py-14">
      <div className="grid md:grid-cols-2 gap-12 max-w-4xl">
        <div>
          <p className="eyebrow mb-3">Get in touch</p>
          <h1 className="font-display text-3xl font-semibold mb-4">Contact Us</h1>
          <p className="text-muted mb-6">Questions about sizing, heat settings, warranty, or bulk orders? Send us a message.</p>
          <p className="text-sm mb-2"><strong>Email:</strong> support@thermalwear-example.com</p>
          <p className="text-sm text-muted">Mon–Fri, 9am–5pm (GMT)</p>
        </div>

        <form
          className="surface p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            e.currentTarget.reset();
          }}
        >
          {sent && (
            <div className="text-sm text-accent2 mb-4">
              Thanks — your message has been captured locally in this demo. Connect a form backend before going live.
            </div>
          )}
          <label className="block text-xs text-muted mb-1.5" htmlFor="name">Name</label>
          <input id="name" name="name" type="text" required className="field mb-4" placeholder="Your name" />
          <label className="block text-xs text-muted mb-1.5" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="field mb-4" placeholder="you@example.com" />
          <label className="block text-xs text-muted mb-1.5" htmlFor="message">Message</label>
          <textarea id="message" name="message" required rows={5} className="field mb-5" placeholder="How can we help?" />
          <button type="submit" className="btn-primary w-full">Send Message</button>
        </form>
      </div>
    </div>
  );
}
