from datetime import datetime, timezone
from typing import Optional

from pgvector.sqlalchemy import Vector
from sqlmodel import Field, SQLModel
from sqlalchemy import Column

EMBEDDING_DIM = 384  # all-MiniLM-L6-v2


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=utcnow)


class Note(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    title: str
    content: str
    embedding: Optional[list[float]] = Field(
        default=None, sa_column=Column(Vector(EMBEDDING_DIM))
    )
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
