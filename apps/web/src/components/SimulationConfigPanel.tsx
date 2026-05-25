"use client"

import { useMemo, useState } from "react"

const SCENARIOS = [
  { value: "intersection_4way", label: "Cruzamento 4 vias" },
  { value: "demo-corridor__baseline", label: "Demo Corridor · baseline" },
]

const STRATEGIES = [
  { value: "fixed", label: "Semáforo fixo" },
  { value: "rule_based", label: "Controle por regra" },
]

function copyToClipboard(value: string) {
  if (typeof navigator === "undefined") return
  void navigator.clipboard.writeText(value)
}

export function SimulationConfigPanel() {
  const [scenario, setScenario] = useState("intersection_4way")
  const [strategy, setStrategy] = useState("fixed")
  const [duration, setDuration] = useState(600)
  const [seed, setSeed] = useState(42)
  const [demandVph, setDemandVph] = useState(600)
  const [gui, setGui] = useState(true)

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

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/60">
            Configuração da simulação
          </div>
          <p className="mt-1 text-sm text-white/45">
            Monte o cenário pelo dashboard e copie o comando para rodar no simulador local.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60">
          MVP 1 · front config
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

      <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-xs uppercase tracking-[0.16em] text-white/45">Comando gerado</div>
          <button
            type="button"
            onClick={() => copyToClipboard(command)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75 hover:bg-white/10"
          >
            copiar
          </button>
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-white/80">{command}</pre>
      </div>

      <p className="mt-3 text-xs text-white/40">
        Próxima evolução: fazer esse painel disparar a simulação por uma API local, sem precisar copiar comando.
      </p>
    </section>
  )
}
