import type { TimeSeriesPoint } from "@/lib/runTypes"

function scaleLinear(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  if (inMax === inMin) return (outMin + outMax) / 2
  const t = (value - inMin) / (inMax - inMin)
  return outMin + t * (outMax - outMin)
}

export function TimeSeriesChart(props: {
  title: string
  pointsA?: TimeSeriesPoint[]
  pointsB?: TimeSeriesPoint[]
}) {
  const w = 920
  const h = 220
  const pad = 18

  const a = props.pointsA ?? []
  const b = props.pointsB ?? []
  const all = [...a, ...b]

  const tMin = all.length ? Math.min(...all.map((p) => p.t)) : 0
  const tMax = all.length ? Math.max(...all.map((p) => p.t)) : 1
  const yMin = 0
  const yMax = all.length ? Math.max(...all.map((p) => p.queueLength)) : 1

  const toPath = (points: TimeSeriesPoint[]) => {
    if (points.length < 2) return ""
    return points
      .map((p) => {
        const x = scaleLinear(p.t, tMin, tMax, pad, w - pad)
        const y = scaleLinear(p.queueLength, yMin, yMax, h - pad, pad)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(" ")
  }

  const pathA = toPath(a)
  const pathB = toPath(b)

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.18em] text-white/60">
          {props.title}
        </div>
        <div className="flex items-center gap-3 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span>Fixo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
            <span>Rule-based</span>
          </div>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-black/30">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-[220px] w-full">
          <defs>
            <linearGradient id="gridFade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="1" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width={w} height={h} fill="transparent" />

          {Array.from({ length: 5 }).map((_, i) => {
            const y = pad + ((h - 2 * pad) * i) / 4
            return (
              <line
                key={i}
                x1={pad}
                x2={w - pad}
                y1={y}
                y2={y}
                stroke="url(#gridFade)"
                strokeWidth="1"
              />
            )
          })}

          {pathA ? (
            <polyline
              points={pathA}
              fill="none"
              stroke="rgba(251,191,36,0.9)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}

          {pathB ? (
            <polyline
              points={pathB}
              fill="none"
              stroke="rgba(103,232,249,0.9)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-white/45">
        <span>{tMin}s</span>
        <span>{tMax}s</span>
      </div>
    </div>
  )
}
