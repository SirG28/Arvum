import type { MachineImage } from "@prisma/client";

export function MachineGallery({ images, title }: { images: MachineImage[]; title: string }) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400">
        Sem imagens cadastradas
      </div>
    );
  }

  const [first, ...rest] = images;
  if (!first) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- URL arbitrária informada pelo proprietário */}
      <img
        src={first.url}
        alt={first.altText ?? title}
        className="aspect-video w-full rounded-lg border border-neutral-200 object-cover"
      />
      {rest.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {rest.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element -- URL arbitrária informada pelo proprietário
            <img
              key={image.id}
              src={image.url}
              alt={image.altText ?? title}
              className="aspect-square w-full rounded-md border border-neutral-200 object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}
