import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <Logo size={22} />
        <p className="text-xs text-neutral-500">
          © {new Date().getFullYear()} Arvum — máquinas agrícolas ociosas, transformadas em
          produtividade.
        </p>
      </div>
    </footer>
  );
}
