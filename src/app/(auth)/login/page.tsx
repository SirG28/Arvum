import Link from "next/link";
import { Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/features/authentication/components/LoginForm";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-lg font-semibold text-neutral-900">Entrar na sua conta</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Acesse para alugar ou anunciar máquinas agrícolas.
      </p>
      <div className="mt-6">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-6 text-center text-sm text-neutral-500">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="text-primary-500 font-medium hover:underline">
          Criar conta
        </Link>
      </p>
    </Card>
  );
}
