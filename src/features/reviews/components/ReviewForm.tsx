"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { Rating } from "@/components/ui/Rating";
import { useCreateReview } from "../hooks/useReviews";
import type { ReviewRequestInput } from "../schemas/review.schema";
import { cn } from "@/lib/cn";

type ReviewAspectKey =
  | "machineConditionRating"
  | "communicationRating"
  | "punctualityRating"
  | "logisticsRating";

interface ReviewFormProps {
  bookingId: string;
  role: "RENTER" | "OWNER";
  targetName: string;
  className?: string;
}

// Aspectos separados por avaliação (Context.md §8.14): quem alugou avalia também o estado do
// equipamento e a experiência logística; o proprietário, ao avaliar o locatário, só faz sentido
// opinar sobre comunicação e pontualidade.
const ASPECTS_BY_ROLE: Record<"RENTER" | "OWNER", Array<{ key: ReviewAspectKey; label: string }>> = {
  RENTER: [
    { key: "machineConditionRating", label: "Estado do equipamento" },
    { key: "communicationRating", label: "Comunicação" },
    { key: "punctualityRating", label: "Pontualidade" },
    { key: "logisticsRating", label: "Experiência logística" },
  ],
  OWNER: [
    { key: "communicationRating", label: "Comunicação" },
    { key: "punctualityRating", label: "Pontualidade" },
  ],
};

export function ReviewForm({ bookingId, role, targetName, className }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [aspects, setAspects] = useState<Partial<Record<ReviewAspectKey, number>>>({});
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mutation = useCreateReview(bookingId);

  async function handleSubmit() {
    setError(null);
    if (rating === 0) {
      setError("Escolha uma nota geral de 1 a 5 antes de enviar.");
      return;
    }
    const input: ReviewRequestInput = { rating, ...aspects, comment: comment.trim() || undefined };
    try {
      await mutation.mutateAsync(input);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {error && <Alert tone="error" title={error} />}

      <FormField label={`Nota geral para ${targetName}`} required>
        <Rating value={rating} onChange={setRating} label="Nota geral" />
      </FormField>

      {ASPECTS_BY_ROLE[role].map(({ key, label }) => (
        <FormField key={key} label={label}>
          <Rating
            value={aspects[key] ?? 0}
            onChange={(value) => setAspects((prev) => ({ ...prev, [key]: value }))}
            size="sm"
            label={label}
          />
        </FormField>
      ))}

      <FormField label="Comentário (opcional)">
        <Textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          placeholder="Conte como foi a experiência..."
        />
      </FormField>

      <Button className="self-start" isLoading={mutation.isPending} onClick={handleSubmit}>
        Enviar avaliação
      </Button>
    </div>
  );
}
