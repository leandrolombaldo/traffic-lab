from __future__ import annotations

import argparse
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SCENARIOS_DIR = ROOT / "apps" / "simulator" / "simulator" / "scenarios"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate a runnable SUMO scenario from a local OpenStreetMap .osm/.osm.xml file."
    )
    parser.add_argument("--osm-file", required=True, help="Path to a local .osm or .osm.xml file")
    parser.add_argument("--scenario-id", required=True, help="Generated scenario id")
    parser.add_argument("--tls-id", default="cluster_0", help="Traffic light id to control later")
    parser.add_argument("--duration", type=int, default=600, help="Default route generation duration")
    parser.add_argument("--vehicles", type=int, default=300, help="Approximate number of random trips")
    parser.add_argument("--force", action="store_true", help="Overwrite generated scenario files")
    args = parser.parse_args()

    osm_file = Path(args.osm_file).resolve()
    if not osm_file.exists():
        raise SystemExit(f"OSM file not found: {osm_file}")

    scenario_dir = DEFAULT_SCENARIOS_DIR / args.scenario_id
    scenario_dir.mkdir(parents=True, exist_ok=True)

    net_file = scenario_dir / "network.net.xml"
    route_file = scenario_dir / "routes.rou.xml"
    sumocfg_file = scenario_dir / "scenario.sumocfg"
    scenario_json_file = scenario_dir / "scenario.json"

    if not args.force:
        existing = [p for p in [net_file, route_file, sumocfg_file, scenario_json_file] if p.exists()]
        if existing:
            files = "\n".join(str(p) for p in existing)
            raise SystemExit(f"Some scenario files already exist. Use --force to overwrite:\n{files}")

    _run(
        [
            "netconvert",
            "--osm-files",
            str(osm_file),
            "--output-file",
            str(net_file),
            "--tls.guess",
            "true",
            "--junctions.join",
            "true",
            "--no-turnarounds",
            "true",
        ]
    )

    _write_sumocfg(sumocfg_file, net_file.name, route_file.name)
    _write_scenario_json(scenario_json_file, args.scenario_id, args.tls_id)

    random_trips = _resolve_random_trips_script()
    if random_trips:
        period = max(args.duration / max(args.vehicles, 1), 1)
        _run(
            [
                "python",
                str(random_trips),
                "-n",
                str(net_file),
                "-r",
                str(route_file),
                "-e",
                str(args.duration),
                "-p",
                str(period),
                "--validate",
            ]
        )
    else:
        _write_empty_routes(route_file)
        print("randomTrips.py not found. Created empty routes file.")
        print("Set SUMO_HOME to generate random routes automatically.")

    print(str(scenario_dir))
    print()
    print("Next command:")
    print(f"python apps/simulator/main.py --scenario {args.scenario_id} --strategy fixed --duration {args.duration} --seed 42 --gui")
    return 0


def _run(cmd: list[str]) -> None:
    print("$ " + " ".join(cmd))
    subprocess.run(cmd, check=True)


def _write_sumocfg(path: Path, net_file: str, route_file: str) -> None:
    path.write_text(
        f'''<configuration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://sumo.dlr.de/xsd/sumoConfiguration.xsd">
    <input>
        <net-file value="{net_file}"/>
        <route-files value="{route_file}"/>
    </input>
    <time>
        <step-length value="1"/>
    </time>
    <processing>
        <time-to-teleport value="-1"/>
    </processing>
</configuration>
''',
        encoding="utf-8",
    )


def _write_scenario_json(path: Path, scenario_id: str, tls_id: str) -> None:
    path.write_text(
        f'''{{
  "id": "{scenario_id}",
  "sumocfg": "scenario.sumocfg",
  "netFile": "network.net.xml",
  "routeFile": "routes.rou.xml",
  "tlsId": "{tls_id}",
  "laneGroups": {{
    "ns": [],
    "ew": []
  }},
  "source": "osm"
}}
''',
        encoding="utf-8",
    )


def _write_empty_routes(path: Path) -> None:
    path.write_text("<routes>\n</routes>\n", encoding="utf-8")


def _resolve_random_trips_script() -> Path | None:
    import os

    sumo_home = os.environ.get("SUMO_HOME")
    if not sumo_home:
        return None

    candidate = Path(sumo_home) / "tools" / "randomTrips.py"
    return candidate if candidate.exists() else None


if __name__ == "__main__":
    raise SystemExit(main())
