import { useState } from "react";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const sendNote = async () => {
    try {
      const response = await fetch("http://localhost:5000/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const data = await response.json();
      console.log("Saved note:", data);

      alert("Note sent to server!");
      setTitle("");
      setContent("");
    } catch (err) {
      console.error("Error sending note:", err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Send Note</h1>

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

      <button onClick={sendNote}>Send to Server</button>
    </div>
  );
}

export default App;
