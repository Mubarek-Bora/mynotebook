// Falls back to same-origin (empty string) when unset, which is correct for
// production where the frontend and backend are deployed as one Vercel project.
const API_URL = import.meta.env.VITE_API_URL || "";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseOrThrow(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Something went wrong");
  }
  return data;
}

export async function register(email, password) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseOrThrow(res);
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseOrThrow(res);
}

export async function listNotes(token) {
  const res = await fetch(`${API_URL}/api/notes`, { headers: authHeaders(token) });
  return parseOrThrow(res);
}

export async function createNote(token, title, content) {
  const res = await fetch(`${API_URL}/api/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ title, content }),
  });
  return parseOrThrow(res);
}

export async function updateNote(token, id, title, content) {
  const res = await fetch(`${API_URL}/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ title, content }),
  });
  return parseOrThrow(res);
}

export async function deleteNote(token, id) {
  const res = await fetch(`${API_URL}/api/notes/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Could not delete note");
}

export async function searchNotes(token, query) {
  const res = await fetch(
    `${API_URL}/api/notes/search?q=${encodeURIComponent(query)}`,
    { headers: authHeaders(token) }
  );
  return parseOrThrow(res);
}

export async function summarizeNote(token, id) {
  const res = await fetch(`${API_URL}/api/notes/${id}/summarize`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return parseOrThrow(res);
}
