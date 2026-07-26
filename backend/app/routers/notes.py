from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..auth import get_current_user
from ..database import get_session
from ..embeddings import embed
from ..llm import summarize_note
from ..models import Note, User, utcnow
from ..schemas import NoteCreate, NoteRead, NoteUpdate, SearchResult, SummaryResponse

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.get("", response_model=list[NoteRead])
def list_notes(
    session: Session = Depends(get_session), user: User = Depends(get_current_user)
):
    notes = session.exec(
        select(Note).where(Note.user_id == user.id).order_by(Note.updated_at.desc())
    ).all()
    return notes


@router.post("", response_model=NoteRead, status_code=201)
def create_note(
    body: NoteCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    embedding = embed(f"{body.title}\n{body.content}")
    note = Note(user_id=user.id, title=body.title, content=body.content, embedding=embedding)
    session.add(note)
    session.commit()
    session.refresh(note)
    return note


def _get_owned_note(note_id: int, session: Session, user: User) -> Note:
    note = session.get(Note, note_id)
    if not note or note.user_id != user.id:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.put("/{note_id}", response_model=NoteRead)
def update_note(
    note_id: int,
    body: NoteUpdate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    note = _get_owned_note(note_id, session, user)
    note.title = body.title
    note.content = body.content
    note.embedding = embed(f"{body.title}\n{body.content}")
    note.updated_at = utcnow()
    session.add(note)
    session.commit()
    session.refresh(note)
    return note


@router.delete("/{note_id}", status_code=204)
def delete_note(
    note_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    note = _get_owned_note(note_id, session, user)
    session.delete(note)
    session.commit()


@router.get("/search", response_model=list[SearchResult])
def search_notes(
    q: str,
    limit: int = 10,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    query_embedding = embed(q)
    distance = Note.embedding.cosine_distance(query_embedding)
    rows = session.exec(
        select(Note, distance.label("distance"))
        .where(Note.user_id == user.id)
        .order_by(distance)
        .limit(limit)
    ).all()

    return [
        SearchResult(**note.model_dump(), similarity=round(1 - dist, 4))
        for note, dist in rows
    ]


@router.post("/{note_id}/summarize", response_model=SummaryResponse)
def summarize(
    note_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    note = _get_owned_note(note_id, session, user)
    try:
        summary = summarize_note(note.title, note.content)
    except Exception:
        raise HTTPException(status_code=502, detail="Could not generate a summary right now.")
    return SummaryResponse(summary=summary)
