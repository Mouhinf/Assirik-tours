/**
 * Transactional message templates — single source of truth.
 *
 * Each template defines:
 *   - id: stable identifier (referenced by hooks + admin UI)
 *   - channels: which channels this template supports
 *   - subject (email only): subject line per locale
 *   - body: plaintext with `{{var}}` placeholders (rendered at send time)
 *
 * For emails we ALSO render a small HTML wrapper via `htmlWrap()`.
 * Rich React Email components can be added later for higher-fidelity
 * designs without touching the call sites.
 */
import { escapeHtml, renderTemplate } from "./types";
import type { Locale } from "./types";

export type TemplateDef = {
  id: string;
  description: string;
  channels: Array<"email" | "sms" | "whatsapp">;
  variables: string[];
  subject?: Record<Locale, string>;
  body: Record<Locale, string>;
};

const T = (
  id: string,
  description: string,
  channels: Array<"email" | "sms" | "whatsapp">,
  variables: string[],
  subjectFr: string,
  subjectEn: string,
  bodyFr: string,
  bodyEn: string,
): TemplateDef => ({
  id,
  description,
  channels,
  variables,
  subject: { fr: subjectFr, en: subjectEn },
  body: { fr: bodyFr, en: bodyEn },
});

/* ── Client-side templates ─────────────────────────────────────── */

export const TEMPLATE_RESERVATION_CONFIRMED = T(
  "reservation.confirmed",
  "Confirmation de réservation (envoi au client)",
  ["email", "whatsapp"],
  ["clientName", "reference", "offerTitle", "amount", "currency"],
  "Votre réservation {{reference}} est confirmée ✈️",
  "Your booking {{reference}} is confirmed ✈️",
  [
    "Bonjour {{clientName}},",
    "",
    "Votre réservation {{reference}} chez Assirik Tours est confirmée.",
    "Détail : {{offerTitle}} — {{amount}} {{currency}}.",
    "",
    "Votre voucher PDF est en pièce jointe (ou disponible dans votre espace client).",
    "Pour toute question : whatsapp +221 77 549 53 14.",
    "",
    "Bonne préparation de voyage !",
    "— L'équipe Assirik Tours",
  ].join("\n"),
  [
    "Hi {{clientName}},",
    "",
    "Your booking {{reference}} with Assirik Tours is confirmed.",
    "Details: {{offerTitle}} — {{amount}} {{currency}}.",
    "",
    "Your voucher PDF is attached (or available in your client dashboard).",
    "Questions: whatsapp +221 77 549 53 14.",
    "",
    "Have a great trip!",
    "— Assirik Tours team",
  ].join("\n"),
);

export const TEMPLATE_PAYMENT_RECEIVED = T(
  "payment.received",
  "Reçu de paiement (envoi au client)",
  ["email"],
  ["clientName", "reference", "amount", "currency", "method"],
  "Paiement reçu — {{amount}} {{currency}}",
  "Payment received — {{amount}} {{currency}}",
  [
    "Bonjour {{clientName}},",
    "",
    "Nous avons bien reçu votre paiement de {{amount}} {{currency}} pour la réservation {{reference}}.",
    "Méthode : {{method}}.",
    "",
    "Un reçu officiel est disponible sur demande.",
    "",
    "Cordialement,",
    "Assirik Tours",
  ].join("\n"),
  [
    "Hi {{clientName}},",
    "",
    "We have received your payment of {{amount}} {{currency}} for booking {{reference}}.",
    "Method: {{method}}.",
    "",
    "An official receipt is available on request.",
    "",
    "Best regards,",
    "Assirik Tours",
  ].join("\n"),
);

export const TEMPLATE_VISA_DOCS_REQUIRED = T(
  "visa.documents_required",
  "Liste des pièces visa à fournir (envoi au client)",
  ["email", "whatsapp"],
  ["clientName", "destination", "documents", "deadline", "reference"],
  "Pièces à fournir — dossier visa {{destination}}",
  "Documents required — {{destination}} visa file",
  [
    "Bonjour {{clientName}},",
    "",
    "Votre dossier visa {{reference}} pour {{destination}} a été créé.",
    "Merci de nous fournir les pièces suivantes avant le {{deadline}} :",
    "",
    "{{documents}}",
    "",
    "Téléversement sécurisé depuis votre espace client : {{link}}",
    "",
    "Assirik Tours",
  ].join("\n"),
  [
    "Hi {{clientName}},",
    "",
    "Your visa file {{reference}} for {{destination}} has been opened.",
    "Please send the following documents by {{deadline}}:",
    "",
    "{{documents}}",
    "",
    "Secure upload from your client dashboard: {{link}}",
    "",
    "Assirik Tours",
  ].join("\n"),
);

export const TEMPLATE_VISA_DOCS_RECEIVED = T(
  "visa.documents_received",
  "Confirmation upload document visa",
  ["email"],
  ["clientName", "reference", "documentName"],
  "Document reçu — dossier {{reference}}",
  "Document received — file {{reference}}",
  [
    "Bonjour {{clientName}},",
    "",
    "Nous confirmons la bonne réception du document « {{documentName}} » pour votre dossier visa {{reference}}.",
    "",
    "Assirik Tours",
  ].join("\n"),
  [
    "Hi {{clientName}},",
    "",
    "We confirm receipt of « {{documentName}} » for your visa file {{reference}}.",
    "",
    "Assirik Tours",
  ].join("\n"),
);

export const TEMPLATE_VISA_STATUS_CHANGED = T(
  "visa.status_changed",
  "Statut visa mis à jour",
  ["email", "whatsapp"],
  ["clientName", "reference", "status", "notes"],
  "Mise à jour dossier visa {{reference}} — {{status}}",
  "Visa file update {{reference}} — {{status}}",
  [
    "Bonjour {{clientName}},",
    "",
    "Votre dossier visa {{reference}} est passé au statut : {{status}}.",
    "{{notes}}",
    "",
    "Assirik Tours",
  ].join("\n"),
  [
    "Hi {{clientName}},",
    "",
    "Your visa file {{reference}} moved to status: {{status}}.",
    "{{notes}}",
    "",
    "Assirik Tours",
  ].join("\n"),
);

export const TEMPLATE_FLIGHT_QUOTE_REQUESTED = T(
  "flight.quote_requested",
  "Demande de devis vol (notification à l'agence)",
  ["email"],
  ["clientName", "clientEmail", "clientPhone", "origin", "destination", "departDate", "returnDate", "passengers", "offerPrice", "offerCurrency", "reservationReference"],
  "[Billetterie] Demande devis {{origin}} → {{destination}}",
  "[Flights] Quote request {{origin}} → {{destination}}",
  [
    "Demande de devis reçue via /billetterie :",
    "",
    "Référence : {{reservationReference}}",
    "Client : {{clientName}} ({{clientEmail}} · {{clientPhone}})",
    "Trajet : {{origin}} → {{destination}}",
    "Départ : {{departDate}}{{#returnDate}} — Retour : {{returnDate}}{{/returnDate}}",
    "Passagers : {{passengers}}",
    "Offre sélectionnée : {{offerPrice}} {{offerCurrency}}",
    "",
    "À traiter sous 24h ouvrées.",
    "",
    "— Assirik Tours bot",
  ].join("\n"),
  [
    "Quote request received via /flights:",
    "",
    "Reference: {{reservationReference}}",
    "Client: {{clientName}} ({{clientEmail}} · {{clientPhone}})",
    "Route: {{origin}} → {{destination}}",
    "Depart: {{departDate}}{{#returnDate}} — Return: {{returnDate}}{{/returnDate}}",
    "Passengers: {{passengers}}",
    "Selected offer: {{offerPrice}} {{offerCurrency}}",
    "",
    "To be processed within 24 business hours.",
    "",
    "— Assirik Tours bot",
  ].join("\n"),
);

export const TEMPLATE_CONTACT_FORM_SUBMITTED = T(
  "contact.form_submitted",
  "Formulaire de contact public (notification à l'agence)",
  ["email"],
  ["firstName", "lastName", "email", "phone", "subject", "message"],
  "[Contact] {{firstName}} {{lastName}}",
  "[Contact] {{firstName}} {{lastName}}",
  [
    "Nouveau message via le formulaire de contact :",
    "",
    "De : {{firstName}} {{lastName}} (email : {{email}}, tél : {{phone}})",
    "",
    "« {{message}} »",
    "",
    "— Assirik Tours bot",
  ].join("\n"),
  [
    "New message via the public contact form:",
    "",
    "From: {{firstName}} {{lastName}} (email: {{email}}, phone: {{phone}})",
    "",
    "« {{message}} »",
    "",
    "— Assirik Tours bot",
  ].join("\n"),
);

export const TEMPLATE_NEW_REQUEST = T(
  "reservation.new_request",
  "Nouvelle demande unifiée (notification à l'équipe)",
  ["email"],
  [
    "reference",
    "source",
    "clientName",
    "clientEmail",
    "clientPhone",
    "requestSubject",
    "details",
    "adminUrl",
  ],
  "[{{source}}] Nouvelle demande {{reference}} — {{requestSubject}}",
  "[{{source}}] New request {{reference}} — {{requestSubject}}",
  [
    "Une nouvelle demande vient d'être enregistrée dans le module Réservations / Devis.",
    "",
    "Référence : {{reference}}",
    "Source : {{source}}",
    "Objet : {{requestSubject}}",
    "Client : {{clientName}}",
    "Email : {{clientEmail}}",
    "Téléphone : {{clientPhone}}",
    "",
    "Détails :",
    "{{details}}",
    "",
    "Ouvrir la file unifiée : {{adminUrl}}",
    "",
    "— Assirik Tours bot",
  ].join("\n"),
  [
    "A new request was added to the unified Reservations / Quotes queue.",
    "",
    "Reference: {{reference}}",
    "Source: {{source}}",
    "Subject: {{requestSubject}}",
    "Client: {{clientName}}",
    "Email: {{clientEmail}}",
    "Phone: {{clientPhone}}",
    "",
    "Details:",
    "{{details}}",
    "",
    "Open the unified queue: {{adminUrl}}",
    "",
    "— Assirik Tours bot",
  ].join("\n"),
);

export const TEMPLATE_RESERVATION_ASSIGNED = T(
  "reservation.assigned",
  "Réservation prise en charge par un agent",
  ["email"],
  ["reference", "actorName", "actorEmail", "previousAssignee"],
  "[Réservations] {{reference}} prise en charge par {{actorName}}",
  "[Reservations] {{reference}} picked up by {{actorName}}",
  [
    "La réservation {{reference}} vient d'être passée en « En cours ».",
    "",
    "Précédemment assignée à : {{previousAssignee}}",
    "Maintenant traitée par : {{actorName}} ({{actorEmail}})",
    "",
    "Aucun email n'est envoyé au client — cette notification sert uniquement à",
    "coordonner l'équipe interne.",
  ].join("\n"),
  [
    "Reservation {{reference}} just moved to \"In progress\".",
    "",
    "Previously assigned to: {{previousAssignee}}",
    "Now handled by: {{actorName}} ({{actorEmail}})",
    "",
    "No email is sent to the customer — this is an internal coordination ping.",
  ].join("\n"),
);

export const TEMPLATE_NEWSLETTER_WELCOME = T(
  "newsletter.welcome",
  "Bienvenue newsletter",
  ["email"],
  ["clientName"],
  "Bienvenue chez Assirik Tours 🌴",
  "Welcome to Assirik Tours 🌴",
  [
    "Bonjour {{clientName}},",
    "",
    "Merci pour votre inscription à notre newsletter.",
    "Vous recevrez nos meilleures offres de voyage depuis Dakar : Sénégal, Omra, Europe, et au-delà.",
    "",
    "À très vite,",
    "Assirik Tours",
    "",
    "— Se désinscrire : {{unsubscribeUrl}}",
  ].join("\n"),
  [
    "Hi {{clientName}},",
    "",
    "Thanks for subscribing to our newsletter.",
    "You'll receive our best travel deals from Dakar: Senegal, Omra, Europe, and beyond.",
    "",
    "Talk soon,",
    "Assirik Tours",
    "",
    "— Unsubscribe: {{unsubscribeUrl}}",
  ].join("\n"),
);

export const TEMPLATE_PASSWORD_RESET = T(
  "account.password_reset",
  "Réinitialisation mot de passe espace client",
  ["email"],
  ["clientName", "resetUrl", "expiresIn"],
  "Réinitialisation de votre mot de passe",
  "Reset your password",
  [
    "Bonjour {{clientName}},",
    "",
    "Vous avez demandé la réinitialisation de votre mot de passe.",
    "Cliquez sur ce lien (valable {{expiresIn}}) : {{resetUrl}}",
    "",
    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
    "",
    "Assirik Tours",
  ].join("\n"),
  [
    "Hi {{clientName}},",
    "",
    "You requested a password reset.",
    "Click this link (valid for {{expiresIn}}): {{resetUrl}}",
    "",
    "If you didn't request this, ignore this email.",
    "",
    "Assirik Tours",
  ].join("\n"),
);

/* ── Index ─────────────────────────────────────────────────────── */

export const TEMPLATES: TemplateDef[] = [
  TEMPLATE_RESERVATION_CONFIRMED,
  TEMPLATE_PAYMENT_RECEIVED,
  TEMPLATE_VISA_DOCS_REQUIRED,
  TEMPLATE_VISA_DOCS_RECEIVED,
  TEMPLATE_VISA_STATUS_CHANGED,
  TEMPLATE_FLIGHT_QUOTE_REQUESTED,
  TEMPLATE_CONTACT_FORM_SUBMITTED,
  TEMPLATE_NEW_REQUEST,
  TEMPLATE_RESERVATION_ASSIGNED,
  TEMPLATE_NEWSLETTER_WELCOME,
  TEMPLATE_PASSWORD_RESET,
];

export function getTemplate(id: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/* ── Renderers ─────────────────────────────────────────────────── */

export function renderTemplateBody(
  template: TemplateDef,
  locale: Locale,
  vars: Record<string, string | number | undefined | null>,
): string {
  let text = template.body[locale] ?? template.body.fr;
  // Handle the {{#key}}...{{/key}} conditional blocks for empty values.
  text = text.replace(
    /\{\{#([\w]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_match, key: string, block: string) =>
      vars[key] == null || vars[key] === "" ? "" : block,
  );
  return renderTemplate(text, vars);
}

export function renderTemplateSubject(
  template: TemplateDef,
  locale: Locale,
  vars: Record<string, string | number | undefined | null>,
): string | undefined {
  if (!template.subject) return undefined;
  const subj = template.subject[locale] ?? template.subject.fr;
  return renderTemplate(subj, vars);
}

/**
 * Minimal HTML wrapper — clean enough for deliverability, readable in
 * Gmail/Outlook. Can be replaced by React Email components later.
 */
export function renderHtmlEmail(opts: {
  subject: string;
  preheader?: string;
  body: string; // already rendered plaintext
  footerHtml?: string;
}): string {
  const lines = opts.body
    .split("\n")
    .map((l) => (l.trim() === "" ? "<br/>" : `<p style="margin:0 0 12px;color:#1f2937;font-size:15px;line-height:1.5;">${escapeHtml(l)}</p>`))
    .join("");
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>${escapeHtml(opts.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#fdf6ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr><td align="center" style="padding:32px 16px;">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;border:1px solid #efe6d5;overflow:hidden;">
          <tr><td style="padding:24px 24px 0;">
            <h1 style="margin:0;color:#1f3a5f;font-size:20px;font-weight:600;">Assirik Tours</h1>
          </td></tr>
          <tr><td style="padding:16px 24px 8px;">
            <h2 style="margin:0 0 8px;color:#1f3a5f;font-size:18px;font-weight:600;">${escapeHtml(opts.subject)}</h2>
            ${opts.preheader ? `<p style="margin:0;color:#6b7280;font-size:13px;">${escapeHtml(opts.preheader)}</p>` : ""}
          </td></tr>
          <tr><td style="padding:16px 24px;">${lines}</td></tr>
          <tr><td style="padding:16px 24px 24px;border-top:1px solid #efe6d5;">
            ${opts.footerHtml ?? `<p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.4;">Assirik Tours — Rue 22 prolongée, Fass Delorme, Dakar<br/>contact : assiriktours@gmail.com · +221 77 549 53 14</p>`}
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
