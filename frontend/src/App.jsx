import { useEffect, useState, useCallback } from "react";
import AuthForm from "./components/AuthForm";
import NewNoteForm from "./components/NewNoteForm";
import NoteCard from "./components/NoteCard";
import Footer from "./components/Footer";
import {
  createNote,
  deleteNote,
  listNotes,
  searchNotes,
  summarizeNote,
  updateNote,
} from "./services/api";
import "./App.css";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "");
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      setNotes(await listNotes(token));
    } catch {
      setError("Could not load notes.");
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleAuthed(newToken, newEmail) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("email", newEmail);
    setToken(newToken);
    setEmail(newEmail);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken(null);
    setNotes([]);
  }

  async function handleCreate(title, content) {
    await createNote(token, title, content);
    if (searchActive) {
      setSearchActive(false);
      setQuery("");
    }
    await refresh();
  }

  async function handleSave(id, title, content) {
    await updateNote(token, id, title, content);
    await refresh();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this note?")) return;
    await deleteNote(token, id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  async function handleSummarize(id) {
    return summarizeNote(token, id);
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) {
      setSearchActive(false);
      return;
    }
    setSearching(true);
    setError("");
    try {
      const results = await searchNotes(token, query.trim());
      setNotes(results);
      setSearchActive(true);
    } catch {
      setError("Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setSearchActive(false);
    refresh();
  }

  if (!token) {
    return <AuthForm onAuthed={handleAuthed} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark">
          <svg viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
            <rect x="2" y="2" width="60" height="60" rx="16" fill="#2d1b45" />
            <rect x="16" y="14" width="32" height="36" rx="3" fill="#f7f4ec" />
            <rect x="16" y="14" width="6" height="36" rx="2" fill="#d9a441" />
            <line x1="27" y1="24" x2="42" y2="24" stroke="#8b8478" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="27" y1="31" x2="42" y2="31" stroke="#8b8478" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="27" y1="38" x2="38" y2="38" stroke="#8b8478" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <h1 className="brand">MyNotebook</h1>
        </div>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search by meaning, not just keywords…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary btn-small" disabled={searching}>
            {searching ? "Searching…" : "Search"}
          </button>
          {searchActive && (
            <button type="button" className="btn-ghost btn-small" onClick={clearSearch}>
              Clear
            </button>
          )}
        </form>
        <div className="topbar__user">
          <span>{email}</span>
          <button className="btn-ghost btn-small" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="content">
        {!searchActive && <NewNoteForm onCreate={handleCreate} />}

        {error && <p className="form-error">{error}</p>}

        {searchActive && (
          <p className="search-status">
            {notes.length} result{notes.length === 1 ? "" : "s"} for “{query}”
          </p>
        )}

        {notes.length === 0 ? (
          <p className="empty-state">
            {searchActive ? "No matching notes." : "No notes yet — add your first one above."}
          </p>
        ) : (
          <div className="note-grid">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onSave={handleSave}
                onDelete={handleDelete}
                onSummarize={handleSummarize}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
