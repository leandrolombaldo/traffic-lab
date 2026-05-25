import { CompareDashboard } from "@/components/CompareDashboard"
import { defaultComparePair, listRuns, readRun } from "@/lib/runsFs"

type PageSearchParams = Promise<{ a?: string; b?: string }>

export default async function Page(props: { searchParams?: PageSearchParams }) {
  const runs = await listRuns()
  const defaults = await defaultComparePair()
  const searchParams = props.searchParams ? await props.searchParams : {}

  const aId = searchParams.a ?? defaults.fixedId
  const bId = searchParams.b ?? defaults.ruleId

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
