"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { Machine, MachineCategory, Property } from "@prisma/client";
import {
  machineSchema,
  type MachineFormInput,
  type MachineFormOutput,
} from "../schemas/machine.schema";
import { resizeImageToDataUrl } from "../lib/image-file";
import { useCreateMachine, useUpdateMachine } from "../hooks/useMachines";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { PlusIcon } from "@/components/ui/PlusIcon";
import { IconButton } from "@/components/ui/IconButton";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { cn } from "@/lib/cn";

const CONDITION_LABELS: Record<string, string> = {
  NEW: "Nova",
  EXCELLENT: "Excelente",
  GOOD: "Boa",
  FAIR: "Regular",
  NEEDS_MAINTENANCE: "Precisa de manutenção",
};

// Só a criação passa pelo assistente em etapas — quem está editando já preencheu tudo antes e
// quer revisar/ajustar um campo pontual, não navegar por um wizard de novo (Arvum Playbook §04:
// a fricção do formulário longo é maior no primeiro/segundo anúncio, não na edição).
const STEPS = [
  {
    label: "Dados básicos",
    fields: [
      "title",
      "propertyId",
      "categoryId",
      "brand",
      "model",
      "manufactureYear",
      "description",
      "purpose",
      "recommendedCrops",
    ],
  },
  {
    label: "Características técnicas",
    fields: ["condition", "weight", "width", "height", "length", "requiresOperator"],
  },
  {
    label: "Preço e disponibilidade",
    fields: [
      "dailyPrice",
      "hourlyPrice",
      "minimumPrice",
      "deposit",
      "minimumRentalDays",
      "maximumRentalDays",
      "deliveryRadiusKm",
      "deliveryPricePerKm",
      "deliveryBaseFee",
    ],
  },
] as const satisfies { label: string; fields: (keyof MachineFormInput)[] }[];

// Etapa extra do assistente, fora de STEPS de propósito: não tem campo de react-hook-form pra
// validar (as fotos vivem em estado local, não no formulário), e não faz parte da visão plana da
// edição — quem edita já usa o upload imediato de MachineImageManager.tsx, na página de edição.
const PHOTOS_STEP_LABEL = "Fotos";
const REVIEW_STEP_LABEL = "Revisar";

// Só exibição — aceita qualquer tipo de valor (campo ainda não tocado, número, texto) e some da
// tela quando vazio, em vez de mostrar um rótulo sem valor nenhum ao lado.
function ReviewField({ label, value }: { label: string; value: unknown }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <dt className="text-neutral-400">{label}</dt>
      <dd className="text-neutral-900">{String(value)}</dd>
    </div>
  );
}

interface MachineFormProps {
  machine?: Machine;
  properties: Property[];
  categories: MachineCategory[];
}

export function MachineForm({ machine, properties, categories }: MachineFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = Boolean(machine);
  const [step, setStep] = useState(0);
  const isFirstRender = useRef(true);
  const topRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Fotos escolhidas durante a criação (data URLs já redimensionados) — vão junto no corpo da
  // criação da máquina em vez de precisarem de um machineId que ainda não existe (Arvum Playbook:
  // sem isso, adicionar imagem só era possível depois de salvar, na tela de edição).
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<MachineFormInput>({
    resolver: zodResolver(machineSchema),
    defaultValues: machine
      ? {
          propertyId: machine.propertyId,
          categoryId: machine.categoryId,
          title: machine.title,
          brand: machine.brand ?? "",
          model: machine.model ?? "",
          manufactureYear: machine.manufactureYear ?? undefined,
          description: machine.description,
          purpose: machine.purpose ?? "",
          recommendedCrops: machine.recommendedCrops.join(", "),
          condition: machine.condition,
          weight: machine.weight ?? undefined,
          width: machine.width ?? undefined,
          height: machine.height ?? undefined,
          length: machine.length ?? undefined,
          requiresOperator: machine.requiresOperator,
          dailyPrice: machine.dailyPriceInCents / 100,
          hourlyPrice: machine.hourlyPriceInCents ? machine.hourlyPriceInCents / 100 : undefined,
          minimumPrice: machine.minimumPriceInCents
            ? machine.minimumPriceInCents / 100
            : undefined,
          deposit: machine.depositInCents ? machine.depositInCents / 100 : undefined,
          minimumRentalDays: machine.minimumRentalDays,
          maximumRentalDays: machine.maximumRentalDays ?? undefined,
          deliveryRadiusKm: machine.deliveryRadiusKm ?? undefined,
          deliveryPricePerKm: machine.deliveryPricePerKmInCents
            ? machine.deliveryPricePerKmInCents / 100
            : undefined,
          deliveryBaseFee: machine.deliveryBaseFeeInCents
            ? machine.deliveryBaseFeeInCents / 100
            : undefined,
        }
      : { minimumRentalDays: 1 },
  });

  const deliveryRadiusKm = watch("deliveryRadiusKm");
  const offersDelivery = Boolean(deliveryRadiusKm);

  const createMutation = useCreateMachine();
  const updateMutation = useUpdateMachine(machine?.id ?? "");

  // Rola de volta ao topo do cartão a cada troca de etapa — sem isso, quem clicou "Avançar" no
  // fim da tela ficaria olhando para o mesmo lugar enquanto os campos da nova etapa aparecem
  // acima, fora da área visível.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    topRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }, [step]);

  async function handleNext() {
    const valid = await trigger(STEPS[step]!.fields);
    if (valid) setStep((current) => current + 1);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Limpa já aqui — sem isso, escolher o mesmo arquivo de novo (ex.: depois de um erro) não
    // dispara um novo evento "change".
    event.target.value = "";
    if (!file) return;

    setImageError(null);
    setIsProcessingImage(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setPendingImages((current) => [...current, dataUrl]);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Não foi possível adicionar a imagem.");
    } finally {
      setIsProcessingImage(false);
    }
  }

  function removeImageAt(index: number) {
    setPendingImages((current) => current.filter((_, i) => i !== index));
  }

  // O zodResolver já entrega os dados transformados/validados (recommendedCrops como array,
  // preços como number etc.) apesar do tipo estático de `register`/defaultValues ser o shape
  // bruto do formulário — react-hook-form não expõe um terceiro genérico compatível com esta
  // versão do @hookform/resolvers para refletir isso no tipo do callback.
  async function onSubmit(rawData: MachineFormInput) {
    const data = rawData as unknown as MachineFormOutput;
    setSubmitError(null);
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data);
        router.push("/maquinas");
      } else {
        const created = await createMutation.mutateAsync({ ...data, images: pendingImages });

        if (pendingImages.length > 0) {
          // Passou pela revisão e tem foto: publica de verdade (DRAFT → ACTIVE), a mesma
          // transição de MachineStatusActions.tsx — sem isso, "Publicar anúncio" na revisão seria
          // só um nome bonito para "salvar como rascunho de novo". Melhor esforço: a máquina já
          // foi criada com sucesso mesmo se isto falhar, e continua publicável manualmente depois.
          try {
            await fetch(`/api/v1/machines/${created.id}/status`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "ACTIVE" }),
            });
          } catch {
            // segue normalmente — publicar manualmente na edição continua disponível
          }
          router.push("/maquinas");
        } else {
          // Sem foto, não tem o que publicar — manda pra edição já rolada até "Imagens" em vez de
          // deixar a pessoa descobrir sozinha onde voltar depois.
          router.push(`/maquinas/${created.id}/editar#imagens`);
        }
      }
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Erro inesperado.");
    }
  }

  const stepBasico = (
    <div className="flex flex-col gap-4">
      <FormField label="Nome do anúncio" required error={errors.title?.message}>
        <Input placeholder="Ex.: Trator Massey Ferguson 275" {...register("title")} />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Propriedade" required error={errors.propertyId?.message}>
          <Select {...register("propertyId")}>
            <option value="">Selecione</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Categoria" required error={errors.categoryId?.message}>
          <Select {...register("categoryId")}>
            <option value="">Selecione</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label="Marca" helpText="Opcional" error={errors.brand?.message}>
          <Input {...register("brand")} />
        </FormField>
        <FormField label="Modelo" helpText="Opcional" error={errors.model?.message}>
          <Input {...register("model")} />
        </FormField>
        <FormField label="Ano" helpText="Opcional" error={errors.manufactureYear?.message}>
          <Input type="number" {...register("manufactureYear")} />
        </FormField>
      </div>

      <FormField label="Descrição" required error={errors.description?.message}>
        <Textarea
          placeholder="Descreva o estado, o uso recomendado e os diferenciais da máquina."
          {...register("description")}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Finalidade" helpText="Opcional" error={errors.purpose?.message}>
          <Input placeholder="Ex.: preparo de solo" {...register("purpose")} />
        </FormField>
        <FormField
          label="Culturas recomendadas"
          helpText="Opcional — separadas por vírgula"
          error={errors.recommendedCrops?.message as string | undefined}
        >
          <Input placeholder="Ex.: soja, milho" {...register("recommendedCrops")} />
        </FormField>
      </div>
    </div>
  );

  const stepTecnico = (
    <div className="flex flex-col gap-4">
      <FormField label="Condição do equipamento" required error={errors.condition?.message}>
        <Select {...register("condition")}>
          <option value="">Selecione</option>
          {Object.entries(CONDITION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FormField label="Peso (kg)" helpText="Opcional" error={errors.weight?.message}>
          <Input type="number" step="0.01" {...register("weight")} />
        </FormField>
        <FormField label="Largura (m)" helpText="Opcional" error={errors.width?.message}>
          <Input type="number" step="0.01" {...register("width")} />
        </FormField>
        <FormField label="Altura (m)" helpText="Opcional" error={errors.height?.message}>
          <Input type="number" step="0.01" {...register("height")} />
        </FormField>
        <FormField label="Comprimento (m)" helpText="Opcional" error={errors.length?.message}>
          <Input type="number" step="0.01" {...register("length")} />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-neutral-300"
          {...register("requiresOperator")}
        />
        Requer operador
      </label>
    </div>
  );

  const stepPreco = (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Diária (R$)" required error={errors.dailyPrice?.message}>
          <Input type="number" step="0.01" {...register("dailyPrice")} />
        </FormField>
        <FormField
          label="Valor por hora (R$)"
          helpText="Opcional"
          error={errors.hourlyPrice?.message}
        >
          <Input type="number" step="0.01" {...register("hourlyPrice")} />
        </FormField>
        <FormField
          label="Valor mínimo de locação (R$)"
          helpText="Opcional"
          error={errors.minimumPrice?.message}
        >
          <Input type="number" step="0.01" {...register("minimumPrice")} />
        </FormField>
        <FormField label="Caução (R$)" helpText="Opcional" error={errors.deposit?.message}>
          <Input type="number" step="0.01" {...register("deposit")} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label="Duração mínima (dias)" error={errors.minimumRentalDays?.message}>
          <Input type="number" {...register("minimumRentalDays")} />
        </FormField>
        <FormField
          label="Duração máxima (dias)"
          helpText="Opcional"
          error={errors.maximumRentalDays?.message}
        >
          <Input type="number" {...register("maximumRentalDays")} />
        </FormField>
        <FormField
          label="Raio de atendimento (km)"
          helpText="Opcional — preencha para oferecer entrega pelo proprietário"
          error={errors.deliveryRadiusKm?.message}
        >
          <Input type="number" step="0.1" {...register("deliveryRadiusKm")} />
        </FormField>
      </div>

      {offersDelivery && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Taxa mínima de entrega (R$)"
            helpText="Opcional — sem informar, usamos um valor padrão da plataforma"
            error={errors.deliveryBaseFee?.message}
          >
            <Input type="number" step="0.01" {...register("deliveryBaseFee")} />
          </FormField>
          <FormField
            label="Preço por km de entrega (R$)"
            helpText="Opcional — sem informar, usamos um valor padrão da plataforma"
            error={errors.deliveryPricePerKm?.message}
          >
            <Input type="number" step="0.01" {...register("deliveryPricePerKm")} />
          </FormField>
        </div>
      )}
    </div>
  );

  const stepFotos = (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-neutral-500">
        Adicione fotos do equipamento — dá pra publicar sem foto nenhuma, mas o anúncio só fica
        visível no catálogo depois de ter ao menos uma.
      </p>

      {imageError && <Alert tone="error" title={imageError} />}

      {pendingImages.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {pendingImages.map((url, index) => (
            <div key={index} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- prévia local antes de a máquina existir, ainda sem id pra usar MachineImageManager */}
              <img
                src={url}
                alt=""
                className="aspect-square w-full rounded-md border border-neutral-200 object-cover"
              />
              <IconButton
                icon={<TrashIcon />}
                label="Remover imagem"
                variant="danger"
                onClick={() => removeImageAt(index)}
                className="absolute top-2 right-2 shadow-sm"
              />
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
      />
      <Button
        type="button"
        variant="secondary"
        isLoading={isProcessingImage}
        onClick={() => fileInputRef.current?.click()}
        className="self-start"
      >
        <PlusIcon />
        Adicionar imagem
      </Button>
    </div>
  );

  const reviewValues = watch();
  const selectedProperty = properties.find((property) => property.id === reviewValues.propertyId);
  const selectedCategory = categories.find((category) => category.id === reviewValues.categoryId);

  const stepRevisar = (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-neutral-500">
        Confira os dados antes de {pendingImages.length > 0 ? "publicar" : "salvar"}. Use
        &quot;Voltar&quot; para ajustar qualquer campo.
      </p>

      <div className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Dados básicos</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <ReviewField label="Nome do anúncio" value={reviewValues.title} />
          <ReviewField label="Propriedade" value={selectedProperty?.name} />
          <ReviewField label="Categoria" value={selectedCategory?.name} />
          <ReviewField label="Marca" value={reviewValues.brand} />
          <ReviewField label="Modelo" value={reviewValues.model} />
          <ReviewField label="Ano" value={reviewValues.manufactureYear} />
        </dl>
        <ReviewField label="Descrição" value={reviewValues.description} />
        <ReviewField label="Finalidade" value={reviewValues.purpose} />
        <ReviewField label="Culturas recomendadas" value={reviewValues.recommendedCrops} />
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Características técnicas</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
          <ReviewField
            label="Condição"
            value={reviewValues.condition ? CONDITION_LABELS[reviewValues.condition] : undefined}
          />
          <ReviewField label="Peso" value={reviewValues.weight ? `${reviewValues.weight} kg` : undefined} />
          <ReviewField label="Largura" value={reviewValues.width ? `${reviewValues.width} m` : undefined} />
          <ReviewField label="Altura" value={reviewValues.height ? `${reviewValues.height} m` : undefined} />
          <ReviewField
            label="Comprimento"
            value={reviewValues.length ? `${reviewValues.length} m` : undefined}
          />
        </dl>
        <p className="text-sm text-neutral-700">
          {reviewValues.requiresOperator ? "Requer operador" : "Não requer operador"}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Preço e disponibilidade</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
          <ReviewField
            label="Diária"
            value={reviewValues.dailyPrice ? `R$ ${reviewValues.dailyPrice}` : undefined}
          />
          <ReviewField
            label="Valor/hora"
            value={reviewValues.hourlyPrice ? `R$ ${reviewValues.hourlyPrice}` : undefined}
          />
          <ReviewField
            label="Mínimo"
            value={reviewValues.minimumPrice ? `R$ ${reviewValues.minimumPrice}` : undefined}
          />
          <ReviewField
            label="Caução"
            value={reviewValues.deposit ? `R$ ${reviewValues.deposit}` : undefined}
          />
          <ReviewField
            label="Duração mín."
            value={reviewValues.minimumRentalDays ? `${reviewValues.minimumRentalDays} dia(s)` : undefined}
          />
          <ReviewField
            label="Duração máx."
            value={reviewValues.maximumRentalDays ? `${reviewValues.maximumRentalDays} dia(s)` : undefined}
          />
          <ReviewField
            label="Raio de entrega"
            value={reviewValues.deliveryRadiusKm ? `${reviewValues.deliveryRadiusKm} km` : undefined}
          />
        </dl>
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Fotos</h3>
        {pendingImages.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Nenhuma foto adicionada — o anúncio será salvo como rascunho até você adicionar ao
            menos uma e publicar.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {pendingImages.map((url, index) => (
              // eslint-disable-next-line @next/next/no-img-element -- prévia local antes de a máquina existir
              <img
                key={index}
                src={url}
                alt=""
                className="aspect-square w-full rounded-md border border-neutral-200 object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const stepContent = [stepBasico, stepTecnico, stepPreco];
  const totalWizardSteps = STEPS.length + 2; // + Fotos + Revisar
  const isPhotosStep = step === STEPS.length;
  const isReviewStep = step === STEPS.length + 1;
  const currentStepLabel =
    step < STEPS.length ? STEPS[step]!.label : isPhotosStep ? PHOTOS_STEP_LABEL : REVIEW_STEP_LABEL;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div ref={topRef} className="scroll-mt-6" />

      {submitError && <Alert tone="error" title={submitError} />}

      {!isEditing && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5">
            {Array.from({ length: totalWizardSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-base",
                  index <= step ? "bg-primary-600" : "bg-neutral-200",
                )}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-500">
            Passo {step + 1} de {totalWizardSteps} — {currentStepLabel}
          </p>
        </div>
      )}

      {isEditing ? (
        <div className="flex flex-col gap-6">
          {STEPS.map((s, index) => (
            <div key={s.label} className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-neutral-900">{s.label}</h2>
              {stepContent[index]}
            </div>
          ))}
        </div>
      ) : step < STEPS.length ? (
        stepContent[step]
      ) : isPhotosStep ? (
        stepFotos
      ) : (
        stepRevisar
      )}

      <div className="flex gap-3">
        {!isEditing && step > 0 && (
          <Button type="button" variant="secondary" onClick={() => setStep((current) => current - 1)}>
            Voltar
          </Button>
        )}
        {!isEditing && step < STEPS.length && (
          <Button type="button" onClick={handleNext}>
            Avançar
          </Button>
        )}
        {!isEditing && isPhotosStep && (
          <Button type="button" onClick={() => setStep((current) => current + 1)}>
            Revisar
          </Button>
        )}
        {(isEditing || isReviewStep) && (
          <Button
            type="submit"
            variant={!isEditing && pendingImages.length > 0 ? "primary" : "secondary"}
            isLoading={isSubmitting}
          >
            {isEditing
              ? "Salvar alterações"
              : pendingImages.length > 0
                ? "Publicar anúncio"
                : "Cadastrar como rascunho"}
          </Button>
        )}
      </div>
    </form>
  );
}
