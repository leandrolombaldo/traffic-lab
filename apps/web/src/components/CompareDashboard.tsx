import Link from "next/link"

import { DirectionalQueueChart } from "@/components/DirectionalQueueChart"
import { IntersectionSnapshot } from "@/components/IntersectionSnapshot"
import { MetricCard } from "@/components/MetricCard"
import { RunStateCard } from "@/components/RunStateCard"
import { TimeSeriesChart } from "@/components/TimeSeriesChart"
import type { Run, RunSummary } from "@/lib/runTypes"
import { strategyLabel } from "@/lib/strategy"

function formatSeconds(value: number) {
  if (!Number.isFinite(value)) return "-"
  return `${value.toFixed(1)}s`
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "-"
  return value.toFixed(2)
}

function pctDiff(a: number, b: number) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || a === 0) return null
  return ((b - a) / a) * 100
}

export function CompareDashboard(props: {
  runs: RunSummary[]
  a: Run | null
  b: Run | null
  aId: string | null
  bId: string | null
}) {
  const sorted = [...props.runs].sort((x, y) => y.startedAt.localeCompare(x.startedAt))
  const a = props.a
  const b = props.b

  const aTone = a?.meta.strategy === "fixed" ? "fixed" : a?.meta.strategy === "rule_based" ? "rule" : "neutral"
  const bTone = b?.meta.strategy === "fixed" ? "fixed" : b?.meta.strategy === "rule_based" ? "rule" : "neutral"

  const deltaWait = a && b ? pctDiff(a.metrics.avgWaitingTimeSeconds, b.metrics.avgWaitingTimeSeconds) : null
  const deltaQueue = a && b ? pctDiff(a.metrics.avgQueueLength, b.metrics.avgQueueLength) : null

  const headline = a && b ? "Comparativo" : "SmartSignal Lab"

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-5">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.22em] text-white/60">
              SmartSignal Lab
            </div>
            <h1 className="mt-1 truncate text-2xl font-semibold text-white">{headline}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/runs"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Runs
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <form action="/" method="GET" className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/60">Lado A</div>
            <div className="mt-3 flex items-center gap-3">
              <select
                name="a"
                defaultValue={props.aId ?? ""}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
              >
                <option value="">Selecione um run</option>
                {sorted.map((r) => (
                  <option key={r.id} value={r.id}>
                    {strategyLabel(r.strategy)} · {r.startedAt} · seed {r.seed}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Aplicar
              </button>
            </div>
            {a ? (
              <div className="mt-3 text-xs text-white/55">
                {strategyLabel(a.meta.strategy)} · cenário {a.meta.scenario} · {a.meta.durationSeconds}s
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/60">Lado B</div>
            <div className="mt-3 flex items-center gap-3">
              <select
                name="b"
                defaultValue={props.bId ?? ""}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
              >
                <option value="">Selecione um run</option>
                {sorted.map((r) => (
                  <option key={r.id} value={r.id}>
                    {strategyLabel(r.strategy)} · {r.startedAt} · seed {r.seed}
                  </option>
                ))}
              </select>
              <div className="text-xs text-white/55">
                {sorted.length ? `${sorted.length} runs` : "0 runs"}
              </div>
            </div>
            {b ? (
              <div className="mt-3 text-xs text-white/55">
                {strategyLabel(b.meta.strategy)} · cenário {b.meta.scenario} · {b.meta.durationSeconds}s
              </div>
            ) : null}
          </div>
        </form>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Espera média"
            value={
              a && b
                ? `${formatSeconds(a.metrics.avgWaitingTimeSeconds)} → ${formatSeconds(b.metrics.avgWaitingTimeSeconds)}`
                : a
                  ? formatSeconds(a.metrics.avgWaitingTimeSeconds)
                  : b
                    ? formatSeconds(b.metrics.avgWaitingTimeSeconds)
                    : "-"
            }
            subtitle={
              deltaWait == null
                ? undefined
                : `${deltaWait >= 0 ? "+" : ""}${deltaWait.toFixed(1)}% (B vs A)`
            }
          />
          <MetricCard
            title="Fila média"
            value={
              a && b
                ? `${formatNumber(a.metrics.avgQueueLength)} → ${formatNumber(b.metrics.avgQueueLength)}`
                : a
                  ? formatNumber(a.metrics.avgQueueLength)
                  : b
                    ? formatNumber(b.metrics.avgQueueLength)
                    : "-"
            }
            subtitle={
              deltaQueue == null
                ? undefined
                : `${deltaQueue >= 0 ? "+" : ""}${deltaQueue.toFixed(1)}% (B vs A)`
            }
          />
          <MetricCard
            title="Veículos concluídos"
            value={
              a && b
                ? `${a.metrics.vehiclesCompleted} → ${b.metrics.vehiclesCompleted}`
                : a
                  ? String(a.metrics.vehiclesCompleted)
                  : b
                    ? String(b.metrics.vehiclesCompleted)
                    : "-"
            }
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <MetricCard
            title="Tempo médio de viagem"
            value={
              a && b
                ? `${formatSeconds(a.metrics.avgTravelTimeSeconds)} → ${formatSeconds(b.metrics.avgTravelTimeSeconds)}`
                : a
                  ? formatSeconds(a.metrics.avgTravelTimeSeconds)
                  : b
                    ? formatSeconds(b.metrics.avgTravelTimeSeconds)
                    : "-"
            }
            tone={aTone === "fixed" || bTone === "fixed" ? "fixed" : "neutral"}
          />
          <MetricCard
            title="Paradas médias"
            value={
              a && b
                ? `${formatNumber(a.metrics.avgStops)} → ${formatNumber(b.metrics.avgStops)}`
                : a
                  ? formatNumber(a.metrics.avgStops)
                  : b
                    ? formatNumber(b.metrics.avgStops)
                    : "-"
            }
            tone={aTone === "rule" || bTone === "rule" ? "rule" : "neutral"}
          />
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <IntersectionSnapshot title="Cruzamento — Lado A" run={a} />
          <IntersectionSnapshot title="Cruzamento — Lado B" run={b} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <RunStateCard title="Estado final — Lado A" run={a} />
          <RunStateCard title="Estado final — Lado B" run={b} />
        </div>

        <div className="mt-6">
          <TimeSeriesChart
            title="Fila total ao longo do tempo"
            pointsA={a?.timeseries}
            pointsB={b?.timeseries}
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <DirectionalQueueChart
            title="Fila por direção — Lado A"
            label={a ? `${strategyLabel(a.meta.strategy)} · ${a.meta.scenario}` : undefined}
            points={a?.timeseries}
          />
          <DirectionalQueueChart
            title="Fila por direção — Lado B"
            label={b ? `${strategyLabel(b.meta.strategy)} · ${b.meta.scenario}` : undefined}
            points={b?.timeseries}
          />
        </div>
      </main>
    </div>
  )
}
