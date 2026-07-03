import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Silks & Stayers team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold text-racing-950">Get in Touch</h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        Questions about a tip, a course we cover, or want to apply as a
        tipster? Send us a message and we&apos;ll get back to you.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
