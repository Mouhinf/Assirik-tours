/**
 * Helpers for the promo logic on offers.
 *
 * A promo is "active" when:
 * - `promoPriceFCFA` is set AND < `priceFCFA`
 * - `promoEndsAt` is null OR > now()
 *
 * The current price (used for display + sort) is the promo price when active,
 * otherwise the regular `priceFCFA`.
 */

export type PromoInfo = {
  isActive: boolean;
  currentPriceFCFA: number;
  originalPriceFCFA: number;
  savingsFCFA: number;
  endsAt: Date | null;
};

export function computePromo(input: {
  priceFCFA: number;
  promoPriceFCFA: number | null | undefined;
  promoEndsAt: Date | null | undefined;
  now?: Date;
}): PromoInfo {
  const now = input.now ?? new Date();
  const endsAt = input.promoEndsAt ?? null;
  const notExpired = endsAt === null || endsAt.getTime() > now.getTime();
  const hasPromoPrice =
    input.promoPriceFCFA !== null &&
    input.promoPriceFCFA !== undefined &&
    input.promoPriceFCFA > 0 &&
    input.promoPriceFCFA < input.priceFCFA;

  const isActive = hasPromoPrice && notExpired;
  const currentPriceFCFA = isActive ? (input.promoPriceFCFA as number) : input.priceFCFA;
  const savingsFCFA = isActive ? input.priceFCFA - (input.promoPriceFCFA as number) : 0;

  return {
    isActive,
    currentPriceFCFA,
    originalPriceFCFA: input.priceFCFA,
    savingsFCFA,
    endsAt,
  };
}

export function formatPromoCountdown(endsAt: Date): string {
  const now = new Date();
  const ms = endsAt.getTime() - now.getTime();
  if (ms <= 0) return "terminée";
  const days = Math.floor(ms / 86_400_000);
  if (days > 0) return `${days} jour${days > 1 ? "s" : ""}`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours > 0) return `${hours} h`;
  const minutes = Math.floor(ms / 60_000);
  return `${minutes} min`;
}
