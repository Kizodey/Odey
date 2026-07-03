"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Website enquiry from ${name || "a visitor"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:hello@silksandstayers.example?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-racing-900/10 bg-white p-6">
      <div>
        <label className="block text-sm font-medium text-ink/80" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-racing-900/15 px-3 py-2 text-sm focus:border-racing-700 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink/80" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-racing-900/15 px-3 py-2 text-sm focus:border-racing-700 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink/80" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded-lg border border-racing-900/15 px-3 py-2 text-sm focus:border-racing-700 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="rounded-full bg-racing-900 px-6 py-3 text-sm font-semibold text-cream hover:bg-racing-800"
      >
        Send Message
      </button>
    </form>
  );
}
