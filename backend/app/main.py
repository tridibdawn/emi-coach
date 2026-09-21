from fastapi import FastAPI

from app.api.health import router as health_router
from app.core.logging import configure_logging

configure_logging()

app = FastAPI(
    title="EMI Coach API",
    version="0.1.0",
    summary="Metadata-only backend. Financial ledgers stay on device.",
)

app.include_router(health_router)
