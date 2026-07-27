import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-neutral-200 px-6 py-10 text-center">
      <p className="text-sm font-medium text-neutral-900">{title}</p>
      {description && <p className="text-sm text-neutral-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
