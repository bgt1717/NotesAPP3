import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";


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

  /* ---------------- LOGOUT ---------------- */
  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setNotes([]);
    alert("Session expired. Please log in again.");
  };

  /* ---------------- AUTO LOGOUT ---------------- */
  const scheduleAutoLogout = (jwtToken) => {
    try {
      const decoded = jwtDecode(jwtToken);
      const expiresAt = decoded.exp * 1000;
      const timeLeft = expiresAt - Date.now();

      if (timeLeft <= 0) {
        logout();
        return;
      }

      setTimeout(logout, timeLeft);
    } catch {
      logout();
    }
  };

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

    if (res.status === 401) {
      logout();
      return;
    }

    const data = await res.json();
    setNotes(data);
  };

  const openAddForm = () => {
    setShowAddForm(true);
    setTitle("");
    setContent("• ");
  };

  const addNote = async () => {
    await fetch(`${API}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

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
    setEditContent(note.content);
  };

  const saveEdit = async (id) => {
    await fetch(`${API}/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: editTitle,
        content: editContent,
      }),
    });

    setEditingId(null);
    fetchNotes();
  };

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (token) {
      scheduleAutoLogout(token);
      fetchNotes(token);
    }
  }, []);

  /* ---------------- RENDER ---------------- */
  if (!token) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Login / Register</h1>
        <input
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
      <button
        onClick={openAddForm}
        style={{
          marginLeft: "1rem",
          fontSize: "1.5rem",
          borderRadius: "50%",
        }}
      >
        +
      </button>

      {showAddForm && (
        <div style={{ marginTop: "1rem" }}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setContent((prev) => prev + "\n• ");
              }
            }}
            style={{ width: "300px", minHeight: "80px" }}
          />
          <br />
          <button onClick={addNote}>Add</button>
        </div>
      )}

      <hr />

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {notes.map((note) => (
          <div key={note._id} style={{ border: "1px solid #ccc", padding: "1rem", width: "220px" }}>
            {editingId === note._id ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
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
                  style={{ width: "100%", minHeight: "80px" }}
                />
                <button onClick={() => saveEdit(note._id)}>Save</button>
              </>
            ) : (
              <>
                <h3>{note.title}</h3>
                <ul>
                  {note.content
                    .split("\n")
                    .map((line, i) => (
                      <li key={i}>{line.replace(/^• /, "")}</li>
                    ))}
                </ul>
                <button onClick={() => startEdit(note)}>Edit</button>
                <button onClick={() => deleteNote(note._id)}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
