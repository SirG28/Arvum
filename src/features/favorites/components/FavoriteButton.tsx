"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAddFavorite, useRemoveFavorite } from "../hooks/useFavorites";
import { HeartIcon } from "@/components/ui/HeartIcon";
import { cn } from "@/lib/cn";

interface FavoriteButtonProps {
  machineId: string;
  initialFavorited: boolean;
  isAuthenticated: boolean;
  className?: string;
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
  // Só true durante o keyframe do "pop" — removido no onAnimationEnd, senão a classe ficaria
  // presente indefinidamente sem reproduzir a animação de novo (CSS animation não reinicia
  // sozinha quando a classe já estava aplicada).
  const [justFavorited, setJustFavorited] = useState(false);
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
        setJustFavorited(true);
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
      onAnimationEnd={() => setJustFavorited(false)}
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
        justFavorited && "animate-heart-pop",
        className,
      )}
    >
      <HeartIcon filled={favorited} />
    </button>
  );
}
