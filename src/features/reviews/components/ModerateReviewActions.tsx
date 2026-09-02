"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useModerateReview } from "../hooks/useReviews";

export function ModerateReviewActions({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const mutation = useModerateReview(reviewId);

  async function handle(decision: "HIDE" | "RESTORE") {
    setError(null);
    try {
      await mutation.mutateAsync(decision);
      // A avaliação sai de REPORTED de qualquer forma (HIDDEN ou de volta a PUBLISHED) — nos dois
      // casos ela deixa de pertencer a esta fila, então a lista precisa recarregar.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <Alert tone="error" title={error} />}
      <div className="flex flex-wrap gap-3">
        <Button variant="danger" isLoading={mutation.isPending} onClick={() => handle("HIDE")}>
          Ocultar avaliação
        </Button>
        <Button variant="secondary" isLoading={mutation.isPending} onClick={() => handle("RESTORE")}>
          Manter avaliação (descartar denúncia)
        </Button>
      </div>
    </div>
  );
}
