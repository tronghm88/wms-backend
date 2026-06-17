#!/usr/bin/env python3
"""
Parse `docs/nhap-xuat-ton.xlsx` (monthly nhập-xuất-tồn report) into a normalized
product seed at `src/data/products.seed.json`.

Each sheet is one (already-seeded) product category. Each data row is one
product. The product NAME comes from the merged "Tên SP" cell (filled down);
the per-row variant (width×length / colour / paper-size / thickness) lives in
`specText`, and a deterministic UPPERCASE `code` is generated from name + the
distinguishing attributes (dots → underscore, collisions get a -00N suffix).

Closing stock ("Tồn cuối", base unit) seeds the initial inventory quantity.
The file has NO price column, so basePrice is left at 0. Unit-conversion factors
are rebuilt from the columns that carry them (m, m2, kg, to).

Run:  python3 scripts/parse-stock-xlsx.py
"""
import json
import re
import unicodedata
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
XLSX = ROOT / "docs" / "nhap-xuat-ton.xlsx"
OUT = ROOT / "src" / "data" / "products.seed.ts"

# Per-sheet config. Columns are 1-indexed. `header`/`data` are row numbers.
# variant_col = the column whose non-empty value marks a real product row.
# width_col/length_col = source columns for dimensions (None => leave null).
# stock_col = closing-stock column (base unit).
# convs = list of (toUnit, kind) where kind tells how to compute the factor:
#   "length"      -> length value
#   "area"        -> width * length
#   "col:<N>"     -> raw value of column N
#   "col:<N>*len" -> column N value * length   (not used yet)
#   "wl_or_col:<N>" handled inline per sheet below.
SHEETS = {
    "PP-MÀNG-DECAL": dict(
        category="PP_MANG_DECAL", base_unit="cuon", data=6,
        name_col=1, variant_col=2, width_col=4, length_col=5,
        spec_col=2, stock_col=8,
        convs=[("m", "length"), ("m2", "area")],
    ),
    "GIẤY ẢNH CUỘN": dict(
        category="GIAY_ANH_CUON", base_unit="cuon", data=6,
        name_col=1, variant_col=2, width_col=4, length_col=5,
        spec_col=2, stock_col=8,
        convs=[("m", "length"), ("m2", "area"), ("kg", "col:12")],
    ),
    "LY": dict(
        category="LY", base_unit="cai", data=6,
        name_col=1, variant_col=2, width_col=None, length_col=None,
        spec_col=2, stock_col=5,
        convs=[],
    ),
    " GIẤY ẢNH XẤP": dict(
        category="GIAY_ANH_XAP", base_unit="xap", data=5,
        name_col=1, variant_col=2, width_col=None, length_col=None,
        spec_col=2, stock_col=9,
        # E(5)=tờ/xấp, D(4)=m²/tờ  => xap->m2 = D*E, xap->to = E, xap->kg = M(13)
        convs=[("to", "col:5"), ("m2", "col:4*col:5"), ("kg", "col:13")],
    ),
    "RUỘT PVC+VIỀN": dict(
        category="RUOT_PVC_VIEN", base_unit="to", data=5,
        name_col=1, variant_col=2, width_col=None, length_col=None,
        spec_col=2, stock_col=10,
        convs=[("m2", "col:4")],  # D(4)=m²/tấm
    ),
    "Hiflex": dict(
        category="HIFLEX", base_unit="cuon", data=5,
        name_col=1, variant_col=3, width_col=3, length_col=4,
        spec_col=2, thickness_merged=True, stock_col=7,
        convs=[("m", "length"), ("m2", "area"), ("kg", "col:11")],
    ),
}

_VI_MAP = str.maketrans({"đ": "d", "Đ": "D"})


def strip_diacritics(s: str) -> str:
    s = s.translate(_VI_MAP)
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s


def slug(s) -> str:
    """UPPERCASE ASCII slug: diacritics stripped, '.'->'_', non [A-Z0-9] -> '_'."""
    if s is None:
        return ""
    s = strip_diacritics(str(s)).upper()
    # drop parenthetical asides (often Chinese, e.g. "（普通白杯）")
    s = re.sub(r"[（(].*?[)）]", " ", s)
    s = s.replace(".", "_")
    s = re.sub(r"[^A-Z0-9]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s


def numfmt(v) -> str:
    """Format a number for a code segment: 50.0->'50', 0.914->'0_914'."""
    if v is None:
        return ""
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    return str(v).replace(".", "_")


def num(v):
    if v is None or v == "":
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def build_merge_map(ws, col):
    """Map row -> top-left value for every merged range covering `col`."""
    m = {}
    for rng in ws.merged_cells.ranges:
        if rng.min_col <= col <= rng.max_col:
            top = ws.cell(row=rng.min_row, column=rng.min_col).value
            for r in range(rng.min_row, rng.max_row + 1):
                m[r] = top
    return m


def parse_sheet(ws, cfg):
    name_merge = build_merge_map(ws, cfg["name_col"])
    thick_merge = build_merge_map(ws, cfg["spec_col"]) if cfg.get("thickness_merged") else {}
    rows = []
    blanks = 0
    for r in range(cfg["data"], ws.max_row + 1):
        variant = ws.cell(row=r, column=cfg["variant_col"]).value
        name = ws.cell(row=r, column=cfg["name_col"]).value or name_merge.get(r)
        if variant in (None, "") or name in (None, ""):
            blanks += 1
            if blanks > 25:
                break
            continue
        blanks = 0
        name = str(name).replace("\n", " ").strip()
        if name.upper().startswith("SUM"):
            continue
        spec = ws.cell(row=r, column=cfg["spec_col"]).value
        if cfg.get("thickness_merged"):
            spec = spec or thick_merge.get(r)
        spec = (str(spec).replace("\n", " ").strip() if spec not in (None, "") else None)

        width = num(ws.cell(row=r, column=cfg["width_col"]).value) if cfg["width_col"] else None
        length = num(ws.cell(row=r, column=cfg["length_col"]).value) if cfg["length_col"] else None
        stock = num(ws.cell(row=r, column=cfg["stock_col"]).value) or 0

        # conversions
        convs = []
        for to_unit, kind in cfg["convs"]:
            factor = None
            if kind == "length":
                factor = length
            elif kind == "area":
                factor = (width * length) if (width and length) else None
            elif kind.startswith("col:") and "*" not in kind:
                c = int(kind.split(":")[1])
                factor = num(ws.cell(row=r, column=c).value)
            elif "*" in kind:  # "col:A*col:B"
                a, b = (int(p.split(":")[1]) for p in kind.split("*"))
                fa = num(ws.cell(row=r, column=a).value)
                fb = num(ws.cell(row=r, column=b).value)
                factor = (fa * fb) if (fa and fb) else None
            if factor and factor > 0:
                convs.append({"toUnit": to_unit, "factor": round(factor, 6)})

        # base code (uniqueness suffix applied later)
        parts = [slug(name)]
        if width is not None or length is not None:
            if width is not None:
                parts.append(numfmt(width))
            if length is not None:
                parts.append(numfmt(length))
            # Hiflex also distinguishes by thickness (spec) — prepend it
            if cfg.get("thickness_merged") and spec:
                parts.insert(1, slug(spec))
        else:
            parts.append(slug(spec))
        base_code = "_".join(p for p in parts if p)

        rows.append(dict(
            base_code=base_code,
            name=name,
            categoryCode=cfg["category"],
            baseUnit=cfg["base_unit"],
            basePrice="0",
            length=length,
            width=width,
            specText=spec,
            initialStock=int(stock) if float(stock).is_integer() else stock,
            conversions=convs,
        ))
    return rows


def apply_codes(rows):
    """Resolve base_code collisions with -00N suffix; cap length at 64."""
    from collections import Counter
    counts = Counter(r["base_code"] for r in rows)
    seen = {}
    for r in rows:
        bc = r.pop("base_code")
        if counts[bc] > 1:
            seen[bc] = seen.get(bc, 0) + 1
            code = f"{bc}-{seen[bc]:03d}"
        else:
            code = bc
        if len(code) > 64:  # regex cap; truncate the slug head
            suffix = code[len(bc):]
            code = bc[: 64 - len(suffix)] + suffix
        r["code"] = code
        r.move_to_end("code", last=False) if hasattr(r, "move_to_end") else None
    return rows


def main():
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    all_rows = []
    print("=== per-sheet parse ===")
    for sheet, cfg in SHEETS.items():
        ws = wb[sheet]
        rows = parse_sheet(ws, cfg)
        all_rows.extend(rows)
        print(f"  {cfg['category']:16s} {len(rows):4d} products  e.g. "
              f"{rows[0]['name']!r} -> base {rows[0]['base_code']!r}" if rows else f"  {sheet}: 0")
    rows = apply_codes(all_rows)

    # collision / dup-code sanity
    from collections import Counter
    code_counts = Counter(r["code"] for r in rows)
    dups = {c: n for c, n in code_counts.items() if n > 1}
    print(f"\nTOTAL products: {len(rows)}")
    print(f"duplicate final codes (should be 0): {len(dups)}")
    if dups:
        for c, n in list(dups.items())[:10]:
            print("   DUP:", c, n)

    # samples
    print("\n=== samples (one per category) ===")
    seen_cat = set()
    for r in rows:
        if r["categoryCode"] not in seen_cat:
            seen_cat.add(r["categoryCode"])
            print(" ", json.dumps(r, ensure_ascii=False))

    OUT.parent.mkdir(parents=True, exist_ok=True)

    # Group by category, preserving first-seen order, into named arrays so the
    # seed reads as `[...ppMangDecal, ...ly, ...]`.
    from collections import OrderedDict

    def camel(code):  # PP_MANG_DECAL -> ppMangDecal
        p = code.lower().split("_")
        return p[0] + "".join(w.capitalize() for w in p[1:])

    groups = OrderedDict()
    for r in rows:
        groups.setdefault(r["categoryCode"], []).append(r)

    parts = [
        "// AUTO-GENERATED by scripts/parse-stock-xlsx.py from "
        "docs/nhap-xuat-ton.xlsx.\n"
        "// Do NOT edit by hand — re-run the parser when the Excel changes.\n\n"
        "export interface SeedProduct {\n"
        "  code: string;\n"
        "  name: string;\n"
        "  categoryCode: string;\n"
        "  baseUnit: string;\n"
        "  basePrice: string;\n"
        "  length: number | null;\n"
        "  width: number | null;\n"
        "  specText: string | null;\n"
        "  /** Closing stock from the report, in base unit — seeds inventory. */\n"
        "  initialStock: number;\n"
        "  conversions: { toUnit: string; factor: number }[];\n"
        "}\n\n"
    ]
    for cat, items in groups.items():
        body = json.dumps(items, ensure_ascii=False, indent=2)
        parts.append(
            f"// {cat} — {len(items)} products\n"
            f"export const {camel(cat)}: SeedProduct[] = {body};\n\n"
        )
    spread = "\n".join(f"  ...{camel(cat)}," for cat in groups)
    parts.append(f"const products: SeedProduct[] = [\n{spread}\n];\n\nexport default products;\n")

    OUT.write_text("".join(parts), encoding="utf-8")
    print(f"\nwrote {len(rows)} products in {len(groups)} category arrays "
          f"-> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
