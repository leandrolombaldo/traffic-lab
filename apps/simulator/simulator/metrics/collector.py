from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import traci


@dataclass
class MetricsResult:
    avg_waiting_time_s: float
    avg_queue_length: float
    max_queue_length: int
    vehicles_completed: int
    avg_travel_time_s: float
    avg_stops: float


class MetricsCollector:
    def __init__(self, *, tls_id: str | None = None, lane_groups: dict[str, list[str]] | None = None):
        self.tls_id = tls_id
        self.lane_groups = lane_groups or {}

        self._t = 0
        self._queue_sum = 0.0
        self._queue_max = 0
        self._queue_samples = 0

        self._veh_depart_time: dict[str, int] = {}
        self._veh_wait_accumulated: dict[str, float] = {}
        self._veh_last_wait: dict[str, float] = {}
        self._veh_stop_count: dict[str, int] = {}
        self._veh_was_stopped: dict[str, bool] = {}

        self._arrived_wait_sum = 0.0
        self._arrived_travel_sum = 0.0
        self._arrived_stop_sum = 0.0
        self._arrived_count = 0

        self.timeseries: list[dict[str, Any]] = []

    def step(self, t: int) -> None:
        self._t = t

        for vid in traci.simulation.getDepartedIDList():
            self._veh_depart_time[vid] = t
            self._veh_wait_accumulated[vid] = 0.0
            self._veh_last_wait[vid] = 0.0
            self._veh_stop_count.setdefault(vid, 0)
            self._veh_was_stopped[vid] = False

        vehicle_ids = traci.vehicle.getIDList()
        wait_sum = 0.0
        for vid in vehicle_ids:
            current_wait = float(traci.vehicle.getWaitingTime(vid))
            previous_wait = self._veh_last_wait.get(vid, 0.0)

            increment = max(0.0, current_wait - previous_wait)
            self._veh_wait_accumulated[vid] = self._veh_wait_accumulated.get(vid, 0.0) + increment
            self._veh_last_wait[vid] = current_wait
            wait_sum += current_wait

            speed = float(traci.vehicle.getSpeed(vid))
            stopped = speed < 0.1
            was_stopped = self._veh_was_stopped.get(vid, False)
            if stopped and not was_stopped:
                self._veh_stop_count[vid] = self._veh_stop_count.get(vid, 0) + 1
            self._veh_was_stopped[vid] = stopped

        avg_wait = wait_sum / len(vehicle_ids) if vehicle_ids else 0.0

        lanes = [lid for lid in traci.lane.getIDList() if not lid.startswith(":" )]
        q_total = _queue(lanes)
        q_ns = _queue(self.lane_groups.get("ns", []))
        q_ew = _queue(self.lane_groups.get("ew", []))

        self._queue_sum += q_total
        self._queue_samples += 1
        self._queue_max = max(self._queue_max, q_total)

        self.timeseries.append(
            {
                "t": int(t),
                "queueLength": int(q_total),
                "queueNS": int(q_ns),
                "queueEW": int(q_ew),
                "avgWaitingTimeSeconds": float(avg_wait),
                "vehicleCount": int(len(vehicle_ids)),
                "trafficLightPhase": _traffic_light_phase(self.tls_id),
                "vehicles": _vehicle_snapshots(vehicle_ids),
            }
        )

        for vid in traci.simulation.getArrivedIDList():
            dep = self._veh_depart_time.get(vid)
            if dep is None:
                continue
            travel = t - dep
            self._arrived_travel_sum += float(travel)
            self._arrived_wait_sum += float(self._veh_wait_accumulated.get(vid, 0.0))
            self._arrived_stop_sum += float(self._veh_stop_count.get(vid, 0))
            self._arrived_count += 1

            self._veh_depart_time.pop(vid, None)
            self._veh_wait_accumulated.pop(vid, None)
            self._veh_last_wait.pop(vid, None)
            self._veh_stop_count.pop(vid, None)
            self._veh_was_stopped.pop(vid, None)

    def result(self) -> MetricsResult:
        avg_queue = self._queue_sum / self._queue_samples if self._queue_samples else 0.0
        avg_travel = self._arrived_travel_sum / self._arrived_count if self._arrived_count else 0.0
        avg_wait = self._arrived_wait_sum / self._arrived_count if self._arrived_count else 0.0
        avg_stops = self._arrived_stop_sum / self._arrived_count if self._arrived_count else 0.0

        return MetricsResult(
            avg_waiting_time_s=float(avg_wait),
            avg_queue_length=float(avg_queue),
            max_queue_length=int(self._queue_max),
            vehicles_completed=int(self._arrived_count),
            avg_travel_time_s=float(avg_travel),
            avg_stops=float(avg_stops),
        )


def _queue(lanes: list[str]) -> int:
    total = 0
    for lane_id in lanes:
        try:
            total += int(traci.lane.getLastStepHaltingNumber(lane_id))
        except traci.TraCIException:
            continue
    return total


def _traffic_light_phase(tls_id: str | None) -> str | None:
    if not tls_id:
        return None
    try:
        phase_index = traci.trafficlight.getPhase(tls_id)
        phase_name = traci.trafficlight.getPhaseName(tls_id)
        return f"{phase_index}:{phase_name}" if phase_name else str(phase_index)
    except traci.TraCIException:
        return None


def _vehicle_snapshots(vehicle_ids: tuple[str, ...] | list[str], limit: int = 120) -> list[dict[str, Any]]:
    snapshots: list[dict[str, Any]] = []

    for vid in list(vehicle_ids)[:limit]:
        try:
            lane_id = traci.vehicle.getLaneID(vid)
            if not lane_id or lane_id.startswith(":"):
                continue

            snapshots.append(
                {
                    "id": vid,
                    "laneId": lane_id,
                    "lanePosition": float(traci.vehicle.getLanePosition(vid)),
                    "laneLength": float(traci.lane.getLength(lane_id)),
                    "speed": float(traci.vehicle.getSpeed(vid)),
                }
            )
        except traci.TraCIException:
            continue

    return snapshots
