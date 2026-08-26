/**
 * Build a wa.me deep link with a pre-filled message.
 * Recommended approach for Phase 1 — zero infrastructure, no risk of
 * Meta banning the agency number.
 */
export function whatsappLink(message?: string) {
  const base = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "221775495314"}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}