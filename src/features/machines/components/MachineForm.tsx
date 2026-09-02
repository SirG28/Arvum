"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { Machine, MachineCategory, Property } from "@prisma/client";
import {
  machineSchema,
  type MachineFormInput,
  type MachineFormOutput,
} from "../schemas/machine.schema";
import { useCreateMachine, useUpdateMachine } from "../hooks/useMachines";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
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
      "instantBooking",
    ],
  },
] as const satisfies { label: string; fields: (keyof MachineFormInput)[] }[];

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
          instantBooking: machine.instantBooking,
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
      } else {
        await createMutation.mutateAsync(data);
      }
      router.push("/maquinas");
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

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-neutral-300"
          {...register("instantBooking")}
        />
        Permitir reserva instantânea (sem aprovação manual do proprietário)
      </label>
    </div>
  );

  const stepContent = [stepBasico, stepTecnico, stepPreco];
  const isLastStep = step === STEPS.length - 1;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div ref={topRef} className="scroll-mt-6" />

      {submitError && <Alert tone="error" title={submitError} />}

      {!isEditing && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5">
            {STEPS.map((s, index) => (
              <div
                key={s.label}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-base",
                  index <= step ? "bg-primary-600" : "bg-neutral-200",
                )}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-500">
            Passo {step + 1} de {STEPS.length} — {STEPS[step]!.label}
          </p>
        </div>
      )}

      {isEditing ? (
        <div className="flex flex-col gap-6">
          {stepContent.map((content, index) => (
            <div key={STEPS[index]!.label} className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-neutral-900">{STEPS[index]!.label}</h2>
              {content}
            </div>
          ))}
        </div>
      ) : (
        stepContent[step]
      )}

      <div className="flex gap-3">
        {!isEditing && step > 0 && (
          <Button type="button" variant="secondary" onClick={() => setStep((current) => current - 1)}>
            Voltar
          </Button>
        )}
        {!isEditing && !isLastStep ? (
          <Button type="button" onClick={handleNext}>
            Avançar
          </Button>
        ) : (
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Salvar alterações" : "Cadastrar máquina"}
          </Button>
        )}
      </div>
    </form>
  );
}
