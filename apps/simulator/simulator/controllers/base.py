from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ControllerConfig:
    strategy: str


class Controller:
    def on_start(self) -> None:
        return None

    def step(self, t: int) -> None:
        return None

    def on_finish(self) -> None:
        return None

