"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const SCENARIOS = [
  { value: "intersection_4way", label: "Cruzamento 4 vias" },
  { value: "demo-corridor__baseline", label: "Demo Corridor · baseline" },
]

const STRATEGIES = [
  { value: "fixed", label: "Semáforo fixo" },
  { value: "rule_based", label: "Controle por regra" },
]

type RunStatus =
  | { state: "idle" }
  | { state: "running" }
  | { state: "success"; message: string; runPath?: string | null }
  | { state: "error"; message: string }

function copyToClipboard(value: string) {
  if (typeof navigator === "undefined") return
  void navigator.clipboard.writeText(value)
}

function runIdFromPath(path?: string | null) {
  if (!path) return null
  const normalized = path.replaceAll("\\", "/")
  const filename = normalized.split("/").pop()
  return filename?.replace(/\.json$/, "") ?? null
}

export function SimulationConfigPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [scenario, setScenario] = useState("intersection_4way")
  const [strategy, setStrategy] = useState("fixed")
  const [duration, setDuration] = useState(600)
  const [seed, setSeed] = useState(42)
  const [demandVph, setDemandVph] = useState(600)
  const [gui, setGui] = useState(false)
  const [status, setStatus] = useState<RunStatus>({ state: "idle" })

  const command = useMemo(() => {
    const parts = [
      "python apps/simulator/main.py",
      `--scenario ${scenario}`,
      `--strategy ${strategy}`,
      `--duration ${duration}`,
      `--seed ${seed}`,
      `--demand-vph ${demandVph}`,
    ]

    if (gui) parts.push("--gui")

    return parts.join(" ")
  }, [demandVph, duration, gui, scenario, seed, strategy])

  async function runSimulation() {
    setStatus({ state: "running" })

    try {
      const response = await fetch("/api/simulations/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, strategy, duration, seed, demandVph, gui }),
      })

      const payload = await response.json()

      if (!response.ok || !payload.ok) {
        const details = [payload.error, payload.stderr, payload.stdout].filter(Boolean).join("\n")
        setStatus({ state: "error", message: details || "Falha ao rodar simulação." })
        return
      }

      const runId = runIdFromPath(payload.runPath)
      setStatus({
        state: "success",
        message: runId
          ? "Simulação finalizada. O novo run foi selecionado no comparativo."
          : "Simulação finalizada. Atualize a página ou abra Runs para ver o novo resultado.",
        runPath: payload.runPath,
      })

      if (runId) {
        selectNewRun(runId)
      }
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Erro inesperado ao rodar simulação.",
      })
    }
  }

  function selectNewRun(runId: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (strategy === "fixed") {
      params.set("a", runId)
    } else {
      params.set("b", runId)
    }

    router.push(`/?${params.toString()}`)
    router.refresh()
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/60">
            Configuração da simulação
          </div>
          <p className="mt-1 text-sm text-white/45">
            Monte o cenário pelo dashboard e rode a simulação local direto pelo front.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60">
          MVP 1 · front runner
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/45">Cenário</span>
          <select
            value={scenario}
            onChange={(event) => setScenario(event.target.value)}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
          >
            {SCENARIOS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/45">Estratégia</span>
          <select
            value={strategy}
            onChange={(event) => setStrategy(event.target.value)}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
          >
            {STRATEGIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/45">Duração</span>
          <input
            type="number"
            min={60}
            step={60}
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/45">Seed</span>
          <input
            type="number"
            value={seed}
            onChange={(event) => setSeed(Number(event.target.value))}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/45">Demanda veh/h</span>
          <input
            type="number"
            min={1}
            step={50}
            value={demandVph}
            onChange={(event) => setDemandVph(Number(event.target.value))}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
          />
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/75">
          <input
            type="checkbox"
            checked={gui}
            onChange={(event) => setGui(event.target.checked)}
          />
          Abrir SUMO GUI
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runSimulation}
          disabled={status.state === "running"}
          className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status.state === "running" ? "Rodando simulação..." : "Rodar simulação"}
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 hover:bg-white/10"
        >
          atualizar resultados
        </button>
        <button
          type="button"
          onClick={() => copyToClipboard(command)}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 hover:bg-white/10"
        >
          copiar comando
        </button>
      </div>

      {status.state !== "idle" ? (
        <div
          className={`mt-4 rounded-xl border p-4 text-sm whitespace-pre-wrap ${
            status.state === "error"
              ? "border-red-400/20 bg-red-400/10 text-red-100"
              : status.state === "success"
                ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                : "border-white/10 bg-black/30 text-white/70"
          }`}
        >
          {status.state === "running" ? "Executando o SUMO localmente..." : status.message}
          {status.state === "success" && status.runPath ? `\n${status.runPath}` : ""}
        </div>
      ) : null}

      <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-xs uppercase tracking-[0.16em] text-white/45">Comando gerado</div>
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-white/80">{command}</pre>
      </div>

      <p className="mt-3 text-xs text-white/40">
        Observação: o front precisa estar rodando localmente e o SUMO precisa estar instalado/configurado no computador.
      </p>
    </section>
  )
}
