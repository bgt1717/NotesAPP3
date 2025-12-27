import { useEffect, useState } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [notes, setNotes] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const API = "http://localhost:5000";

  /* ---------------- AUTH ---------------- */
  const register = async () => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    alert(data.message);
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
      fetchNotes();
    } else {
      alert(data.message || "Login failed");
    }
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setNotes([]);
  };

  /* ---------------- NOTES ---------------- */
  const fetchNotes = async () => {
    if (!token) return;
    const res = await fetch(`${API}/notes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setNotes(data);
  };

  const openAddForm = () => {
    setShowAddForm(true);
    setTitle("");
    setContent("• "); // start with bullet
  };

  const addNote = async () => {
    if (!title || !content) return;
    await fetch(`${API}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });
    setTitle("");
    setContent("");
    setShowAddForm(false);
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
    setEditTitle(note.title);
    setEditContent(note.content.startsWith("• ") ? note.content : "• " + note.content);
  };

  const saveEdit = async (id) => {
    await fetch(`${API}/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: editTitle, content: editContent }),
    });
    setEditingId(null);
    fetchNotes();
  };

  useEffect(() => {
    if (token) fetchNotes();
  }, [token]);

  /* ---------------- RENDER ---------------- */
  if (!token) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Login / Register</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />
        <button onClick={login}>Login</button>
        <button onClick={register} style={{ marginLeft: "1rem" }}>
          Register
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Your Notes</h1>
      <button onClick={logout}>Logout</button>

      {/* + Button */}
      <button
        onClick={openAddForm}
        style={{
          marginLeft: "1rem",
          fontSize: "1.5rem",
          padding: "0.5rem 1rem",
          borderRadius: "50%",
          cursor: "pointer",
        }}
      >
        +
      </button>

      {/* Collapsible Add Note Form */}
      {showAddForm && (
        <div style={{ marginTop: "1rem", marginBottom: "2rem" }}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ display: "block", width: "300px", marginBottom: "0.5rem" }}
          />
          <textarea
            placeholder="Content (one line per bullet)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setContent((prev) => prev + "\n• ");
              }
            }}
            style={{ display: "block", width: "300px", marginBottom: "0.5rem", minHeight: "80px" }}
          />
          <button onClick={addNote}>Add Note</button>
        </div>
      )}

      <hr />

      {/* Notes */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {notes.map((note) => (
          <div
            key={note._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              width: "220px",
              position: "relative",
              minHeight: "100px",
            }}
          >
            {editingId === note._id ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Edit title"
                  style={{ width: "100%", marginBottom: "0.5rem" }}
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setEditContent((prev) => prev + "\n• ");
                    }
                  }}
                  placeholder="Edit content, one line per bullet"
                  style={{ width: "100%", minHeight: "80px", marginBottom: "0.5rem" }}
                />
                <button onClick={() => saveEdit(note._id)}>Save</button>
                <button onClick={() => setEditingId(null)} style={{ marginLeft: "0.5rem" }}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h3>{note.title}</h3>
                <ul style={{ paddingLeft: "1rem" }}>
                  {note.content
                    .split(/\n/)
                    .filter((line) => line.trim() !== "")
                    .map((line, index) => (
                      <li key={index}>{line.replace(/^• /, "").trim()}</li>
                    ))}
                </ul>
                <button onClick={() => startEdit(note)}>Edit</button>
                <button
                  onClick={() => deleteNote(note._id)}
                  style={{ marginLeft: "0.5rem", background: "red", color: "white" }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
