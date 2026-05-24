import { NextResponse, type NextRequest } from "next/server"

import { readRun } from "@/lib/runsFs"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const run = await readRun(id)
  if (!run) return NextResponse.json({ error: "not_found" }, { status: 404 })
  return NextResponse.json(run)
}
