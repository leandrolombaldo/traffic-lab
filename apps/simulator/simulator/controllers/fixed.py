from __future__ import annotations

from simulator.controllers.base import Controller, ControllerConfig


class FixedController(Controller):
    def __init__(self, config: ControllerConfig):
        self.config = config

