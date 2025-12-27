import { useEffect, useState } from "react";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Fetch all notes from the database
  const fetchNotes = async () => {
    try {
      const res = await fetch("http://localhost:5000/notes");
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  // Run once when the app loads
  useEffect(() => {
    fetchNotes();
  }, []);

  // Send a new note to the server
  const addNote = async () => {
    try {
      await fetch("http://localhost:5000/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      setTitle("");
      setContent("");

      // Re-fetch all notes from DB
      fetchNotes();
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Notes App</h1>

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
          <h3>{note.title}</h3>
          <p>{note.content}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
