from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    anthropic_api_key: str
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

    @field_validator("database_url")
    @classmethod
    def use_psycopg_driver(cls, v: str) -> str:
        # Neon/Vercel provide a plain postgresql:// URL; force the psycopg3 driver
        # explicitly since that's what's installed (not psycopg2).
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+psycopg://", 1)
        return v


settings = Settings()
