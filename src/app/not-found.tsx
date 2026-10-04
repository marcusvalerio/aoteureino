import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-start justify-center px-6 py-24 sm:px-10">
      <p className="eyebrow text-accent">Caminho não encontrado</p>
      <h1 className="font-display mt-5 text-[2rem] leading-tight text-ink">Esta página não existe.</h1>
      <Link href="/" className="eyebrow mt-10 inline-flex min-h-12 items-center border-b border-line-strong text-ink">
        Voltar para hoje
      </Link>
    </section>
  );
}
