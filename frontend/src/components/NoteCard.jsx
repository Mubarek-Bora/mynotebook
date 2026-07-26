import { useState } from "react";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NoteCard({ note, onSave, onDelete, onSummarize }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  async function handleSave() {
    await onSave(note.id, title, content);
    setEditing(false);
  }

  async function handleSummarize() {
    setSummarizing(true);
    setSummary(null);
    try {
      const result = await onSummarize(note.id);
      setSummary(result.summary);
    } catch {
      setSummary("Could not generate a summary right now.");
    } finally {
      setSummarizing(false);
    }
  }

  if (editing) {
    return (
      <div className="note-card note-card--editing">
        <input
          className="note-card__title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="note-card__content-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
        />
        <div className="note-card__actions">
          <button className="btn-primary btn-small" onClick={handleSave}>
            Save
          </button>
          <button className="btn-ghost btn-small" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="note-card">
      <div className="note-card__header">
        <h3>{note.title}</h3>
        {typeof note.similarity === "number" && (
          <span className="similarity-badge">{Math.round(note.similarity * 100)}% match</span>
        )}
      </div>
      <p className="note-card__content">{note.content}</p>
      {summary && <p className="note-card__summary">✦ {summary}</p>}
      <div className="note-card__footer">
        <span className="note-card__date">{formatDate(note.updated_at)}</span>
        <div className="note-card__actions">
          <button className="btn-ghost btn-small" onClick={handleSummarize} disabled={summarizing}>
            {summarizing ? "Summarizing…" : "Summarize"}
          </button>
          <button className="btn-ghost btn-small" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button className="btn-ghost btn-small btn-danger" onClick={() => onDelete(note.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
