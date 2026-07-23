"use client";

import { useState } from "react";

const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/vip@comeawm.com";

export default function ContactForm() {
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

      <input type="text" name="_honey" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
      <input type="hidden" name="_subject" value="New message from ThermalWear contact form" />
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
  );
}
