import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  cached = new Stripe(key, { apiVersion: "2026-08-26.dahlia" });
  return cached;
}

export function stripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
