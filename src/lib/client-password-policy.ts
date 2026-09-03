// Pure helpers shared by the client auth server action and the set-password
// form. NOT a server action file — `"use server"` files may only export
// async functions.

export const PASSWORD_MIN_LENGTH = 10;

export type SetPasswordState = { ok: boolean; error?: string };

/**
 * Validates a password against the agency's complexity policy:
 *  - minimum 10 characters
 *  - at least one digit and one letter
 */
export function passwordIsStrongEnough(password: string): string | null {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`;
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  }
  return null;
}

export { PHONE_RE } from "@/lib/validators/public-forms";
