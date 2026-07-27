import { notFound } from "next/navigation";
import { getPublicMachineBySlug } from "@/features/machines/services/machine.service";
import { MachineGallery } from "@/features/machines/components/MachineGallery";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
}

export async function generateMetadata({ params }: MachineDetailPageProps) {
  const { slug } = await params;
  const machine = await getPublicMachineBySlug(slug);
  return { title: machine ? machine.title : "Máquina não encontrada" };
}

export default async function MachineDetailPage({ params }: MachineDetailPageProps) {
  const { slug } = await params;
  const machine = await getPublicMachineBySlug(slug);
  if (!machine) notFound();

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <MachineGallery images={machine.images} title={machine.title} />

        <div className="mt-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-neutral-900">{machine.title}</h1>
            {machine.requiresOperator && <Badge tone="info">Requer operador</Badge>}
          </div>
          <p className="text-sm text-neutral-500">
            {machine.category.name}
            {machine.brand ? ` — ${machine.brand}` : ""}
            {machine.model ? ` ${machine.model}` : ""}
          </p>
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
        <p className="mt-1 text-xs text-neutral-500">Anunciado por {machine.owner.name}</p>
        <Button
          className="mt-4 w-full"
          disabled
          title="Reservas chegam na próxima fase da plataforma"
        >
          Reservar (em breve)
        </Button>
      </Card>
    </div>
  );
}
