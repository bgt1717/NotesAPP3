import { useEffect, useState } from "react";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Track which note is being edited
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Fetch all notes
  const fetchNotes = async () => {
    const res = await fetch("http://localhost:5000/notes");
    const data = await res.json();
    setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Add new note
  const addNote = async () => {
    await fetch("http://localhost:5000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    setTitle("");
    setContent("");
    fetchNotes();
  };

  // Delete note
  const deleteNote = async (id) => {
    await fetch(`http://localhost:5000/notes/${id}`, {
      method: "DELETE",
    });
    fetchNotes();
  };

  // Start editing
  const startEdit = (note) => {
    setEditingId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  // Save updated note
  const saveEdit = async (id) => {
    await fetch(`http://localhost:5000/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        content: editContent,
      }),
    });

    setEditingId(null);
    fetchNotes();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Notes App</h1>

      {/* Create note */}
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

      <h2>All Notes</h2>

      {notes.map((note) => (
        <div
          key={note._id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          {/* Edit mode */}
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
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </>
          ) : (
            <>
              {/* View mode */}
              <h3>{note.title}</h3>
              <p>{note.content}</p>

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
  );
}

export default App;
