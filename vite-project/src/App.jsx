import { useState, useEffect } from "react";
// Vite-compatible jwt-decode import
import { default as jwtDecode } from "jwt-decode";
import "./App.css";

const API = "http://localhost:5000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Decode JWT whenever token changes
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error("Invalid token", err);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  // Fetch notes for logged-in user
  useEffect(() => {
    if (token) {
      fetch(`${API}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setNotes(data))
        .catch((err) => console.error(err));
    }
  }, [token]);

  // Add new note
  const handleAddNote = async () => {
    if (!title || !content) return;

    const res = await fetch(`${API}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    const newNote = await res.json();
    setNotes([...notes, newNote]);
    setTitle("");
    setContent("");
  };

  // Delete note
  const handleDelete = async (id) => {
    await fetch(`${API}/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotes(notes.filter((note) => note._id !== id));
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } else {
      alert(data.message || "Login failed");
    }
  };

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setIsRegistering(false);
    } else {
      alert(data.message || "Registration failed");
    }
  };

  // Auth form
  if (!user) {
    return (
      <div className="auth">
        <h2>{isRegistering ? "Register" : "Login"}</h2>
        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          <input placeholder="Email" name="email" type="email" required />
          <input placeholder="Password" name="password" type="password" required />
          <button type="submit">{isRegistering ? "Register" : "Login"}</button>
        </form>
        <p style={{ marginTop: "10px" }}>
          {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            style={{
              background: "none",
              border: "none",
              color: "#2196f3",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
              fontSize: "1rem",
            }}
          >
            {isRegistering ? "Login" : "Register"}
          </button>
        </p>
      </div>
    );
  }

  // Notes app
  return (
    <div style={{ padding: "20px" }}>
      <header>
        <h1>Notes App</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <div className="note-form">
        <input
          className="note-input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="note-textarea"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        <button onClick={handleAddNote}>Add Note</button>
      </div>

      <div className="notes">
        {notes.map((note) => (
          <div className="note" key={note._id}>
            <h3>{note.title}</h3>
            <ul>
              {note.content.split("\n").map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
            <div className="timestamp">
              Last updated: {new Date(note.updatedAt).toLocaleString()}
            </div>
            <div className="actions">
              <button onClick={() => handleDelete(note._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
