#!/usr/bin/env python3
"""Fail CI if forbidden financial fields appear in backend schemas/models."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIST = ROOT / "docs/privacy/forbidden-fields.yml"
BACKEND = ROOT / "backend"

names = []
for line in LIST.read_text().splitlines():
    line = line.strip()
    if line.startswith("- "):
        names.append(line[2:].strip())

pattern = re.compile(
    r"(?:^|[^A-Za-z0-9_])(" + "|".join(re.escape(n) for n in names) + r")(?:$|[^A-Za-z0-9_])",
    re.IGNORECASE,
)

targets = []
for path in [
    BACKEND / "app" / "api",
    BACKEND / "app" / "models.py",
    BACKEND / "app" / "main.py",
    BACKEND / "app" / "core" / "config.py",
    BACKEND / "app" / "core" / "db.py",
]:
    if path.is_dir():
        targets.extend(path.rglob("*.py"))
    elif path.exists():
        targets.append(path)

failed = False
for file in targets:
    text = file.read_text()
    for match in pattern.finditer(text):
        print(f'Forbidden field "{match.group(1)}" in {file.relative_to(ROOT)}')
        failed = True

if failed:
    sys.exit(1)
print("privacy-scan (backend): PASS")
