from __future__ import annotations

from dataclasses import dataclass

import traci

from simulator.controllers.base import Controller, ControllerConfig


@dataclass(frozen=True)
class RuleBasedParams:
    min_green_s: int = 10
    max_green_s: int = 60
    yellow_s: int = 3
    queue_threshold: int = 2


class RuleBasedController(Controller):
    def __init__(
        self,
        config: ControllerConfig,
        *,
        tls_id: str,
        lane_groups: dict[str, list[str]],
        params: RuleBasedParams | None = None,
    ):
        self.config = config
        self.tls_id = tls_id
        self.lane_groups = lane_groups
        self.params = params or RuleBasedParams()
        self.mode: str = "green_ns"
        self.phase_time: int = 0

    def on_start(self) -> None:
        self.mode = "green_ns"
        self.phase_time = 0
        traci.trafficlight.setPhase(self.tls_id, 0)
        traci.trafficlight.setPhaseDuration(self.tls_id, 9999)

    def step(self, t: int) -> None:
        self.phase_time += 1

        if self.mode == "green_ns":
            q = _queue(self.lane_groups.get("ns", []))
            if self.phase_time >= self.params.min_green_s and (
                q <= self.params.queue_threshold or self.phase_time >= self.params.max_green_s
            ):
                self.mode = "yellow_ns"
                self.phase_time = 0
                traci.trafficlight.setPhase(self.tls_id, 1)
                traci.trafficlight.setPhaseDuration(self.tls_id, 9999)
            return None

        if self.mode == "yellow_ns":
            if self.phase_time >= self.params.yellow_s:
                self.mode = "green_ew"
                self.phase_time = 0
                traci.trafficlight.setPhase(self.tls_id, 2)
                traci.trafficlight.setPhaseDuration(self.tls_id, 9999)
            return None

        if self.mode == "green_ew":
            q = _queue(self.lane_groups.get("ew", []))
            if self.phase_time >= self.params.min_green_s and (
                q <= self.params.queue_threshold or self.phase_time >= self.params.max_green_s
            ):
                self.mode = "yellow_ew"
                self.phase_time = 0
                traci.trafficlight.setPhase(self.tls_id, 3)
                traci.trafficlight.setPhaseDuration(self.tls_id, 9999)
            return None

        if self.mode == "yellow_ew":
            if self.phase_time >= self.params.yellow_s:
                self.mode = "green_ns"
                self.phase_time = 0
                traci.trafficlight.setPhase(self.tls_id, 0)
                traci.trafficlight.setPhaseDuration(self.tls_id, 9999)
            return None


def _queue(lanes: list[str]) -> int:
    total = 0
    for lane_id in lanes:
        try:
            total += int(traci.lane.getLastStepHaltingNumber(lane_id))
        except traci.TraCIException:
            continue
    return total

