"use client";

import { useEffect, useState } from "react";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Persistent floating WhatsApp CTA — visible site-wide after the user
 * scrolls past the hero. Matches the brief's "bouton WhatsApp flottant
 * persistant sur tout le site" requirement.
 */
export function WhatsAppFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={whatsappLink(
        "Bonjour Assirik Tours, j'aimerais des informations sur un voyage.",
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter Assirik Tours sur WhatsApp"
      className={`fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-sand shadow-lift transition-all duration-300 hover:scale-105 hover:bg-whatsapp-hover focus-visible:outline-whatsapp ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <svg
        viewBox="0 0 32 32"
        width="26"
        height="26"
        fill="currentColor"
        aria-hidden
      >
        <path d="M16 3C9.4 3 4 8.4 4 15c0 2.5.8 4.9 2.2 6.9L4 29l7.3-2.1c1.9 1 4 1.6 6.2 1.6h.5c6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.9c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.3 1.2 1.2-4.2-.3-.4c-1.2-1.7-1.8-3.7-1.8-5.8 0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10zm5.7-7.5c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5 4.5.7.3 1.2.5 1.7.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4z" />
      </svg>
    </a>
  );
}
