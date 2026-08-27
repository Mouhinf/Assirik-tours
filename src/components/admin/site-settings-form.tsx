"use client";

import { useTransition, useState } from "react";
import { saveSiteSettingsAction } from "@/lib/site-settings-actions";

type Settings = {
  whatsappNumber: string;
  landline: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  hoursWeekdays: string;
  hoursSaturday: string;
  hoursSunday: string;
  tagline: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
};

export function SiteSettingsForm({ initial }: { initial: Settings }) {
  const [pending, start] = useTransition();
  const [success, setSuccess] = useState(false);
  return (
    <form
      action={(fd) =>
        start(async () => {
          setSuccess(false);
          await saveSiteSettingsAction(fd);
          setSuccess(true);
        })
      }
      className="space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Numéro WhatsApp (international)" name="whatsappNumber" defaultValue={initial.whatsappNumber} placeholder="221775495314" />
        <Field label="Téléphone fixe" name="landline" defaultValue={initial.landline} placeholder="+221 33 821 01 81" />
      </div>
      <Field label="Email de contact" name="email" type="email" defaultValue={initial.email} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Adresse ligne 1" name="addressLine1" defaultValue={initial.addressLine1} />
        <Field label="Adresse ligne 2" name="addressLine2" defaultValue={initial.addressLine2} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Ville" name="city" defaultValue={initial.city} />
        <Field label="Pays" name="country" defaultValue={initial.country} />
      </div>
      <Field label="Tagline (sous le logo)" name="tagline" defaultValue={initial.tagline} />
      <div className="grid sm:grid-cols-3 gap-3">
        <Field label="Horaires semaine" name="hoursWeekdays" defaultValue={initial.hoursWeekdays} />
        <Field label="Samedi" name="hoursSaturday" defaultValue={initial.hoursSaturday} />
        <Field label="Dimanche" name="hoursSunday" defaultValue={initial.hoursSunday} />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <Field label="Facebook (URL)" name="socialFacebook" defaultValue={initial.socialFacebook ?? ""} />
        <Field label="Instagram (URL)" name="socialInstagram" defaultValue={initial.socialInstagram ?? ""} />
        <Field label="LinkedIn (URL)" name="socialLinkedin" defaultValue={initial.socialLinkedin ?? ""} />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {success ? <span className="text-sm text-emerald-700">✓ Mis à jour.</span> : null}
      </div>
    </form>
  );
}

function Field({ label, name, type = "text", defaultValue, placeholder }: { label: string; name: string; type?: string; defaultValue?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy placeholder:text-silver"
      />
    </label>
  );
}
