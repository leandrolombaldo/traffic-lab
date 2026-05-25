import type { Run } from "@/lib/runTypes"
import { strategyLabel } from "@/lib/strategy"

function lastPoint(run: Run | null) {
  if (!run?.timeseries?.length) return null
  return run.timeseries[run.timeseries.length - 1]
}

export function RunStateCard(props: { title: string; run: Run | null }) {
  const point = lastPoint(props.run)

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-white/60">{props.title}</div>

      {props.run ? (
        <div className="mt-3 space-y-3">
          <div>
            <div className="text-lg font-semibold text-white">
              {strategyLabel(props.run.meta.strategy)}
            </div>
            <div className="mt-1 text-xs text-white/45">
              cenário {props.run.meta.scenario} · seed {props.run.meta.seed}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/45">Última fase</div>
              <div className="mt-1 font-medium text-white">{point?.trafficLightPhase ?? "-"}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/45">Veículos ativos</div>
              <div className="mt-1 font-medium text-white">{point?.vehicleCount ?? "-"}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/45">Fila NS</div>
              <div className="mt-1 font-medium text-white">{point?.queueNS ?? "-"}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/45">Fila EW</div>
              <div className="mt-1 font-medium text-white">{point?.queueEW ?? "-"}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 text-sm text-white/45">Nenhum run selecionado.</div>
      )}
    </div>
  )
}
