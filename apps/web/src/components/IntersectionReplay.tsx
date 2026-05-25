"use client"

import { useEffect, useMemo, useState } from "react"

import type { Run, TimeSeriesPoint } from "@/lib/runTypes"
import { strategyLabel } from "@/lib/strategy"

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

function clampIndex(index: number, points: TimeSeriesPoint[]) {
  if (!points.length) return 0
  return Math.max(0, Math.min(points.length - 1, index))
}

function hasReplayVisualData(points: TimeSeriesPoint[]) {
  return points.some(
    (point) =>
      typeof point.queueNS === "number" ||
      typeof point.queueEW === "number" ||
      typeof point.vehicleCount === "number" ||
      typeof point.trafficLightPhase === "string",
  )
}

export function IntersectionReplay(props: { title: string; run: Run | null }) {
  const points = useMemo(() => props.run?.timeseries ?? [], [props.run])
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  const currentIndex = clampIndex(index, points)
  const point = points[currentIndex]
  const nsQueue = point?.queueNS ?? 0
  const ewQueue = point?.queueEW ?? 0
  const phase = phaseLabel(point?.trafficLightPhase)
  const isNsActive = point?.trafficLightPhase?.startsWith("0") || point?.trafficLightPhase?.startsWith("1")
  const isEwActive = point?.trafficLightPhase?.startsWith("2") || point?.trafficLightPhase?.startsWith("3")
  const hasVisualData = hasReplayVisualData(points)

  useEffect(() => {
    setIndex(0)
    setIsPlaying(false)
  }, [props.run?.meta.id])

  useEffect(() => {
    if (!isPlaying || points.length < 2) return

    const intervalMs = Math.max(80, 500 / speed)
    const interval = window.setInterval(() => {
      setIndex((value) => {
        if (value >= points.length - 1) {
          window.clearInterval(interval)
          setIsPlaying(false)
          return points.length - 1
        }
        return value + 1
      })
    }, intervalMs)

    return () => window.clearInterval(interval)
  }, [isPlaying, points.length, speed])

  function step(delta: number) {
    setIndex((value) => clampIndex(value + delta, points))
  }

  function reset() {
    setIndex(0)
    setIsPlaying(false)
  }

  function toEnd() {
    setIndex(points.length ? points.length - 1 : 0)
    setIsPlaying(false)
  }

  function togglePlay() {
    if (!points.length) return
    if (currentIndex >= points.length - 1) {
      setIndex(0)
    }
    setIsPlaying((value) => !value)
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
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

      {!hasVisualData && props.run ? (
        <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs text-amber-100">
          Este run não tem dados visuais de replay. Rode uma nova simulação pelo painel acima para gerar queueNS, queueEW, vehicleCount e trafficLightPhase.
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_240px]">
        <div className="relative h-[360px] overflow-hidden rounded-xl border border-white/10 bg-black/30">
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
            t={point?.t ?? 0}s · amostra {points.length ? currentIndex + 1 : 0}/{points.length}
          </div>
        </div>

        <div className="grid content-start gap-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/45">Tempo</div>
            <div className="mt-2 text-3xl font-semibold text-white">{point?.t ?? 0}s</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-white/45">Fila NS</div>
              <div className="mt-2 text-2xl font-semibold text-white">{hasVisualData ? nsQueue : "-"}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-white/45">Fila EW</div>
              <div className="mt-2 text-2xl font-semibold text-white">{hasVisualData ? ewQueue : "-"}</div>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/45">Veículos ativos</div>
            <div className="mt-2 text-3xl font-semibold text-white">{point?.vehicleCount ?? "-"}</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <button type="button" onClick={togglePlay} disabled={!points.length} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">
                {isPlaying ? "pausar" : "play"}
              </button>
              <label className="flex items-center gap-2 text-xs text-white/55">
                velocidade
                <select
                  value={speed}
                  onChange={(event) => setSpeed(Number(event.target.value))}
                  className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-white outline-none"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs text-white/45">
              <span>Início</span>
              <span>Fim</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0, points.length - 1)}
              value={currentIndex}
              onChange={(event) => {
                setIsPlaying(false)
                setIndex(Number(event.target.value))
              }}
              className="mt-3 w-full"
              disabled={!points.length}
            />
            <div className="mt-3 grid grid-cols-4 gap-2">
              <button type="button" onClick={reset} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white/75 hover:bg-white/10">
                início
              </button>
              <button type="button" onClick={() => step(-5)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white/75 hover:bg-white/10">
                -5
              </button>
              <button type="button" onClick={() => step(5)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white/75 hover:bg-white/10">
                +5
              </button>
              <button type="button" onClick={toEnd} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white/75 hover:bg-white/10">
                fim
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
