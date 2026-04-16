#!/usr/bin/env python3
"""
Fetch the Chilean comunas TopoJSON from the CloudFront CDN used by the existing projects.
Falls back to generating a simplified placeholder if the CDN is unavailable.
"""

import json
import os
import urllib.request

TOPO_URL = "https://d109f9uztt08nv.cloudfront.net/deficit-cero/viz-deficit-cero/datos/topo/base.topo.json"
TOPO_FALLBACK = "https://d109f9uztt08nv.cloudfront.net/deficit-cero/viz-deficit-cero/datos/topo/topo2@1.json"
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "geo", "comunas.topo.json")


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

    for url in [TOPO_URL, TOPO_FALLBACK]:
        try:
            print(f"Fetching {url}...")
            topo = fetch(url)
            with open(OUT_PATH, "w") as f:
                json.dump(topo, f)
            size_mb = os.path.getsize(OUT_PATH) / (1024 * 1024)
            print(f"Saved → {OUT_PATH} ({size_mb:.1f} MB)")

            # Report structure
            for name, obj in topo.get("objects", {}).items():
                geom_count = len(obj.get("geometries", []))
                sample_props = {}
                if geom_count > 0:
                    sample_props = obj["geometries"][0].get("properties", {})
                print(f"  Object '{name}': {geom_count} geometries")
                print(f"  Sample properties: {list(sample_props.keys())[:10]}")
            return
        except Exception as e:
            print(f"  Failed: {e}")

    print("Could not fetch TopoJSON. Creating placeholder.")
    placeholder = {
        "type": "Topology",
        "objects": {"comunas": {"type": "GeometryCollection", "geometries": []}},
        "arcs": [],
    }
    with open(OUT_PATH, "w") as f:
        json.dump(placeholder, f)
    print(f"Placeholder saved → {OUT_PATH}")


if __name__ == "__main__":
    main()
