import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./App.css";

const API = "http://localhost:5000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [notes, setNotes] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const fetchNotes = async (jwt = token) => {
    if (!jwt) return;
    const res = await fetch(`${API}/notes`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const data = await res.json();
    setNotes(data);
  };

  const saveNote = async () => {
    const method = editingId && editingId !== "new" ? "PUT" : "POST";
    const url =
      editingId && editingId !== "new"
        ? `${API}/notes/${editingId}`
        : `${API}/notes`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    const updatedNote = await res.json();

    setTitle("");
    setContent("");
    setEditingId(null);

    if (editingId && editingId !== "new") {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === updatedNote._id ? updatedNote : note
        )
      );
    } else {
      setNotes((prevNotes) => [updatedNote, ...prevNotes]);
    }
  };

  const deleteNote = async (id) => {
    await fetch(`${API}/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotes((prevNotes) => prevNotes.filter((note) => note._id !== id));
  };

  const startEdit = (note) => {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
  };

  const addNewNote = () => {
    setEditingId("new");
    setTitle("");
    setContent("• ");
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const handleContentChange = (e) => {
    const textarea = e.target;
    let value = textarea.value;
    const selectionStart = textarea.selectionStart;

    if (value === "") {
      setContent("• ");
      return;
    }

    const beforeCursor = value.slice(0, selectionStart);
    const afterCursor = value.slice(selectionStart);
    const lines = beforeCursor.split("\n");
    const currentLine = lines[lines.length - 1];

    if (currentLine === "" || currentLine === "• ") {
      setContent(beforeCursor + "• " + afterCursor);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = beforeCursor.length + 2;
      }, 0);
      return;
    }

    if (value.endsWith("\n")) {
      setContent(value + "• ");
      return;
    }

    setContent(value);
  };

  useEffect(() => {
    if (token) {
      scheduleAutoLogout(token);
      fetchNotes(token);
    }
  }, []);

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
          <button onClick={addNewNote}>＋</button>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="notes">
        {editingId === "new" && (
          <div className="note">
            <input
              className="note-input"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="note-textarea"
              placeholder="• Start typing..."
              value={content}
              onChange={handleContentChange}
            />
            <div className="actions">
              <button onClick={saveNote}>Add Note</button>
              <button
                onClick={() => {
                  setEditingId(null);
                  setTitle("");
                  setContent("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {notes.map((note) => (
          <div key={note._id} className="note">
            {editingId === note._id ? (
              <>
                <input
                  className="note-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  className="note-textarea"
                  value={content}
                  onChange={handleContentChange}
                />
                <div className="actions">
                  <button onClick={saveNote}>Save</button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setTitle("");
                      setContent("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
