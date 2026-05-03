export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
          Fluxo
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-foreground">
          Controle financeiro pessoal
        </h1>
        <p className="mt-4 text-base text-zinc-600">
          Uma base limpa para acompanhar receitas, despesas e sua evolução
          financeira.
        </p>
      </section>
    </main>
  );
}
