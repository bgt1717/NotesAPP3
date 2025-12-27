import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Import models
import User from "./models/User.js";
import Note from "./models/Note.js";

// Import JWT middleware
import authMiddleware from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* --------------------- DATABASE --------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

/* --------------------- AUTH ROUTES --------------------- */

// Register new user
app.post("/auth/register", async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Login user
app.post("/auth/login", async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* --------------------- NOTES ROUTES (PROTECTED) --------------------- */

// Get all notes for logged-in user
app.get("/notes", authMiddleware, async (req, res) => {
  const notes = await Note.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(notes);
});

// Create a new note for logged-in user
app.post("/notes", authMiddleware, async (req, res) => {
  const note = new Note({
    title: req.body.title,
    content: req.body.content,
    user: req.userId,
  });

  await note.save();
  res.status(201).json(note);
});

// Update a note (only owner)
app.put("/notes/:id", authMiddleware, async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true }
  );

  if (!note) return res.status(404).json({ message: "Note not found" });

  res.json(note);
});

// Delete a note (only owner)
app.delete("/notes/:id", authMiddleware, async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.userId });

  if (!note) return res.status(404).json({ message: "Note not found" });

  res.json({ message: "Note deleted" });
});

/* --------------------- SERVER START --------------------- */

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
