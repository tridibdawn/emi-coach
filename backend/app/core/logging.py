import logging
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
LIST = ROOT / "docs" / "privacy" / "forbidden-fields.yml"


def load_forbidden() -> list[str]:
    names: list[str] = []
    for line in LIST.read_text().splitlines():
        stripped = line.strip()
        if stripped.startswith("- "):
            names.append(stripped[2:].strip())
    return names


FORBIDDEN = load_forbidden()


class RedactingFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.msg = _redact(record.msg)
        if record.args:
            record.args = tuple(_redact(arg) for arg in record.args)
        return True


def _redact(value: Any) -> Any:
    text = str(value).lower()
    for name in FORBIDDEN:
        if name.lower() in text.replace("-", "_"):
            return "[REDACTED]"
    return value


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    logging.getLogger().addFilter(RedactingFilter())
