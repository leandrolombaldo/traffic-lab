import { promises as fs } from "node:fs"
import path from "node:path"
import { cache } from "react"

import type { Run, RunSummary } from "@/lib/runTypes"

function runsDir() {
  return path.resolve(process.cwd(), "..", "..", "data", "runs")
}

function isJsonFile(name: string) {
  return name.toLowerCase().endsWith(".json")
}

export const listRuns = cache(async (): Promise<RunSummary[]> => {
  const dir = runsDir()
  let entries: string[]
  try {
    entries = await fs.readdir(dir)
  } catch {
    return []
  }

  const files = entries.filter(isJsonFile)
  const summaries: RunSummary[] = []

  for (const file of files) {
    const full = path.join(dir, file)
    try {
      const raw = await fs.readFile(full, "utf-8")
      const parsed = JSON.parse(raw) as Run
      summaries.push({
        id: parsed.meta.id,
        startedAt: parsed.meta.startedAt,
        strategy: parsed.meta.strategy,
        scenario: parsed.meta.scenario,
        seed: parsed.meta.seed,
        durationSeconds: parsed.meta.durationSeconds,
      })
    } catch {
      continue
    }
  }

  summaries.sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  return summaries
})

export const readRun = cache(async (id: string): Promise<Run | null> => {
  const file = path.join(runsDir(), `${id}.json`)
  try {
    const raw = await fs.readFile(file, "utf-8")
    return JSON.parse(raw) as Run
  } catch {
    return null
  }
})

export async function defaultComparePair() {
  const runs = await listRuns()
  const fixed = runs.find((r) => r.strategy === "fixed")
  const rule = runs.find((r) => r.strategy === "rule_based")
  return { fixedId: fixed?.id ?? null, ruleId: rule?.id ?? null }
}
