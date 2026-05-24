import type { Strategy } from "@/lib/runTypes"

export function strategyLabel(strategy: Strategy) {
  if (strategy === "fixed") return "Fixo"
  if (strategy === "rule_based") return "Rule-based"
  return String(strategy)
}

