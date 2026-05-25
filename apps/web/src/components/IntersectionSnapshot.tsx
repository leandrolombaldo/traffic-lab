import type { Run, TimeSeriesPoint } from "@/lib/runTypes"
import { strategyLabel } from "@/lib/strategy"

function lastPoint(run: Run | null): TimeSeriesPoint | null {
  if (!run?.timeseries?.length) return null
  return run.timeseries[run.timeseries.length - 1]
}

function phaseLabel(phase?: string | null) {
  if (!phase) return "fase desconhecida"
  if (phase.startsWith("0")) return "Norte-Sul verde"
  if (phase.startsWith("1")) return "Norte-Sul amarelo"
  if (phase.startsWith("2")) return "Leste-Oeste verde"
  if (phase.startsWith("3")) return "Leste-Oeste amarelo"
  return phase
}

function queueDots(count: number | undefined, max = 8) {
  const safe = Math.max(0, Math.min(max, count ?? 0))
  return Array.from({ length: safe })
}

export function IntersectionSnapshot(props: { title: string; run: Run | null }) {
  const point = lastPoint(props.run)
  const nsQueue = point?.queueNS ?? 0
  const ewQueue = point?.queueEW ?? 0
  const phase = phaseLabel(point?.trafficLightPhase)
  const isNsActive = point?.trafficLightPhase?.startsWith("0") || point?.trafficLightPhase?.startsWith("1")
  const isEwActive = point?.trafficLightPhase?.startsWith("2") || point?.trafficLightPhase?.startsWith("3")

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/60">{props.title}</div>
          <div className="mt-1 text-sm text-white/45">
            {props.run ? `${strategyLabel(props.run.meta.strategy)} · ${props.run.meta.scenario}` : "Nenhum run selecionado"}
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
          {phase}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="relative h-[340px] overflow-hidden rounded-xl border border-white/10 bg-black/30">
          <div className="absolute left-1/2 top-0 h-full w-20 -translate-x-1/2 bg-white/10" />
          <div className="absolute left-0 top-1/2 h-20 w-full -translate-y-1/2 bg-white/10" />

          <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-black/50" />

          <div className="absolute left-1/2 top-5 -translate-x-1/2 text-xs font-medium text-white/60">Norte</div>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium text-white/60">Sul</div>
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-medium text-white/60">Oeste</div>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-medium text-white/60">Leste</div>

          <div className="absolute left-[calc(50%-54px)] top-[calc(50%-54px)] h-4 w-4 rounded-full border border-white/20 bg-black" />
          <div className={`absolute left-[calc(50%-51px)] top-[calc(50%-51px)] h-2.5 w-2.5 rounded-full ${isNsActive ? "bg-emerald-300" : "bg-red-400"}`} />

          <div className="absolute right-[calc(50%-54px)] bottom-[calc(50%-54px)] h-4 w-4 rounded-full border border-white/20 bg-black" />
          <div className={`absolute right-[calc(50%-51px)] bottom-[calc(50%-51px)] h-2.5 w-2.5 rounded-full ${isEwActive ? "bg-emerald-300" : "bg-red-400"}`} />

          <div className="absolute left-[calc(50%+18px)] top-16 flex flex-col-reverse gap-1">
            {queueDots(nsQueue).map((_, i) => (
              <div key={`n-${i}`} className="h-4 w-7 rounded-sm bg-emerald-300/80" />
            ))}
          </div>

          <div className="absolute bottom-16 right-[calc(50%+18px)] flex flex-col gap-1">
            {queueDots(nsQueue).map((_, i) => (
              <div key={`s-${i}`} className="h-4 w-7 rounded-sm bg-emerald-300/50" />
            ))}
          </div>

          <div className="absolute left-16 top-[calc(50%+18px)] flex gap-1">
            {queueDots(ewQueue).map((_, i) => (
              <div key={`w-${i}`} className="h-7 w-4 rounded-sm bg-violet-300/80" />
            ))}
          </div>

          <div className="absolute right-16 bottom-[calc(50%+18px)] flex flex-row-reverse gap-1">
            {queueDots(ewQueue).map((_, i) => (
              <div key={`e-${i}`} className="h-7 w-4 rounded-sm bg-violet-300/50" />
            ))}
          </div>

          <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/60">
            Cada bloco representa visualmente uma parte da fila, limitado a 8 blocos.
          </div>
        </div>

        <div className="grid content-start gap-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/45">Fila Norte-Sul</div>
            <div className="mt-2 text-3xl font-semibold text-white">{nsQueue}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/45">Fila Leste-Oeste</div>
            <div className="mt-2 text-3xl font-semibold text-white">{ewQueue}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/45">Veículos ativos</div>
            <div className="mt-2 text-3xl font-semibold text-white">{point?.vehicleCount ?? "-"}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
