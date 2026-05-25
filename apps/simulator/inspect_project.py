from __future__ import annotations

import argparse
from pathlib import Path

from simulator.scenario_builder.io import load_project


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_PROJECT_PATH = ROOT / "data" / "projects" / "demo-corridor" / "project.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="Inspect a Traffic Lab project spec.")
    parser.add_argument("--project", default=str(DEFAULT_PROJECT_PATH), help="Path to project.json")
    args = parser.parse_args()

    project_path = Path(args.project).resolve()
    project = load_project(project_path)

    print(f"Project: {project.name} ({project.id})")
    print(f"Source: {project.source}")
    if project.description:
        print(f"Description: {project.description}")
    print()

    if not project.scenarios:
        print("No scenarios found.")
        return 0

    print("Scenarios:")
    for scenario in project.scenarios:
        base = scenario.base_scenario_id or "none"
        print(f"- {scenario.id}: {scenario.name} | base={base} | interventions={len(scenario.interventions)}")
        for intervention in scenario.interventions:
            print(f"  - {intervention.type} -> {intervention.target_id}: {intervention.description or 'no description'}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
