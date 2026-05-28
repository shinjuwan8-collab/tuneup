from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import httpx
import os
from pathlib import Path

app = FastAPI()

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
DIST_DIR = Path(__file__).parent / "frontend" / "dist"


@app.post("/api/claude")
async def claude_proxy(request: Request):
    if not ANTHROPIC_API_KEY:
        return JSONResponse({"error": {"message": "ANTHROPIC_API_KEY が設定されていません"}}, status_code=500)
    body = await request.json()
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "Content-Type": "application/json",
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
            },
            json=body,
        )
    return JSONResponse(response.json(), status_code=response.status_code)


# 静的ファイル配信（ビルド後）
if (DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")


@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    index = DIST_DIR / "index.html"
    if index.exists():
        return FileResponse(str(index))
    return JSONResponse({"error": "Frontend not built. Run: cd frontend && npm install && npm run build"}, status_code=404)
