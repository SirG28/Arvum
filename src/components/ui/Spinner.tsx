import { cn } from "@/lib/cn";

interface SpinnerProps {
  size?: "sm" | "md";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        size === "sm" ? "h-4 w-4" : "h-6 w-6",
        className,
      )}
    />
  );
}
