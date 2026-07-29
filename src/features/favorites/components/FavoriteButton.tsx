"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAddFavorite, useRemoveFavorite } from "../hooks/useFavorites";
import { cn } from "@/lib/cn";

interface FavoriteButtonProps {
  machineId: string;
  initialFavorited: boolean;
  isAuthenticated: boolean;
  className?: string;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      strokeWidth={1.8}
      stroke="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 20.5s-7.5-4.6-10-9.2C0.3 8 1.6 4.5 5 3.6c2.2-0.6 4.3 0.4 5.7 2.3l1.3 1.7 1.3-1.7c1.4-1.9 3.5-2.9 5.7-2.3 3.4 0.9 4.7 4.4 3 7.7-2.5 4.6-10 9.2-10 9.2Z" />
    </svg>
  );
}

const baseButtonClasses =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none";

export function FavoriteButton({
  machineId,
  initialFavorited,
  isAuthenticated,
  className,
}: FavoriteButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [favorited, setFavorited] = useState(initialFavorited);
  const addMutation = useAddFavorite();
  const removeMutation = useRemoveFavorite();
  const isPending = addMutation.isPending || removeMutation.isPending;

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(pathname ?? "/catalogo")}`}
        aria-label="Entrar para favoritar esta máquina"
        title="Entrar para favoritar"
        onClick={(event) => event.stopPropagation()}
        className={cn(baseButtonClasses, "border-neutral-200 text-neutral-400 hover:text-neutral-600", className)}
      >
        <HeartIcon filled={false} />
      </Link>
    );
  }

  async function handleToggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    try {
      if (favorited) {
        await removeMutation.mutateAsync(machineId);
        setFavorited(false);
      } else {
        await addMutation.mutateAsync(machineId);
        setFavorited(true);
      }
      router.refresh();
    } catch {
      // Erro silencioso no ícone (sem espaço para Alert em um card de listagem) — o estado local
      // não muda, então o coração permanece refletindo o último estado confirmado pelo servidor.
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      title={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(
        baseButtonClasses,
        "disabled:cursor-not-allowed disabled:opacity-60",
        favorited
          ? "border-danger-500/30 text-danger-500"
          : "border-neutral-200 text-neutral-400 hover:text-neutral-600",
        className,
      )}
    >
      <HeartIcon filled={favorited} />
    </button>
  );
}
