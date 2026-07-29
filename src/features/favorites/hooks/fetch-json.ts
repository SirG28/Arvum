interface ApiErrorBody {
  error: { code: string; message: string };
}

export async function parseErrorOrThrow(response: Response) {
  if (response.ok) return response.json();
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  throw new Error(body?.error?.message ?? "Não foi possível concluir a operação.");
}
