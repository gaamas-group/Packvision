from fastapi import FastAPI
from app.api.v1 import auth

app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(auth.router, prefix="/api/v1")
