"use client"

import { useEffect, useMemo, useState } from "react"

import type { Run, TimeSeriesPoint, VehicleSnapshot } from "@/lib/runTypes"
import { strategyLabel } from "@/lib/strategy"

function phaseLabel(phase?: string | null) {
  if (!phase) return "fase desconhecida"
  if (phase.startsWith("0")) return "Norte-Sul verde"
  if (phase.startsWith("1")) return "Norte-Sul amarelo"
  if (phase.startsWith("2")) return "Leste-Oeste verde"
  if (phase.startsWith("3")) return "Leste-Oeste amarelo"
  return phase
}

function queueDots(count: number | undefined, max = 5) {
  const safe = Math.max(0, Math.min(max, Math.ceil((count ?? 0) / 10)))
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
      typeof point.trafficLightPhase === "string" ||
      Boolean(point.vehicles?.length),
  )
}

function vehicleTransform(vehicle: VehicleSnapshot) {
  const laneId = vehicle.laneId
  const p = vehicle.laneLength > 0 ? Math.max(0, Math.min(1, vehicle.lanePosition / vehicle.laneLength)) : 0

  const top = 36
  const bottom = 318
  const left = 36
  const right = 318
  const centerA = 150
  const centerB = 210

  if (laneId.startsWith("N2J")) return { x: 190, y: top + (centerA - top) * p, rotate: 90 }
  if (laneId.startsWith("J2S")) return { x: 170, y: centerB + (bottom - centerB) * p, rotate: 90 }

  if (laneId.startsWith("S2J")) return { x: 170, y: bottom - (bottom - centerB) * p, rotate: -90 }
  if (laneId.startsWith("J2N")) return { x: 190, y: centerA - (centerA - top) * p, rotate: -90 }

  if (laneId.startsWith("W2J")) return { x: left + (centerA - left) * p, y: 190, rotate: 0 }
  if (laneId.startsWith("J2E")) return { x: centerB + (right - centerB) * p, y: 170, rotate: 0 }

  if (laneId.startsWith("E2J")) return { x: right - (right - centerB) * p, y: 170, rotate: 180 }
  if (laneId.startsWith("J2W")) return { x: centerA - (centerA - left) * p, y: 190, rotate: 180 }

  return null
}

function vehicleTone(vehicle: VehicleSnapshot) {
  if (vehicle.speed < 0.1) return "bg-amber-300"
  if (vehicle.laneId.includes("N") || vehicle.laneId.includes("S")) return "bg-emerald-300"
  return "bg-violet-300"
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
  const vehicles = point?.vehicles ?? []
  const hasVehicles = vehicles.length > 0

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

      {hasVisualData && !hasVehicles ? (
        <div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-xs text-cyan-100">
          Este run ainda não tem snapshots de veículos. Rode uma nova simulação após o último update para ver carrinhos se movendo.
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_240px]">
        <div className="relative h-[360px] overflow-hidden rounded-xl border border-white/10 bg-black/30">
          <div className="absolute left-1/2 top-0 h-full w-16 -translate-x-1/2 bg-white/10" />
          <div className="absolute left-0 top-1/2 h-16 w-full -translate-y-1/2 bg-white/10" />
          <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-black/70" />

          <div className="absolute left-1/2 top-5 -translate-x-1/2 text-xs font-medium text-white/60">Norte</div>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium text-white/60">Sul</div>
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-medium text-white/60">Oeste</div>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-medium text-white/60">Leste</div>

          <div className="absolute left-[calc(50%-48px)] top-[calc(50%-48px)] h-4 w-4 rounded-full border border-white/20 bg-black" />
          <div className={`absolute left-[calc(50%-45px)] top-[calc(50%-45px)] h-2.5 w-2.5 rounded-full ${isNsActive ? "bg-emerald-300" : "bg-red-400"}`} />

          <div className="absolute right-[calc(50%-48px)] bottom-[calc(50%-48px)] h-4 w-4 rounded-full border border-white/20 bg-black" />
          <div className={`absolute right-[calc(50%-45px)] bottom-[calc(50%-45px)] h-2.5 w-2.5 rounded-full ${isEwActive ? "bg-emerald-300" : "bg-red-400"}`} />

          {hasVehicles
            ? vehicles.slice(0, 80).map((vehicle) => {
                const transform = vehicleTransform(vehicle)
                if (!transform) return null

                return (
                  <div
                    key={vehicle.id}
                    className={`absolute h-3.5 w-6 rounded-[4px] shadow-sm shadow-black/40 ${vehicleTone(vehicle)}`}
                    style={{
                      left: transform.x,
                      top: transform.y,
                      transform: `translate(-50%, -50%) rotate(${transform.rotate}deg)`,
                      opacity: vehicle.speed < 0.1 ? 0.75 : 0.95,
                    }}
                    title={`${vehicle.id} · ${vehicle.laneId} · ${vehicle.speed.toFixed(1)}m/s`}
                  />
                )
              })
            : (
              <>
                <div className="absolute left-[calc(50%+14px)] top-20 flex flex-col-reverse gap-1">
                  {queueDots(nsQueue).map((_, i) => (
                    <div key={`n-${i}`} className="h-5 w-6 rounded-sm bg-emerald-300/70" />
                  ))}
                </div>

                <div className="absolute bottom-20 right-[calc(50%+14px)] flex flex-col gap-1 opacity-50">
                  {queueDots(nsQueue).map((_, i) => (
                    <div key={`s-${i}`} className="h-5 w-6 rounded-sm bg-emerald-300/60" />
                  ))}
                </div>

                <div className="absolute left-20 top-[calc(50%+14px)] flex gap-1">
                  {queueDots(ewQueue).map((_, i) => (
                    <div key={`w-${i}`} className="h-6 w-5 rounded-sm bg-violet-300/70" />
                  ))}
                </div>

                <div className="absolute right-20 bottom-[calc(50%+14px)] flex flex-row-reverse gap-1 opacity-50">
                  {queueDots(ewQueue).map((_, i) => (
                    <div key={`e-${i}`} className="h-6 w-5 rounded-sm bg-violet-300/60" />
                  ))}
                </div>
              </>
            )}

          <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-white/60">
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
