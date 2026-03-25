import os
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.endpoints import router as api_router

app = FastAPI(title="Prod Post Mortem AI", description="Incident Report Generator")

# Mount frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    return FileResponse("static/index.html")

# Include API router
app.include_router(api_router)
