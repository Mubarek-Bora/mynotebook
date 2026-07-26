import { useState } from "react";

export default function NewNoteForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await onCreate(title.trim(), content.trim());
      setTitle("");
      setContent("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="new-note-form" onSubmit={handleSubmit}>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Write a note…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Add note"}
      </button>
    </form>
  );
}
