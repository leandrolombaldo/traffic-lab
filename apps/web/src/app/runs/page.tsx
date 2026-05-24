import Link from "next/link"

import { listRuns } from "@/lib/runsFs"
import { strategyLabel } from "@/lib/strategy"

export default async function RunsPage() {
  const runs = await listRuns()

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-5">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.22em] text-white/60">
              SmartSignal Lab
            </div>
            <h1 className="mt-1 truncate text-2xl font-semibold text-white">Runs</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="rounded-xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-12 gap-3 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-white/60">
            <div className="col-span-3">Quando</div>
            <div className="col-span-2">Estratégia</div>
            <div className="col-span-2">Cenário</div>
            <div className="col-span-2">Seed</div>
            <div className="col-span-3 text-right">Ações</div>
          </div>

          {runs.length ? (
            <div className="divide-y divide-white/10">
              {runs.map((r) => (
                <div key={r.id} className="grid grid-cols-12 gap-3 px-4 py-4 text-sm">
                  <div className="col-span-3 text-white/80">{r.startedAt}</div>
                  <div className="col-span-2 text-white/80">{strategyLabel(r.strategy)}</div>
                  <div className="col-span-2 text-white/70">{r.scenario}</div>
                  <div className="col-span-2 text-white/70">{r.seed}</div>
                  <div className="col-span-3 flex justify-end gap-2">
                    <Link
                      href={`/runs/${encodeURIComponent(r.id)}`}
                      className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
                    >
                      Detalhe
                    </Link>
                    <Link
                      href={`/?a=${encodeURIComponent(r.id)}`}
                      className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
                    >
                      Usar como A
                    </Link>
                    <Link
                      href={`/?b=${encodeURIComponent(r.id)}`}
                      className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
                    >
                      Usar como B
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-10 text-sm text-white/60">
              Nenhum run encontrado em <span className="font-mono">data/runs</span>.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

