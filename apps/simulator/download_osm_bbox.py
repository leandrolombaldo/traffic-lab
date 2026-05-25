from __future__ import annotations

import argparse
import json
import urllib.parse
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT_DIR = ROOT / "data" / "osm"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Download OpenStreetMap road data from an Overpass bounding box."
    )
    parser.add_argument("--name", required=True, help="Output area name, used as file prefix")
    parser.add_argument("--south", type=float, required=True, help="South latitude")
    parser.add_argument("--west", type=float, required=True, help="West longitude")
    parser.add_argument("--north", type=float, required=True, help="North latitude")
    parser.add_argument("--east", type=float, required=True, help="East longitude")
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT_DIR), help="Output directory")
    parser.add_argument(
        "--include-service-roads",
        action="store_true",
        help="Include service roads. Disabled by default to keep the network cleaner.",
    )
    args = parser.parse_args()

    _validate_bbox(args.south, args.west, args.north, args.east)

    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    osm_path = output_dir / f"{args.name}.osm.xml"
    meta_path = output_dir / f"{args.name}.bbox.json"

    query = _build_overpass_query(
        south=args.south,
        west=args.west,
        north=args.north,
        east=args.east,
        include_service_roads=args.include_service_roads,
    )

    print("Downloading OSM data from Overpass API...")
    print(f"bbox={args.south},{args.west},{args.north},{args.east}")

    data = urllib.parse.urlencode({"data": query}).encode("utf-8")
    request = urllib.request.Request(
        OVERPASS_URL,
        data=data,
        headers={"User-Agent": "traffic-lab/0.1"},
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=120) as response:
        content = response.read()

    osm_path.write_bytes(content)
    meta_path.write_text(
        json.dumps(
            {
                "name": args.name,
                "bbox": {
                    "south": args.south,
                    "west": args.west,
                    "north": args.north,
                    "east": args.east,
                },
                "includeServiceRoads": args.include_service_roads,
                "source": "overpass-api",
                "osmFile": str(osm_path.relative_to(ROOT)),
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(str(osm_path))
    print()
    print("Next command:")
    print(
        "python apps/simulator/generate_osm_scenario.py "
        f"--osm-file {osm_path.relative_to(ROOT)} "
        f"--scenario-id {args.name} --vehicles 300 --duration 600 --force"
    )
    return 0


def _validate_bbox(south: float, west: float, north: float, east: float) -> None:
    if south >= north:
        raise SystemExit("Invalid bbox: --south must be lower than --north")
    if west >= east:
        raise SystemExit("Invalid bbox: --west must be lower than --east")
    if not (-90 <= south <= 90 and -90 <= north <= 90):
        raise SystemExit("Invalid latitude values")
    if not (-180 <= west <= 180 and -180 <= east <= 180):
        raise SystemExit("Invalid longitude values")


def _build_overpass_query(
    *,
    south: float,
    west: float,
    north: float,
    east: float,
    include_service_roads: bool,
) -> str:
    excluded = "" if include_service_roads else '["highway"!="service"]'
    bbox = f"{south},{west},{north},{east}"
    return f"""
[out:xml][timeout:90];
(
  way["highway"]{excluded}({bbox});
);
(._;>;);
out body;
""".strip()


if __name__ == "__main__":
    raise SystemExit(main())
