from __future__ import annotations

import argparse
from pathlib import Path

import traci

from simulator.controllers.base import ControllerConfig
from simulator.controllers.fixed import FixedController
from simulator.controllers.rule_based import RuleBasedController
from simulator.metrics.collector import MetricsCollector
from simulator.runs import new_run_meta, write_run
from simulator.scenarios.registry import ensure_scenario_assets, load_scenario
from simulator.utils.sumo import resolve_sumo_binaries


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scenario", default="intersection_4way")
    parser.add_argument("--strategy", choices=["fixed", "rule_based"], default="fixed")
    parser.add_argument("--duration", type=int, default=600)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--gui", action="store_true")
    parser.add_argument("--demand-vph", type=int, default=600)
    args = parser.parse_args()

    scenario = load_scenario(args.scenario)
    ensure_scenario_assets(scenario, demand_vph=args.demand_vph)

    bins = resolve_sumo_binaries()
    sumo_binary = bins.sumo_gui if args.gui else bins.sumo

    cmd = [
        sumo_binary,
        "-c",
        str(scenario.sumocfg),
        "--seed",
        str(args.seed),
        "--start",
        "--quit-on-end",
        "--no-step-log",
        "true",
    ]

    traci.start(cmd, cwd=str(scenario.dir))

    controller = _build_controller(args.strategy, scenario)
    metrics = MetricsCollector()

    controller.on_start()
    for t in range(args.duration):
        traci.simulationStep()
        controller.step(t)
        metrics.step(t)
        if t >= 30 and traci.simulation.getMinExpectedNumber() == 0:
            break

    controller.on_finish()
    traci.close()

    root = Path(__file__).resolve().parents[2]
    output_dir = root / "data" / "runs"

    meta = new_run_meta(
        strategy=args.strategy,
        scenario=scenario.id,
        seed=args.seed,
        duration_seconds=args.duration,
    )
    run_path = write_run(
        output_dir=output_dir,
        meta=meta,
        metrics=metrics.result(),
        timeseries=metrics.timeseries,
    )

    print(str(run_path))
    return 0


def _build_controller(strategy: str, scenario) -> object:
    cfg = ControllerConfig(strategy=strategy)
    if strategy == "rule_based":
        return RuleBasedController(cfg, tls_id=scenario.tls_id, lane_groups=scenario.lane_groups)
    return FixedController(cfg)


if __name__ == "__main__":
    raise SystemExit(main())

