import { UserIcon } from "./UserIcon";
import { cn } from "@/lib/cn";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-9 w-9",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

const ICON_SIZE_CLASSES: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-7 w-7",
  lg: "h-10 w-10",
};

// Foto de perfil ou, na ausência de uma, o mesmo ícone de pessoa usado no resto do app
// (UserIcon) — nunca um círculo vazio sem indicação nenhuma do que preencher.
export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-50 text-neutral-400",
        SIZE_CLASSES[size],
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- pode vir de uma URL externa ou de um arquivo local convertido em data URL, sem provedor de imagem configurado
        <img
          src={src}
          alt={name ? `Foto de ${name}` : "Foto de perfil"}
          className="h-full w-full object-cover"
        />
      ) : (
        <UserIcon className={ICON_SIZE_CLASSES[size]} />
      )}
    </span>
  );
}
