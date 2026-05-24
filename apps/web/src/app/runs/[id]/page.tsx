import Link from "next/link"
import { notFound } from "next/navigation"

import { readRun } from "@/lib/runsFs"
import { strategyLabel } from "@/lib/strategy"

export default async function RunPage(props: { params: { id: string } }) {
  const run = await readRun(props.params.id)
  if (!run) notFound()

  const m = run.metrics

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-5">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.22em] text-white/60">
              Run
            </div>
            <h1 className="mt-1 truncate text-2xl font-semibold text-white">
              {strategyLabel(run.meta.strategy)} · {run.meta.startedAt}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/runs"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Voltar
            </Link>
            <Link
              href={`/?a=${encodeURIComponent(run.meta.id)}`}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Comparar como A
            </Link>
            <Link
              href={`/?b=${encodeURIComponent(run.meta.id)}`}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Comparar como B
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/60">
              Metadados
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-white/50">ID</dt>
                <dd className="mt-1 font-mono text-xs text-white/80">{run.meta.id}</dd>
              </div>
              <div>
                <dt className="text-white/50">Cenário</dt>
                <dd className="mt-1 text-white/80">{run.meta.scenario}</dd>
              </div>
              <div>
                <dt className="text-white/50">Seed</dt>
                <dd className="mt-1 text-white/80">{run.meta.seed}</dd>
              </div>
              <div>
                <dt className="text-white/50">Duração</dt>
                <dd className="mt-1 text-white/80">{run.meta.durationSeconds}s</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/60">
              Métricas
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-white/50">Espera média</dt>
                <dd className="mt-1 text-white/80">{m.avgWaitingTimeSeconds.toFixed(2)}s</dd>
              </div>
              <div>
                <dt className="text-white/50">Fila média</dt>
                <dd className="mt-1 text-white/80">{m.avgQueueLength.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-white/50">Fila máxima</dt>
                <dd className="mt-1 text-white/80">{m.maxQueueLength}</dd>
              </div>
              <div>
                <dt className="text-white/50">Veículos concluídos</dt>
                <dd className="mt-1 text-white/80">{m.vehiclesCompleted}</dd>
              </div>
              <div>
                <dt className="text-white/50">Tempo de viagem</dt>
                <dd className="mt-1 text-white/80">{m.avgTravelTimeSeconds.toFixed(2)}s</dd>
              </div>
              <div>
                <dt className="text-white/50">Paradas médias</dt>
                <dd className="mt-1 text-white/80">{m.avgStops.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-white/60">
            JSON do Run
          </div>
          <pre className="mt-3 max-h-[520px] overflow-auto rounded-lg border border-white/10 bg-black/40 p-4 text-xs text-white/75">
            {JSON.stringify(run, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  )
}

