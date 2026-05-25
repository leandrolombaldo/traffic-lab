import { spawn } from "node:child_process"
import path from "node:path"

import { NextResponse } from "next/server"

export const runtime = "nodejs"

type RunSimulationPayload = {
  scenario?: string
  strategy?: string
  duration?: number
  seed?: number
  demandVph?: number
  gui?: boolean
}

const ALLOWED_STRATEGIES = new Set(["fixed", "rule_based"])

export async function POST(request: Request) {
  const payload = (await request.json()) as RunSimulationPayload

  const scenario = sanitizeScenario(payload.scenario ?? "intersection_4way")
  const strategy = payload.strategy ?? "fixed"
  const duration = clampNumber(payload.duration ?? 600, 60, 7200)
  const seed = clampNumber(payload.seed ?? 42, 0, 999999)
  const demandVph = clampNumber(payload.demandVph ?? 600, 1, 10000)
  const gui = Boolean(payload.gui)

  if (!ALLOWED_STRATEGIES.has(strategy)) {
    return NextResponse.json(
      { ok: false, error: `Estratégia inválida: ${strategy}` },
      { status: 400 },
    )
  }

  if (!scenario) {
    return NextResponse.json(
      { ok: false, error: "Cenário inválido." },
      { status: 400 },
    )
  }

  const repoRoot = path.resolve(process.cwd(), "..", "..")
  const simulatorScript = path.join(repoRoot, "apps", "simulator", "main.py")

  const args = [
    simulatorScript,
    "--scenario",
    scenario,
    "--strategy",
    strategy,
    "--duration",
    String(duration),
    "--seed",
    String(seed),
    "--demand-vph",
    String(demandVph),
  ]

  if (gui) args.push("--gui")

  const result = await runProcess(resolvePythonCommand(), args, repoRoot)

  if (result.code !== 0) {
    return NextResponse.json(
      {
        ok: false,
        command: `python ${args.join(" ")}`,
        code: result.code,
        stdout: result.stdout,
        stderr: result.stderr,
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    ok: true,
    command: `python ${args.join(" ")}`,
    stdout: result.stdout,
    stderr: result.stderr,
    runPath: extractRunPath(result.stdout),
  })
}

function sanitizeScenario(value: string) {
  if (!/^[a-zA-Z0-9_-]+(__[a-zA-Z0-9_-]+)?$/.test(value)) return null
  return value
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.max(min, Math.min(max, Math.trunc(value)))
}

function resolvePythonCommand() {
  return process.platform === "win32" ? "python.exe" : "python"
}

function runProcess(command: string, args: string[], cwd: string) {
  return new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve) => {
    const child = spawn(command, args, { cwd, shell: false })
    let stdout = ""
    let stderr = ""

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk)
    })

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk)
    })

    child.on("error", (error) => {
      stderr += error.message
      resolve({ code: 1, stdout, stderr })
    })

    child.on("close", (code) => {
      resolve({ code, stdout, stderr })
    })
  })
}

function extractRunPath(stdout: string) {
  const lines = stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  return lines.find((line) => line.endsWith(".json")) ?? null
}
