"use client";

import { useState } from "react";

// Contact form submissions are sent via FormSubmit (https://formsubmit.co) —
// a free service that forwards form submissions straight to an inbox with
// no backend/database of our own needed. It's tied to vip@comeawm.com below.
//
// IMPORTANT (one-time step): the very first real submission after this goes
// live will trigger a confirmation email from FormSubmit to vip@comeawm.com.
// Someone needs to open that email and click the confirmation link once —
// after that, every future submission is delivered straight to the inbox
// with no further action needed.
const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/vip@comeawm.com";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="container-page py-14">
      <div className="grid md:grid-cols-2 gap-12 max-w-4xl">
        <div>
          <p className="eyebrow mb-3">Get in touch</p>
          <h1 className="font-display text-3xl font-semibold mb-4">Contact Us</h1>
          <p className="text-muted mb-6">Questions about sizing, heat settings, warranty, or bulk orders? Send us a message.</p>
          <p className="text-sm mb-2"><strong>Email:</strong> vip@comeawm.com</p>
          <p className="text-sm text-muted">Mon–Fri, 9am–5pm (GMT)</p>
        </div>

        <form className="surface p-6" onSubmit={handleSubmit}>
          {status === "sent" && (
            <div className="text-sm text-accent2 mb-4">
              Thanks — your message has been sent. We&apos;ll get back to you soon.
            </div>
          )}
          {status === "error" && (
            <div className="text-sm text-accent mb-4">
              Something went wrong sending your message. Please try again, or email us directly at vip@comeawm.com.
            </div>
          )}

          {/* Honeypot field: invisible to real visitors, bots that auto-fill every
              field trip this and FormSubmit silently discards the submission. */}
          <input type="text" name="_honey" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

          {/* Plain-text subject line shown in the notification email. */}
          <input type="hidden" name="_subject" value="New message from ThermalWear contact form" />
          {/* Ask FormSubmit to reply with JSON instead of redirecting to their page. */}
          <input type="hidden" name="_captcha" value="false" />

          <label className="block text-xs text-muted mb-1.5" htmlFor="name">Name</label>
          <input id="name" name="name" type="text" required className="field mb-4" placeholder="Your name" />
          <label className="block text-xs text-muted mb-1.5" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="field mb-4" placeholder="you@example.com" />
          <label className="block text-xs text-muted mb-1.5" htmlFor="message">Message</label>
          <textarea id="message" name="message" required rows={5} className="field mb-5" placeholder="How can we help?" />
          <button type="submit" disabled={status === "sending"} className="btn-primary w-full disabled:opacity-60">
            {status === "sending" ? "Sending…" : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
