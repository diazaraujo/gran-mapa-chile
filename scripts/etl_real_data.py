#!/usr/bin/env python3
"""
ETL: Fetch real data from all 5 sources and unify into comunas_unified.json

Sources:
1. DeficitCero (CloudFront) — nuevos hogares por comuna
2. Colunga (CloudFront) — pobreza, JUNAEB, matrícula, índice bienestar
3. SOFOFA/SEIA (CloudFront, gzipped) — proyectos ambientales
4. ACHS/Salud (CloudFront, gzipped) — hospitales SNSS

Join key: canonical_key / comuna_key from TopoJSON
"""

import json
import gzip
import os
import sys
import urllib.request
from collections import defaultdict

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_PATH = os.path.join(SCRIPT_DIR, "..", "public", "data", "comunas_unified.json")
POINTS_DIR = os.path.join(SCRIPT_DIR, "..", "public", "data")
TOPO_PATH = os.path.join(SCRIPT_DIR, "..", "public", "geo", "comunas.topo.json")

CDN_COLUNGA = "https://d109f9uztt08nv.cloudfront.net"
CDN_SOFOFA = "https://d3awelxd6ch5ab.cloudfront.net"
CDN_ACHS = "https://d1an6jn81y5gfo.cloudfront.net"

SOURCES = {
    "deficitcero_hogares": f"{CDN_COLUNGA}/deficit-cero/datos-deficit-cero/mapas/nuevos_hogares_mapa_v3.json",
    "colunga_pobreza": f"{CDN_COLUNGA}/colunga/viz-colunga/casen-pobreza/datos/data_pobreza_mapa.json",
    "colunga_junaeb": f"{CDN_COLUNGA}/colunga/viz-colunga/vulnerabilidad-multidimensional/datos/data_mapa_junaeb_v2.json",
    "colunga_matricula": f"{CDN_COLUNGA}/colunga/viz-colunga/matricula-basica/datos/matriculas-basica.json",
    "colunga_indice": f"{CDN_COLUNGA}/colunga/data/data-indice-bienestar/data_mapa_indice_v2.json",
    "sofofa_seia": f"{CDN_SOFOFA}/latest/mapa_data.min.json.gz",
    "achs_hospitales": f"{CDN_ACHS}/latest/datos_hospitales_snss.min.json.gz",
}


def fetch_json(url):
    """Fetch JSON, handling gzip if needed."""
    print(f"  Fetching {url.split('/')[-1]}...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
        # Try gzip decompression for .gz files or if data starts with gzip magic bytes
        if url.endswith(".gz") or data[:2] == b'\x1f\x8b':
            try:
                data = gzip.decompress(data)
            except gzip.BadGzipFile:
                pass  # Not actually gzipped
        return json.loads(data.decode("utf-8"))


def load_topo_comunas():
    """Load TopoJSON and build canonical_key -> {comuna, region} mapping."""
    with open(TOPO_PATH, "r") as f:
        topo = json.load(f)
    obj_key = list(topo["objects"].keys())[0]
    mapping = {}
    for geom in topo["objects"][obj_key]["geometries"]:
        props = geom.get("properties", {})
        ck = props.get("canonical_key", "")
        if ck:
            mapping[ck] = {
                "comuna": props.get("Comuna", ""),
                "region": props.get("Region", ""),
            }
    return mapping


def normalize_comuna_key(raw_key):
    """Try to normalize various comuna key formats to canonical_key format."""
    if not raw_key:
        return None
    # canonical_key format is like "t.c.marchigue"
    if raw_key.startswith("t.c."):
        return raw_key
    # Some data uses "m.2020.t.XXXX" format (territoryKey)
    if raw_key.startswith("m."):
        return None  # Can't easily map these without lookup table
    return raw_key


def add_time_series(comunas, canonical_key, indicator_id, year, value):
    """Add a data point to the unified structure."""
    if canonical_key is None or value is None:
        return
    try:
        value = float(value)
    except (ValueError, TypeError):
        return
    if canonical_key not in comunas:
        comunas[canonical_key] = {}
    if indicator_id not in comunas[canonical_key]:
        comunas[canonical_key][indicator_id] = []
    comunas[canonical_key][indicator_id].append({"year": int(year), "value": round(value, 2)})


def process_deficitcero(data, comunas):
    """Process DeficitCero nuevos hogares data."""
    print(f"  Processing {len(data)} records...")
    for row in data:
        ck = normalize_comuna_key(row.get("comuna_key", ""))
        year = row.get("Año")
        if not ck or not year:
            continue
        add_time_series(comunas, ck, "vivienda.crecimiento_natural", year, row.get("Crecimiento_natural"))
        add_time_series(comunas, ck, "vivienda.migracion_neta", year, row.get("Migración"))


def process_colunga_pobreza(data, comunas):
    """Process Colunga poverty data."""
    print(f"  Processing {len(data)} records...")
    for row in data:
        ck = normalize_comuna_key(row.get("comuna_key", ""))
        year = row.get("año")
        if not ck or not year:
            continue
        add_time_series(comunas, ck, "ninez.pobreza_comunal", year, row.get("value_com"))


def process_colunga_junaeb(data, comunas):
    """Process Colunga JUNAEB vulnerability data."""
    print(f"  Processing {len(data)} records...")
    for row in data:
        ck = normalize_comuna_key(row.get("comuna_key", ""))
        if not ck:
            continue
        # JUNAEB data may not have year; use as latest snapshot
        for field, indicator in [
            ("ivm_comuna", "ninez.ivm_vulnerabilidad"),
            ("ivm_salud", "ninez.ivm_salud"),
            ("ivm_cse_familiar", "ninez.ivm_socioeconomico"),
        ]:
            val = row.get(field)
            if val is not None:
                add_time_series(comunas, ck, indicator, 2023, val)


def process_colunga_indice(data, comunas):
    """Process Colunga bienestar index data."""
    print(f"  Processing {len(data)} records...")
    for row in data:
        ck = normalize_comuna_key(row.get("comuna_key", ""))
        if not ck:
            continue
        val = row.get("indice_ninez_2")
        if val is not None:
            add_time_series(comunas, ck, "ninez.indice_bienestar", 2023, val)


def process_colunga_matricula(data, comunas):
    """Process Colunga matrícula básica data."""
    print(f"  Processing {len(data)} records...")
    for row in data:
        ck = normalize_comuna_key(row.get("comuna_key", ""))
        year = row.get("año") or row.get("Año")
        if not ck or not year:
            continue
        add_time_series(comunas, ck, "educacion.matricula_basica", year, row.get("value_com"))


def process_sofofa(data, comunas):
    """Process SOFOFA/SEIA projects — aggregate by comuna."""
    features = data.get("features", []) if isinstance(data, dict) else data
    print(f"  Processing {len(features)} SEIA project features...")

    # Build per-comuna aggregates
    comuna_projects = defaultdict(lambda: {"count": 0, "total_inversion": 0, "total_empleo": 0, "by_year": defaultdict(int)})

    for feat in features:
        props = feat.get("properties", {}) if isinstance(feat, dict) and "properties" in feat else feat
        comuna_name = props.get("comuna geolocalizada", "")
        if not comuna_name:
            continue

        # Normalize comuna name to a key format
        comuna_key_guess = "t.c." + comuna_name.lower().replace(" ", "_").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u").replace("ñ", "n")

        year = None
        try:
            year = int(str(props.get("año", ""))[:4])
        except (ValueError, TypeError):
            pass

        inversion = 0
        try:
            inversion = float(props.get("inversión", 0) or 0)
        except (ValueError, TypeError):
            pass

        empleo = 0
        try:
            empleo = float(props.get("mano de obra promedio construcción", 0) or 0)
        except (ValueError, TypeError):
            pass

        agg = comuna_projects[comuna_key_guess]
        agg["count"] += 1
        agg["total_inversion"] += inversion
        agg["total_empleo"] += empleo
        if year:
            agg["by_year"][year] += 1

    # Convert to time series
    for ck, agg in comuna_projects.items():
        for year, count in sorted(agg["by_year"].items()):
            add_time_series(comunas, ck, "medioambiente.proyectos_seia", year, count)
        # Add totals as latest year
        add_time_series(comunas, ck, "medioambiente.inversion_total_mmusd", 2025, agg["total_inversion"])
        add_time_series(comunas, ck, "medioambiente.empleo_total", 2025, agg["total_empleo"])

    # Save as GeoJSON points
    save_points_geojson(features, "medioambiente")
    return len(features)


def process_achs(data, comunas):
    """Process ACHS hospital data — aggregate by comuna."""
    features = data.get("features", []) if isinstance(data, dict) else data
    print(f"  Processing {len(features)} hospital features...")

    for feat in features:
        props = feat.get("properties", {})
        comuna_name = props.get("comuna", "")
        if not comuna_name:
            continue

        comuna_key_guess = "t.c." + comuna_name.lower().replace(" ", "_").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u").replace("ñ", "n")

        # Latest snapshot values
        camas = props.get("dot_camas_reciente")
        if camas is not None:
            add_time_series(comunas, comuna_key_guess, "salud.camas_hospitalarias", 2025, camas)

        ocupacion = props.get("indice_ocupacional_reciente")
        if ocupacion is not None:
            add_time_series(comunas, comuna_key_guess, "salud.indice_ocupacion", 2025, ocupacion)

        rotacion = props.get("indice_rotacion_reciente")
        if rotacion is not None:
            add_time_series(comunas, comuna_key_guess, "salud.indice_rotacion", 2025, rotacion)

        estadia = props.get("promedio_estadia_reciente")
        if estadia is not None:
            add_time_series(comunas, comuna_key_guess, "salud.promedio_dias_estadia", 2025, estadia)

        # Historical bed data
        hist_camas = props.get("dotacion_camas_historica", [])
        if isinstance(hist_camas, list):
            for entry in hist_camas:
                if isinstance(entry, dict):
                    y = entry.get("año") or entry.get("year")
                    v = entry.get("total") or entry.get("camas")
                    if y and v:
                        add_time_series(comunas, comuna_key_guess, "salud.camas_hospitalarias", y, v)

    # Save as GeoJSON points
    save_points_geojson(features, "salud")
    return len(features)


def save_points_geojson(features, domain):
    """Save point features as a GeoJSON file for map layers."""
    geojson = {
        "type": "FeatureCollection",
        "features": [f for f in features if isinstance(f, dict) and f.get("geometry")]
    }
    path = os.path.join(POINTS_DIR, f"points_{domain}.geojson")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False)
    print(f"  Saved {len(geojson['features'])} points → {path}")


def build_unified(comunas_raw, topo_mapping):
    """Build final unified structure with coverage stats."""
    output = {}

    # First, gather all canonical keys from topo
    all_keys = set(topo_mapping.keys())
    # Also add keys found in data
    all_keys.update(comunas_raw.keys())

    for ck in sorted(all_keys):
        topo_info = topo_mapping.get(ck, {})
        indicators = comunas_raw.get(ck, {})

        # Sort each indicator's time series by year
        for ind_key in indicators:
            indicators[ind_key] = sorted(indicators[ind_key], key=lambda x: x["year"])
            # Deduplicate years (keep last value)
            seen = {}
            for entry in indicators[ind_key]:
                seen[entry["year"]] = entry
            indicators[ind_key] = sorted(seen.values(), key=lambda x: x["year"])

        # Compute coverage
        domain_set = set()
        for ind_key in indicators:
            domain = ind_key.split(".")[0]
            domain_set.add(domain)

        output[ck] = {
            "comunaKey": ck,
            "comuna": topo_info.get("comuna", ck),
            "region": topo_info.get("region", ""),
            "indicators": indicators,
            "coverage": {
                "totalDomains": len(domain_set),
                "totalIndicators": len(indicators),
                "domains": sorted(domain_set),
                "completeness": round(len(domain_set) / 5, 2),
            },
        }

    return output


def main():
    print("=== Gran Mapa de Datos de Chile — ETL ===\n")

    # Load topo mapping
    print("Loading TopoJSON mapping...")
    topo_mapping = load_topo_comunas()
    print(f"  {len(topo_mapping)} comunas in TopoJSON\n")

    # Unified data store: canonical_key -> {indicator_id -> [{year, value}]}
    comunas_raw = defaultdict(dict)

    # Fetch and process each source
    for source_name, url in SOURCES.items():
        print(f"\n[{source_name}]")
        try:
            data = fetch_json(url)

            if source_name == "deficitcero_hogares":
                process_deficitcero(data, comunas_raw)
            elif source_name == "colunga_pobreza":
                process_colunga_pobreza(data, comunas_raw)
            elif source_name == "colunga_junaeb":
                process_colunga_junaeb(data, comunas_raw)
            elif source_name == "colunga_indice":
                process_colunga_indice(data, comunas_raw)
            elif source_name == "colunga_matricula":
                process_colunga_matricula(data, comunas_raw)
            elif source_name == "sofofa_seia":
                process_sofofa(data, comunas_raw)
            elif source_name == "achs_hospitales":
                process_achs(data, comunas_raw)

        except Exception as e:
            print(f"  ERROR: {e}")

    # Build unified output
    print("\n\nBuilding unified data...")
    output = build_unified(comunas_raw, topo_mapping)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False)

    size_kb = os.path.getsize(OUT_PATH) / 1024
    print(f"\nOutput: {len(output)} comunas → {OUT_PATH} ({size_kb:.0f} KB)")

    # Coverage stats
    domain_counts = defaultdict(int)
    for c in output.values():
        for d in c["coverage"]["domains"]:
            domain_counts[d] += 1

    total_with_data = sum(1 for c in output.values() if c["coverage"]["totalDomains"] > 0)
    print(f"\nComunas with data: {total_with_data}/{len(output)}")
    print("\nCoverage by domain:")
    for d, count in sorted(domain_counts.items()):
        print(f"  {d}: {count} comunas ({100 * count // len(output)}%)")


if __name__ == "__main__":
    main()
