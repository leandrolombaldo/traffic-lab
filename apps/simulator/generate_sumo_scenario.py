from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MANIFEST_DIR = ROOT / "data" / "scenario-manifests"
DEFAULT_TEMPLATE_DIR = ROOT / "apps" / "simulator" / "simulator" / "scenarios" / "intersection_4way"
DEFAULT_SCENARIOS_DIR = ROOT / "apps" / "simulator" / "simulator" / "scenarios"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate a runnable SUMO scenario folder from a scenario manifest."
    )
    parser.add_argument("--manifest", required=True, help="Path to a scenario manifest JSON")
    parser.add_argument(
        "--template-dir",
        default=str(DEFAULT_TEMPLATE_DIR),
        help="Template scenario directory to copy from",
    )
    parser.add_argument(
        "--output-dir",
        default=None,
        help="Output scenario directory. Defaults to simulator/scenarios/<project>__<scenario>",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite output scenario directory when it already exists",
    )
    args = parser.parse_args()

    manifest_path = Path(args.manifest).resolve()
    template_dir = Path(args.template_dir).resolve()

    manifest = _read_json(manifest_path)
    scenario_id = _generated_scenario_id(manifest)

    output_dir = Path(args.output_dir).resolve() if args.output_dir else DEFAULT_SCENARIOS_DIR / scenario_id

    if output_dir.exists():
        if not args.force:
            raise SystemExit(
                f"Output scenario already exists: {output_dir}\n"
                "Use --force to overwrite it."
            )
        shutil.rmtree(output_dir)

    shutil.copytree(template_dir, output_dir)

    scenario_json_path = output_dir / "scenario.json"
    scenario_json = _read_json(scenario_json_path)
    scenario_json["id"] = scenario_id
    scenario_json["projectId"] = manifest["projectId"]
    scenario_json["sourceScenarioId"] = manifest["scenarioId"]
    scenario_json["interventions"] = manifest.get("interventions", [])
    _write_json(scenario_json_path, scenario_json)

    _write_json(output_dir / "applied_interventions.json", manifest)

    print(str(output_dir))
    print()
    print("Next command:")
    print(f"python apps/simulator/main.py --scenario {scenario_id} --strategy fixed --duration 600 --seed 42 --gui")
    return 0


def _generated_scenario_id(manifest: dict[str, Any]) -> str:
    return f"{manifest['projectId']}__{manifest['scenarioId']}"


def _read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    raise SystemExit(main())
