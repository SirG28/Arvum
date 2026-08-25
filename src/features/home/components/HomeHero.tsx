import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ValueProps } from "./ValueProps";

interface HomeHeroProps {
  userName?: string | null;
  pendingCount: number;
}

export function HomeHero({ userName, pendingCount }: HomeHeroProps) {
  const isMember = userName !== undefined;

  return (
    <div className="bg-primary-50">
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-12 px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <h1
            className="text-3xl font-semibold text-neutral-900 sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {isMember ? (
              `Olá, ${userName ?? "produtor"}`
            ) : (
              <>
                Transforme máquinas ociosas
                <br />
                em <span className="text-primary-600">produtividade</span>
              </>
            )}
          </h1>
          <p className="max-w-xl text-base text-neutral-500">
            {isMember
              ? "Bem-vindo(a) de volta à Arvum. Encontre a máquina que você precisa ou acompanhe suas reservas."
              : "A Arvum conecta produtores rurais que precisam de máquinas agrícolas a proprietários com equipamentos disponíveis, com logística integrada de ponta a ponta."}
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col items-center gap-3">
          <form action="/catalogo" method="get" className="flex w-full gap-2">
            <Input
              name="q"
              placeholder="Ex.: trator, colheitadeira"
              aria-label="Buscar máquina no catálogo"
            />
            <Button type="submit">Buscar</Button>
          </form>

          {isMember && pendingCount > 0 ? (
            <Link href="/reservas">
              <Button variant="secondary">
                Ver {pendingCount === 1 ? "pendência" : "pendências"} de reserva
              </Button>
            </Link>
          ) : (
            !isMember && (
              <Link href="/catalogo">
                <Button variant="secondary">Ver catálogo completo</Button>
              </Link>
            )
          )}
        </div>

        {!isMember && <ValueProps />}
      </section>
    </div>
  );
}
