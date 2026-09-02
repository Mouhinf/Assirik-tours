"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import {
  toggleServiceActiveAction,
  deleteServiceAction,
} from "@/lib/service-actions";

export function ServiceRowActions({
  id,
  isActive,
  canWrite,
  canDelete,
}: {
  id: string;
  isActive: boolean;
  canWrite: boolean;
  canDelete: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  function onToggle() {
    startTransition(async () => {
      await toggleServiceActiveAction(
        (() => {
          const fd = new FormData();
          fd.set("id", id);
          return fd;
        })(),
      );
    });
  }

  function onDelete() {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    startTransition(async () => {
      await deleteServiceAction(
        (() => {
          const fd = new FormData();
          fd.set("id", id);
          return fd;
        })(),
      );
    });
  }

  return (
    <div className="inline-flex items-center justify-end gap-2 text-xs">
      <Link
        href={`/admin/services/${id}`}
        className="font-semibold text-ocean hover:text-navy"
      >
        Éditer
      </Link>
      {canWrite ? (
        <button
          type="button"
          onClick={onToggle}
          disabled={pending}
          className="font-semibold text-graphite hover:text-navy disabled:opacity-60"
        >
          {isActive ? "Masquer" : "Publier"}
        </button>
      ) : null}
      {canDelete ? (
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className={`font-semibold ${
            confirm
              ? "text-sunrise-coral"
              : "text-graphite hover:text-sunrise-coral"
          } disabled:opacity-60`}
        >
          {confirm ? "Confirmer ?" : "Suppr."}
        </button>
      ) : null}
    </div>
  );
}
