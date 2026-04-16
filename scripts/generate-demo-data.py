#!/usr/bin/env python3
"""
Generate demo unified data for the Gran Mapa de Datos de Chile.
Reads the actual TopoJSON to use real canonical_key values for all 343 comunas.
"""

import json
import random
import os

random.seed(42)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TOPO_PATH = os.path.join(SCRIPT_DIR, "..", "public", "geo", "comunas.topo.json")
OUT_PATH = os.path.join(SCRIPT_DIR, "..", "public", "data", "comunas_unified.json")


def gen_time_series(start_year, end_year, base, trend=0, noise=0.1):
    values = []
    for year in range(start_year, end_year + 1):
        val = base + trend * (year - start_year) + random.gauss(0, base * noise)
        values.append({"year": year, "value": round(max(0, val), 2)})
    return values


def gen_vivienda():
    return {
        "vivienda.nuevos_hogares": gen_time_series(2002, 2023, random.uniform(500, 5000), trend=50),
        "vivienda.nuevos_predios_x_mil": gen_time_series(2002, 2023, random.uniform(2, 15), trend=0.2),
        "vivienda.viviendas_autorizadas_x_mil": gen_time_series(2002, 2023, random.uniform(3, 20), trend=0.3),
    }


def gen_educacion():
    base_paes = random.uniform(400, 700)
    return {
        "educacion.puntaje_paes_lectura": gen_time_series(2021, 2025, base_paes, trend=5, noise=0.05),
        "educacion.puntaje_paes_matematicas": gen_time_series(2021, 2025, base_paes * 0.95, trend=3, noise=0.05),
        "educacion.tasa_universidad_pct": gen_time_series(2011, 2021, random.uniform(20, 60), trend=1.5),
    }


def gen_ninez():
    return {
        "ninez.pobreza_infantil_pct": gen_time_series(2006, 2022, random.uniform(5, 40), trend=-0.5),
        "ninez.desercion_escolar_pct": gen_time_series(2010, 2023, random.uniform(1, 8), trend=-0.1),
        "ninez.malnutricion_pct": gen_time_series(2010, 2023, random.uniform(5, 25), trend=-0.3),
        "ninez.hacinamiento_pct": gen_time_series(2010, 2022, random.uniform(3, 20), trend=-0.2),
        "ninez.depresion_pct": gen_time_series(2015, 2023, random.uniform(5, 15), trend=0.5),
    }


def gen_medioambiente():
    return {
        "medioambiente.proyectos_seia": gen_time_series(2010, 2025, random.uniform(1, 20), trend=0.5),
        "medioambiente.inversion_mm_usd": gen_time_series(2010, 2025, random.uniform(10, 500), trend=10),
        "medioambiente.empleo_construccion": gen_time_series(2010, 2025, random.uniform(50, 2000), trend=20),
    }


def gen_salud():
    return {
        "salud.camas_hospitalarias": gen_time_series(2010, 2025, random.uniform(50, 500), trend=5),
        "salud.indice_ocupacion_pct": gen_time_series(2010, 2025, random.uniform(60, 95), trend=0.5, noise=0.05),
        "salud.lista_espera_cirugia": gen_time_series(2022, 2025, random.uniform(100, 5000), trend=100),
        "salud.gasto_hospitalario_mm": gen_time_series(2013, 2024, random.uniform(1000, 10000), trend=200),
    }


GENERATORS = {
    "vivienda": gen_vivienda,
    "educacion": gen_educacion,
    "ninez": gen_ninez,
    "medioambiente": gen_medioambiente,
    "salud": gen_salud,
}


def main():
    with open(TOPO_PATH, "r", encoding="utf-8") as f:
        topo = json.load(f)

    obj_key = list(topo["objects"].keys())[0]
    geometries = topo["objects"][obj_key]["geometries"]

    output = {}

    for geom in geometries:
        props = geom.get("properties", {})
        canonical_key = props.get("canonical_key", "")
        comuna_name = props.get("Comuna", "")
        region = props.get("Region", "")

        if not canonical_key:
            continue

        # Randomly assign 2-5 domains per comuna
        available = random.sample(list(GENERATORS.keys()), k=random.randint(2, 5))

        indicators = {}
        domain_set = set()

        for domain_id in available:
            indicators.update(GENERATORS[domain_id]())
            domain_set.add(domain_id)

        output[canonical_key] = {
            "comunaKey": canonical_key,
            "comuna": comuna_name,
            "region": region,
            "indicators": indicators,
            "coverage": {
                "totalDomains": len(domain_set),
                "totalIndicators": len(indicators),
                "domains": sorted(domain_set),
                "completeness": round(len(domain_set) / 5, 2),
            },
        }

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False)

    print(f"Generated {len(output)} comunas → {OUT_PATH}")
    print(f"File size: {os.path.getsize(OUT_PATH) / 1024:.1f} KB")

    # Stats
    domain_counts = {}
    for c in output.values():
        for d in c["coverage"]["domains"]:
            domain_counts[d] = domain_counts.get(d, 0) + 1
    print("\nCoverage by domain:")
    for d, count in sorted(domain_counts.items()):
        print(f"  {d}: {count}/{len(output)} comunas ({100*count//len(output)}%)")


if __name__ == "__main__":
    main()
