from __future__ import annotations

import argparse
import json
from pathlib import Path

from simulator.scenario_builder.io import load_project
from simulator.scenario_builder.models import ScenarioSpec


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_PROJECT_PATH = ROOT / "data" / "projects" / "demo-corridor" / "project.json"
DEFAULT_OUTPUT_DIR = ROOT / "data" / "scenario-manifests"


def main() -> int:
    parser = argparse.ArgumentParser(description="Build a scenario manifest from a project spec.")
    parser.add_argument("--project", default=str(DEFAULT_PROJECT_PATH), help="Path to project.json")
    parser.add_argument("--scenario", required=True, help="Scenario id to build")
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT_DIR), help="Directory to write manifest JSON")
    args = parser.parse_args()

    project_path = Path(args.project).resolve()
    output_dir = Path(args.output_dir).resolve()

    project = load_project(project_path)
    scenario = _find_scenario(project.scenarios, args.scenario)
    if scenario is None:
        available = ", ".join(s.id for s in project.scenarios) or "none"
        raise SystemExit(f"Scenario '{args.scenario}' not found. Available: {available}")

    manifest = {
        "projectId": project.id,
        "projectName": project.name,
        "scenarioId": scenario.id,
        "scenarioName": scenario.name,
        "baseScenarioId": scenario.base_scenario_id,
        "source": project.source,
        "sourceRef": project.source_ref,
        "interventions": [
            {
                "id": intervention.id,
                "type": intervention.type,
                "targetId": intervention.target_id,
                "description": intervention.description,
                "params": intervention.params,
            }
            for intervention in scenario.interventions
        ],
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{project.id}__{scenario.id}.json"
    output_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print(str(output_path))
    return 0


def _find_scenario(scenarios: list[ScenarioSpec], scenario_id: str) -> ScenarioSpec | None:
    for scenario in scenarios:
        if scenario.id == scenario_id:
            return scenario
    return None


if __name__ == "__main__":
    raise SystemExit(main())
