import { ReactNode } from "react"

export function MetricCard(props: {
  title: string
  value: string
  subtitle?: string
  tone?: "neutral" | "fixed" | "rule"
  right?: ReactNode
}) {
  const tone =
    props.tone === "fixed"
      ? "border-amber-500/40 bg-amber-500/5"
      : props.tone === "rule"
        ? "border-cyan-400/40 bg-cyan-400/5"
        : "border-white/10 bg-white/5"

  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-white/60">
            {props.title}
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {props.value}
          </div>
          {props.subtitle ? (
            <div className="mt-1 text-xs text-white/55">{props.subtitle}</div>
          ) : null}
        </div>
        {props.right ? (
          <div className="shrink-0 text-xs text-white/60">{props.right}</div>
        ) : null}
      </div>
    </div>
  )
}
