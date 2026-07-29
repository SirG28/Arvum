import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listFavoritesByUser } from "@/features/favorites/services/favorite.service";
import { FavoriteMachineCard } from "@/features/favorites/components/FavoriteMachineCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Meus favoritos" };

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/favoritos");

  const favorites = await listFavoritesByUser(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Meus favoritos</h1>
        <p className="text-sm text-neutral-500">Máquinas que você salvou para consultar depois.</p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          title="Você ainda não tem máquinas favoritas"
          description="Explore o catálogo e toque no coração de uma máquina para salvá-la aqui."
          action={
            <Link href="/catalogo">
              <Button>Ver catálogo</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <FavoriteMachineCard key={favorite.id} machine={favorite.machine} />
          ))}
        </div>
      )}
    </div>
  );
}
