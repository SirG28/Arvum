import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getPublicMachineBySlug } from "@/features/machines/services/machine.service";
import { isPremiumActive } from "@/features/subscriptions/lib/subscription-status";
import { listFavoriteMachineIds } from "@/features/favorites/services/favorite.service";
import { listPropertiesByOwner } from "@/features/properties/services/property.service";
import { getMachineReviews } from "@/features/reviews/services/review.service";
import { MachineGallery } from "@/features/machines/components/MachineGallery";
import { FavoriteButton } from "@/features/favorites/components/FavoriteButton";
import { BookingRequestForm } from "@/features/bookings/components/BookingRequestForm";
import { ReviewsSection } from "@/features/reviews/components/ReviewsSection";
import { Rating } from "@/components/ui/Rating";
import { Badge } from "@/components/ui/Badge";
import { VerifiedPartnerBadge } from "@/components/shared/VerifiedPartnerBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { BackLink } from "@/components/ui/BackLink";
import { WhatsAppSupportLink } from "@/components/shared/WhatsAppSupportLink";

const CONDITION_LABELS: Record<string, string> = {
  NEW: "Nova",
  EXCELLENT: "Excelente",
  GOOD: "Boa",
  FAIR: "Regular",
  NEEDS_MAINTENANCE: "Precisa de manutenção",
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface MachineDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ origemCidade?: string; origemUf?: string }>;
}

export async function generateMetadata({ params }: MachineDetailPageProps) {
  const { slug } = await params;
  const machine = await getPublicMachineBySlug(slug);
  return { title: machine ? machine.title : "Máquina não encontrada" };
}

export default async function MachineDetailPage({ params, searchParams }: MachineDetailPageProps) {
  const { slug } = await params;
  const { origemCidade, origemUf } = await searchParams;
  const origin = origemCidade && origemUf ? { city: origemCidade, state: origemUf } : undefined;
  const machine = await getPublicMachineBySlug(slug, origin);
  if (!machine) notFound();

  const user = await getCurrentUser();
  const isFavorited = user ? (await listFavoriteMachineIds(user.id)).has(machine.id) : false;
  const isOwner = user?.id === machine.owner.id;
  const renterProperties = user && !isOwner ? await listPropertiesByOwner(user.id) : [];
  const { reviews, averageRating, count: reviewCount } = await getMachineReviews(
    machine.id,
    machine.owner.id,
  );

  const backHref =
    origemCidade && origemUf
      ? `/catalogo?origemCidade=${encodeURIComponent(origemCidade)}&origemUf=${encodeURIComponent(origemUf)}`
      : "/catalogo";

  return (
    <div className="flex flex-col gap-6">
      <BackLink href={backHref} label="Catálogo" />

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <MachineGallery images={machine.images} title={machine.title} />

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-neutral-900">{machine.title}</h1>
              {machine.requiresOperator && <Badge tone="info">Requer operador</Badge>}
              <FavoriteButton
                machineId={machine.id}
                initialFavorited={isFavorited}
                isAuthenticated={Boolean(user)}
                className="ml-auto"
              />
            </div>
            <p className="text-sm text-neutral-500">
              {machine.category.name}
              {machine.brand ? ` — ${machine.brand}` : ""}
              {machine.model ? ` ${machine.model}` : ""}
            </p>
            {averageRating !== null && (
              <a
                href="#avaliacoes"
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-neutral-700"
              >
                <Rating value={averageRating} size="sm" />
                <span className="underline">
                  {averageRating.toLocaleString("pt-BR")} ({reviewCount}{" "}
                  {reviewCount === 1 ? "avaliação" : "avaliações"})
                </span>
              </a>
            )}
            <p className="mt-4 text-sm text-neutral-700">{machine.description}</p>

            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-neutral-400">Condição</dt>
                <dd className="text-neutral-900">{CONDITION_LABELS[machine.condition]}</dd>
              </div>
              <div>
                <dt className="text-neutral-400">Localização</dt>
                <dd className="text-neutral-900">
                  {machine.property.city}/{machine.property.state}
                </dd>
              </div>
              {machine.distanceKm !== null && (
                <div>
                  <dt className="text-neutral-400">Distância estimada</dt>
                  <dd className="text-neutral-900">~{machine.distanceKm} km</dd>
                </div>
              )}
              {machine.purpose && (
                <div>
                  <dt className="text-neutral-400">Finalidade</dt>
                  <dd className="text-neutral-900">{machine.purpose}</dd>
                </div>
              )}
              {machine.recommendedCrops.length > 0 && (
                <div>
                  <dt className="text-neutral-400">Culturas recomendadas</dt>
                  <dd className="text-neutral-900">{machine.recommendedCrops.join(", ")}</dd>
                </div>
              )}
              {machine.deliveryRadiusKm && (
                <div>
                  <dt className="text-neutral-400">Raio de atendimento</dt>
                  <dd className="text-neutral-900">{machine.deliveryRadiusKm} km</dd>
                </div>
              )}
            </dl>

            {machine.availability.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-neutral-900">Períodos indisponíveis</h2>
                <ul className="mt-2 flex flex-col gap-1 text-sm text-neutral-500">
                  {machine.availability.map((block) => (
                    <li key={block.id}>
                      {new Date(block.startDate).toLocaleDateString("pt-BR")} —{" "}
                      {new Date(block.endDate).toLocaleDateString("pt-BR")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <Card className="h-fit w-full lg:w-80">
          <p className="text-2xl font-semibold text-neutral-900">
            {formatBRL(machine.dailyPriceInCents)}
            <span className="text-sm font-normal text-neutral-500"> /dia</span>
          </p>
          {machine.depositInCents ? (
            <p className="mt-1 text-xs text-neutral-500">
              Caução: {formatBRL(machine.depositInCents)}
            </p>
          ) : null}
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
            Anunciado por{" "}
            <Link href={`/perfil/${machine.owner.id}`} className="font-medium text-neutral-700 hover:underline">
              {machine.owner.name}
            </Link>
            {isPremiumActive(machine.owner.subscription) && <VerifiedPartnerBadge />}
          </p>

          <div className="mt-4">
            {!user ? (
              <Link href={`/login?callbackUrl=/catalogo/${machine.slug}`}>
                <Button className="w-full">Entrar para reservar</Button>
              </Link>
            ) : isOwner ? (
              <Alert tone="info" title="Esta é sua máquina">
                Você não pode reservar um anúncio próprio.
              </Alert>
            ) : (
              <BookingRequestForm machineId={machine.id} properties={renterProperties} />
            )}
          </div>

          {!isOwner && (
            <WhatsAppSupportLink
              message={`Olá! Tenho uma dúvida sobre reservar "${machine.title}" na Arvum.`}
              label="Dúvidas antes de reservar? Fale com a Arvum"
              className="mt-4"
            />
          )}
        </Card>
      </div>

      <Card id="avaliacoes" className="scroll-mt-6">
        <ReviewsSection
          averageRating={averageRating}
          count={reviewCount}
          reviews={reviews}
          currentUserId={user?.id}
        />
      </Card>
    </div>
  );
}
