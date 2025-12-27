// Import Express – the web framework we use to create the API
import express from "express";

// Import Mongoose – used to connect to MongoDB and define schemas/models
import mongoose from "mongoose";

// Import CORS – allows your frontend to talk to this backend
import cors from "cors";

// Import dotenv – lets us use environment variables from a .env file
import dotenv from "dotenv";

// Load environment variables (MONGO_URI, etc.)
dotenv.config();

// Create an Express application
const app = express();

// Enable CORS for all routes
app.use(cors());

// Enable JSON body parsing (req.body)
app.use(express.json());


/* --------------------- DATABASE CONNECTION --------------------- */

// Connect to MongoDB using the connection string from .env
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* --------------------- NOTE SCHEMA --------------------- */

// A Schema defines the shape of documents in a MongoDB collection
const noteSchema = new mongoose.Schema(
  {
    // Title of the note (required)
    title: {
      type: String,
      required: true,
    },

    // Main text content of the note (required)
    content: {
      type: String,
      required: true,
    },

    // Whether the note is pinned or not
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

/*
  Create a Model from the schema.
  - "Note" is the model name
  - MongoDB will create a "notes" collection automatically
*/
const Note = mongoose.model("Note", noteSchema);

/* --------------------- ROUTES --------------------- */

/**
 * GET /notes
 * Fetch all notes from the database
 */

app.get("/", (req, res) => {
  res.send("Notes API is running");
});
app.get("/notes", async (req, res) => {
  try {
    // Find all notes and sort pinned ones first, newest first
    const notes = await Note.find().sort({
      pinned: -1,
      createdAt: -1,
    });

    // Send the notes as JSON
    res.json(notes);
  } catch (err) {
    // If something goes wrong, return a 500 error
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /notes
 * Create a new note
 */
app.post("/notes", async (req, res) => {
  try {
    /*
      req.body should look like:
      {
        "title": "My Note",
        "content": "This is my note",
        "pinned": true
      }
    */

    // Create a new Note document
    const note = new Note(req.body);

    // Save it to MongoDB
    await note.save();

    // Return the saved note with a 201 (created) status
    res.status(201).json(note);
  } catch (err) {
    // Validation errors end up here
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /notes/:id
 * Update an existing note
 */
app.put("/notes/:id", async (req, res) => {
  try {
    // Find the note by ID and update it
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id, // ID from the URL
      req.body,      // New data
      { new: true }  // Return the updated document
    );

    // Send back the updated note
    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /notes/:id
 * Delete a note
 */
app.delete("/notes/:id", async (req, res) => {
  try {
    // Remove the note from MongoDB
    await Note.findByIdAndDelete(req.params.id);

    // Send confirmation
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* --------------------- SERVER START --------------------- */

// Start the server on port 5000
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
