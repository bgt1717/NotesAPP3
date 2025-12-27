import { useEffect, useState } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Edit note state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const API = "http://localhost:5000";

  // --- Auth functions ---

  const register = async () => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const login = async () => {
    try {
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
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setNotes([]);
  };

  // --- Notes functions ---

  const fetchNotes = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addNote = async () => {
    try {
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
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`${API}/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (note) => {
    setEditingId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const saveEdit = async (id) => {
    try {
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
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch notes on login
  useEffect(() => {
    if (token) fetchNotes();
  }, [token]);

  // --- Render ---
  if (!token) {
    // Login/Register form
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
      <br /><br />
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br /><br />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <br /><br />
      <button onClick={addNote}>Add Note</button>

      <hr />

      {notes.map((note) => (
        <div
          key={note._id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          {editingId === note._id ? (
            <>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <br /><br />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <br /><br />
              <button onClick={() => saveEdit(note._id)}>Save</button>
              <button onClick={() => setEditingId(null)} style={{ marginLeft: "1rem" }}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <button onClick={() => startEdit(note)}>Edit</button>
              <button
                onClick={() => deleteNote(note._id)}
                style={{ marginLeft: "1rem", background: "red", color: "white" }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default App;
