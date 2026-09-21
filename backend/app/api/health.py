from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.core.db import check_database

router = APIRouter()


class HealthResponse(BaseModel):
    status: str = Field(examples=["ok"])


class ReadyResponse(BaseModel):
    status: str
    postgres: str


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get("/ready", response_model=ReadyResponse)
def ready() -> ReadyResponse:
    settings = get_settings()
    postgres = check_database(settings)
    status = "ok" if postgres in {"ok", "skipped"} else "degraded"
    return ReadyResponse(status=status, postgres=postgres)
