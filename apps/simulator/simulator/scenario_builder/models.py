from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal


InterventionType = Literal[
    "change_speed_limit",
    "change_lane_count",
    "change_direction",
    "restrict_turn",
    "signal_timing",
    "bus_lane",
    "close_edge",
]


@dataclass(frozen=True)
class InterventionSpec:
    """
    Descreve uma alteração planejada em uma rede viária.

    Esta fundação ainda não aplica a intervenção na rede SUMO. Ela apenas
    cria um contrato estável para que o builder consiga evoluir depois.
    """

    id: str
    type: InterventionType
    target_id: str
    params: dict[str, Any] = field(default_factory=dict)
    description: str | None = None


@dataclass(frozen=True)
class ScenarioSpec:
    """
    Representa uma versão simulável de um projeto urbano.

    Exemplo:
    - baseline
    - sem_conversao_esquerda
    - onda_verde_40kmh
    """

    id: str
    name: str
    base_scenario_id: str | None = None
    interventions: list[InterventionSpec] = field(default_factory=list)
    notes: str | None = None


@dataclass(frozen=True)
class ProjectSpec:
    """
    Representa uma área de estudo.

    No futuro, este modelo poderá referenciar uma região OSM, bounding box,
    arquivo .osm, rede SUMO gerada e parâmetros de demanda.
    """

    id: str
    name: str
    description: str | None = None
    source: str = "manual"
    source_ref: str | None = None
    scenarios: list[ScenarioSpec] = field(default_factory=list)


def project_to_dict(project: ProjectSpec) -> dict[str, Any]:
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "source": project.source,
        "sourceRef": project.source_ref,
        "scenarios": [
            {
                "id": scenario.id,
                "name": scenario.name,
                "baseScenarioId": scenario.base_scenario_id,
                "notes": scenario.notes,
                "interventions": [
                    {
                        "id": intervention.id,
                        "type": intervention.type,
                        "targetId": intervention.target_id,
                        "params": intervention.params,
                        "description": intervention.description,
                    }
                    for intervention in scenario.interventions
                ],
            }
            for scenario in project.scenarios
        ],
    }
