from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase

from app.core.config import Settings


class Base(DeclarativeBase):
    """Server metadata only. No financial ledger tables."""


def check_database(settings: Settings) -> str:
    if settings.skip_db_check:
        return "skipped"
    try:
        engine = create_engine(settings.database_url, pool_pre_ping=True)
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return "ok"
    except Exception:
        return "unavailable"
