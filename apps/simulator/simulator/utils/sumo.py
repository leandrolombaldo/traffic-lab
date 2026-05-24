from __future__ import annotations

import os
import shutil
from dataclasses import dataclass


@dataclass(frozen=True)
class SumoBinaries:
    sumo: str
    sumo_gui: str
    netconvert: str


def _which_or_sumo_home(exe: str) -> str | None:
    found = shutil.which(exe)
    if found:
        return found

    sumo_home = os.environ.get("SUMO_HOME")
    if not sumo_home:
        return None

    candidate = os.path.join(sumo_home, "bin", f"{exe}.exe" if os.name == "nt" else exe)
    if os.path.exists(candidate):
        return candidate
    return None


def resolve_sumo_binaries() -> SumoBinaries:
    sumo = _which_or_sumo_home("sumo")
    sumo_gui = _which_or_sumo_home("sumo-gui")
    netconvert = _which_or_sumo_home("netconvert")

    missing = [name for name, value in [("sumo", sumo), ("sumo-gui", sumo_gui), ("netconvert", netconvert)] if not value]
    if missing:
        raise RuntimeError(
            "Binários do SUMO não encontrados: "
            + ", ".join(missing)
            + ". Garanta que o SUMO está no PATH ou defina SUMO_HOME."
        )

    return SumoBinaries(sumo=sumo, sumo_gui=sumo_gui, netconvert=netconvert)

