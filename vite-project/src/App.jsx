import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./App.css";

const API = "http://localhost:5000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ---------------- AUTH ---------------- */

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setNotes([]);
    alert("Logged out or session expired.");
  };

  const scheduleAutoLogout = (token) => {
    try {
      const decoded = jwtDecode(token);
      const expiresAt = decoded.exp * 1000;
      const timeLeft = expiresAt - Date.now();

      if (timeLeft <= 0) {
        logout();
        return;
      }

      setTimeout(() => {
        logout();
      }, timeLeft);
    } catch {
      logout();
    }
  };

  const login = async () => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      setToken(data.token);
      localStorage.setItem("token", data.token);
      scheduleAutoLogout(data.token);
      fetchNotes(data.token);
    } else {
      alert(data.message || "Login failed");
    }
  };

  /* ---------------- NOTES ---------------- */

  const fetchNotes = async (jwt = token) => {
    if (!jwt) return;

    const res = await fetch(`${API}/notes`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    const data = await res.json();
    setNotes(data);
  };

  const saveNote = async () => {
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API}/notes/${editingId}`
      : `${API}/notes`;

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    setTitle("");
    setContent("");
    setEditingId(null);
    setShowForm(false);
    fetchNotes();
  };

  const deleteNote = async (id) => {
    await fetch(`${API}/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchNotes();
  };

  const startEdit = (note) => {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
    setShowForm(true);
  };

  /* ---------------- UTIL ---------------- */

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // ---------------- BULLET HANDLING ----------------
  const handleContentChange = (e) => {
    const textarea = e.target;
    let value = textarea.value;
    const selectionStart = textarea.selectionStart;

    // If empty, start with bullet
    if (value === "") {
      setContent("• ");
      return;
    }

    // Get the line where the cursor is
    const beforeCursor = value.slice(0, selectionStart);
    const afterCursor = value.slice(selectionStart);

    const lines = beforeCursor.split("\n");
    const currentLine = lines[lines.length - 1];

    // If user pressed Enter at any line, add bullet
    if (currentLine === "" || currentLine === "• ") {
      setContent(beforeCursor + "• " + afterCursor);

      // Move cursor to after the bullet
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          beforeCursor.length + 2;
      }, 0);
      return;
    }

    // If user pressed Enter at the very end
    if (value.endsWith("\n")) {
      setContent(value + "• ");
      return;
    }

    // Otherwise just set content
    setContent(value);
  };

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    if (token) {
      scheduleAutoLogout(token);
      fetchNotes(token);
    }
  }, []);

  /* ---------------- UI ---------------- */

  if (!token) {
    return (
      <div className="auth">
        <h2>Login / Register</h2>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Notes</h1>
        <div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setTitle("");
              setContent("• "); // start new note with bullet
            }}
          >
            ＋
          </button>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {showForm && (
        <div className="note-form">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="• Start typing..."
            value={content}
            onChange={handleContentChange}
          />
          <button onClick={saveNote}>
            {editingId ? "Update Note" : "Add Note"}
          </button>
        </div>
      )}

      <div className="notes">
        {notes.map((note) => (
          <div key={note._id} className="note">
            <h3>{note.title}</h3>
            <ul>
              {note.content
                .split("\n")
                .filter(Boolean)
                .map((line, i) => (
                  <li key={i}>{line.replace(/^•\s?/, "")}</li>
                ))}
            </ul>
            <small className="timestamp">
              Last updated: {formatDate(note.updatedAt)}
            </small>
            <div className="actions">
              <button onClick={() => startEdit(note)}>Edit</button>
              <button onClick={() => deleteNote(note._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
