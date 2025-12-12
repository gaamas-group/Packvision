from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/auth/login")
def login(request: LoginRequest):
    # Stub implementation
    return { "access_token": "test", "role": "admin" }
