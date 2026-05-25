from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from simulator.scenario_builder.models import (
    InterventionSpec,
    ProjectSpec,
    ScenarioSpec,
    project_to_dict,
)


def save_project(project: ProjectSpec, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = project_to_dict(project)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def load_project(path: Path) -> ProjectSpec:
    raw = json.loads(path.read_text(encoding="utf-8"))
    return project_from_dict(raw)


def project_from_dict(raw: dict[str, Any]) -> ProjectSpec:
    scenarios = [
        ScenarioSpec(
            id=scenario["id"],
            name=scenario["name"],
            base_scenario_id=scenario.get("baseScenarioId"),
            notes=scenario.get("notes"),
            interventions=[
                InterventionSpec(
                    id=intervention["id"],
                    type=intervention["type"],
                    target_id=intervention["targetId"],
                    params=intervention.get("params", {}),
                    description=intervention.get("description"),
                )
                for intervention in scenario.get("interventions", [])
            ],
        )
        for scenario in raw.get("scenarios", [])
    ]

    return ProjectSpec(
        id=raw["id"],
        name=raw["name"],
        description=raw.get("description"),
        source=raw.get("source", "manual"),
        source_ref=raw.get("sourceRef"),
        scenarios=scenarios,
    )
