import { CompareDashboard } from "@/components/CompareDashboard"
import { defaultComparePair, listRuns, readRun } from "@/lib/runsFs"

export default async function Page(props: {
  searchParams?: { a?: string; b?: string }
}) {
  const runs = await listRuns()
  const defaults = await defaultComparePair()

  const aId = props.searchParams?.a ?? defaults.fixedId
  const bId = props.searchParams?.b ?? defaults.ruleId

  const a = aId ? await readRun(aId) : null
  const b = bId ? await readRun(bId) : null

  return (
    <CompareDashboard
      runs={runs}
      a={a}
      b={b}
      aId={aId}
      bId={bId}
    />
  )
}
