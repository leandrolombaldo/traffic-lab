from __future__ import annotations

import json
import subprocess
from dataclasses import dataclass
from pathlib import Path

from simulator.utils.sumo import resolve_sumo_binaries


@dataclass(frozen=True)
class Scenario:
    id: str
    dir: Path
    sumocfg: Path
    tls_id: str
    lane_groups: dict[str, list[str]]
    net_file: Path
    route_file: Path
    netconvert_config: Path


def _scenario_dir(scenario_id: str) -> Path:
    return Path(__file__).resolve().parent / scenario_id


def load_scenario(scenario_id: str) -> Scenario:
    sdir = _scenario_dir(scenario_id)
    cfg = json.loads((sdir / "scenario.json").read_text(encoding="utf-8"))

    net_file = sdir / cfg.get("netFile", "intersection_4way.net.xml")
    route_file = sdir / cfg.get("routeFile", "intersection_4way.rou.xml")
    netconvert_config = sdir / cfg.get("netconvertConfig", "intersection_4way.netccfg")
    sumocfg = sdir / cfg["sumocfg"]

    return Scenario(
        id=cfg["id"],
        dir=sdir,
        sumocfg=sumocfg,
        tls_id=cfg["tlsId"],
        lane_groups=cfg["laneGroups"],
        net_file=net_file,
        route_file=route_file,
        netconvert_config=netconvert_config,
    )


def ensure_scenario_assets(scenario: Scenario, demand_vph: int) -> None:
    bins = resolve_sumo_binaries()

    if not scenario.net_file.exists():
        subprocess.run([bins.netconvert, "-c", str(scenario.netconvert_config)], cwd=str(scenario.dir), check=True)

    if not scenario.route_file.exists():
        scenario.route_file.write_text(_default_routes_xml(demand_vph), encoding="utf-8")


def _default_routes_xml(demand_vph: int) -> str:
    return (
        "<routes>\n"
        '    <vType id="car" accel="2.6" decel="4.5" sigma="0.5" length="5" maxSpeed="13.89"/>\n'
        '    <route id="rNS" edges="N2J J2S"/>\n'
        '    <route id="rSN" edges="S2J J2N"/>\n'
        '    <route id="rEW" edges="E2J J2W"/>\n'
        '    <route id="rWE" edges="W2J J2E"/>\n'
        f'    <flow id="fNS" type="car" route="rNS" begin="0" end="3600" vehsPerHour="{demand_vph}"/>\n'
        f'    <flow id="fSN" type="car" route="rSN" begin="0" end="3600" vehsPerHour="{demand_vph}"/>\n'
        f'    <flow id="fEW" type="car" route="rEW" begin="0" end="3600" vehsPerHour="{demand_vph}"/>\n'
        f'    <flow id="fWE" type="car" route="rWE" begin="0" end="3600" vehsPerHour="{demand_vph}"/>\n'
        "</routes>\n"
    )
