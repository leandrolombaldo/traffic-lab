export type Strategy = "fixed" | "rule_based" | string

export type RunMeta = {
  id: string
  startedAt: string
  strategy: Strategy
  scenario: string
  seed: number
  durationSeconds: number
}

export type RunMetrics = {
  avgWaitingTimeSeconds: number
  avgQueueLength: number
  maxQueueLength: number
  vehiclesCompleted: number
  avgTravelTimeSeconds: number
  avgStops: number
}

export type VehicleSnapshot = {
  id: string
  laneId: string
  lanePosition: number
  laneLength: number
  speed: number
}

export type TimeSeriesPoint = {
  t: number
  queueLength: number
  queueNS?: number
  queueEW?: number
  avgWaitingTimeSeconds: number
  vehicleCount?: number
  trafficLightPhase?: string | null
  vehicles?: VehicleSnapshot[]
}

export type Run = {
  meta: RunMeta
  metrics: RunMetrics
  timeseries: TimeSeriesPoint[]
}

export type RunSummary = Pick<
  RunMeta,
  "id" | "startedAt" | "strategy" | "scenario" | "seed" | "durationSeconds"
>

