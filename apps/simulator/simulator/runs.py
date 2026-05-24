from __future__ import annotations

import json
import time
import uuid
from dataclasses import asdict, dataclass
from pathlib import Path

from simulator.metrics.collector import MetricsResult


@dataclass(frozen=True)
class RunMeta:
    id: str
    startedAt: str
    strategy: str
    scenario: str
    seed: int
    durationSeconds: int


def write_run(
    *,
    output_dir: Path,
    meta: RunMeta,
    metrics: MetricsResult,
    timeseries: list[dict[str, float | int]],
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    run_path = output_dir / f"{meta.id}.json"
    payload = {
        "meta": asdict(meta),
        "metrics": {
            "avgWaitingTimeSeconds": metrics.avg_waiting_time_s,
            "avgQueueLength": metrics.avg_queue_length,
            "maxQueueLength": metrics.max_queue_length,
            "vehiclesCompleted": metrics.vehicles_completed,
            "avgTravelTimeSeconds": metrics.avg_travel_time_s,
            "avgStops": metrics.avg_stops,
        },
        "timeseries": timeseries,
    }
    run_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return run_path


def new_run_meta(*, strategy: str, scenario: str, seed: int, duration_seconds: int) -> RunMeta:
    started_at = time.strftime("%Y-%m-%dT%H:%M:%S%z")
    rid = f"{time.strftime('%Y%m%d_%H%M%S')}_{strategy}_{uuid.uuid4().hex[:8]}"
    return RunMeta(
        id=rid,
        startedAt=started_at,
        strategy=strategy,
        scenario=scenario,
        seed=seed,
        durationSeconds=duration_seconds,
    )

