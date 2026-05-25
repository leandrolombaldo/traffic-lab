import type { TimeSeriesPoint } from "@/lib/runTypes"

function scaleLinear(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  if (inMax === inMin) return (outMin + outMax) / 2
  const t = (value - inMin) / (inMax - inMin)
  return outMin + t * (outMax - outMin)
}

function toPath(
  points: TimeSeriesPoint[],
  key: "queueNS" | "queueEW",
  tMin: number,
  tMax: number,
  yMax: number,
  w: number,
  h: number,
  pad: number,
) {
  const filtered = points.filter((p) => typeof p[key] === "number")
  if (filtered.length < 2) return ""

  return filtered
    .map((p) => {
      const x = scaleLinear(p.t, tMin, tMax, pad, w - pad)
      const y = scaleLinear(Number(p[key]), 0, yMax, h - pad, pad)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
}

export function DirectionalQueueChart(props: {
  title: string
  points?: TimeSeriesPoint[]
  label?: string
}) {
  const w = 920
  const h = 220
  const pad = 18
  const points = props.points ?? []

  const tMin = points.length ? Math.min(...points.map((p) => p.t)) : 0
  const tMax = points.length ? Math.max(...points.map((p) => p.t)) : 1
  const yMax = points.length
    ? Math.max(1, ...points.map((p) => Math.max(p.queueNS ?? 0, p.queueEW ?? 0)))
    : 1

  const nsPath = toPath(points, "queueNS", tMin, tMax, yMax, w, h, pad)
  const ewPath = toPath(points, "queueEW", tMin, tMax, yMax, w, h, pad)

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/60">
            {props.title}
          </div>
          {props.label ? <div className="mt-1 text-xs text-white/45">{props.label}</div> : null}
        </div>
        <div className="flex items-center gap-3 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            <span>Norte-Sul</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-300" />
            <span>Leste-Oeste</span>
          </div>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-black/30">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-[220px] w-full">
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
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            )
          })}

          {nsPath ? (
            <polyline
              points={nsPath}
              fill="none"
              stroke="rgba(110,231,183,0.95)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}

          {ewPath ? (
            <polyline
              points={ewPath}
              fill="none"
              stroke="rgba(196,181,253,0.95)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-white/45">
        <span>{tMin}s</span>
        <span>máx {yMax}</span>
        <span>{tMax}s</span>
      </div>
    </div>
  )
}
