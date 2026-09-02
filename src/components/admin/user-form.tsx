"use client";

import { useTransition, useState } from "react";
import { createUserAction, updateUserAction, type UserFormState } from "@/lib/user-actions";
import type { AdminRole } from "@/lib/rbac";

type User = {
  id?: string;
  name: string;
  email: string;
  role: AdminRole;
};

export function UserFormDialog({
  user,
  onClose,
}: {
  user?: User;
  onClose: () => void;
}) {
  const isEdit = !!user?.id;
  const [pending, start] = useTransition();
  const [state, setState] = useState<UserFormState | null>(null);

  function handleSubmit(fd: FormData) {
    start(async () => {
      const result = isEdit
        ? await updateUserAction(null, fd)
        : await createUserAction(null, fd);
      setState(result);
      if (result.success) {
        setTimeout(() => onClose(), 1200);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm">
      <div className="bg-sand rounded-2xl border border-sand-deep shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand-deep">
          <h2 className="font-display text-lg font-semibold text-navy">
            {isEdit ? "Modifier l&apos;utilisateur" : "Nouvel utilisateur"}
          </h2>
          <button
            onClick={onClose}
            className="text-graphite hover:text-navy transition-colors"
            aria-label="Fermer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {state?.success ? (
          <div className="p-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium text-navy">{state.message}</p>
          </div>
        ) : (
          <form
            action={handleSubmit}
            className="p-6 space-y-4"
          >
            {user?.id && <input type="hidden" name="id" value={user.id} />}

            {state?.errors?.general && (
              <div className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
                {state.errors.general[0]}
              </div>
            )}

            <Field
              label="Nom complet"
              name="name"
              defaultValue={user?.name}
              error={state?.errors?.name?.[0]}
              required
            />
            <Field
              label="Email"
              name="email"
              type="email"
              defaultValue={user?.email}
              error={state?.errors?.email?.[0]}
              required
            />
            <div>
              <label className="block mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-graphite">
                  Rôle
                </span>
                <select
                  name="role"
                  defaultValue={user?.role ?? "AGENT"}
                  className="mt-1 w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
                >
                  <option value="SUPER_ADMIN">Super-admin</option>
                  <option value="AGENT">Agent commercial</option>
                  <option value="COMPTABLE">Comptable</option>
                </select>
                {state?.errors?.role && (
                  <p className="mt-1 text-xs text-sunrise-coral">{state.errors.role[0]}</p>
                )}
              </label>
            </div>
            <Field
              label={isEdit ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
              name="password"
              type="password"
              defaultValue=""
              error={state?.errors?.password?.[0]}
              required={!isEdit}
              placeholder={isEdit ? "••••••••" : "8 caractères minimum"}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-graphite hover:text-navy transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-50"
              >
                {pending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer le compte"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
        {label}{required && " *"}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy placeholder:text-silver"
      />
      {error && <p className="mt-1 text-xs text-sunrise-coral">{error}</p>}
    </label>
  );
}

export function DeleteUserButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);

  function handleDelete() {
    start(async () => {
      const { deleteUserAction } = await import("@/lib/user-actions");
      const res = await deleteUserAction(id);
      if (res.error) {
        alert(res.error);
      }
    });
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-xs text-sunrise-coral hover:text-sunrise-orange transition-colors"
      >
        Supprimer
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDelete}
        disabled={pending}
        className="text-xs font-semibold text-sunrise-coral hover:text-sunrise-orange disabled:opacity-50"
      >
        {pending ? "…" : "Confirmer"}
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="text-xs text-graphite hover:text-navy"
      >
        Annuler
      </button>
    </div>
  );
}
