import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SignupForm } from "@/features/authentication/components/SignupForm";

export const metadata = { title: "Criar conta" };

export default function SignupPage() {
  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-lg font-semibold text-neutral-900">Criar sua conta</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Uma mesma conta pode alugar e disponibilizar máquinas.
      </p>
      <div className="mt-6">
        <SignupForm />
      </div>
      <p className="mt-6 text-center text-sm text-neutral-500">
        Já tem conta?{" "}
        <Link href="/login" className="text-primary-500 font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
