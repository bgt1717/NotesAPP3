import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Book schema
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
});


const Book = mongoose.model("Book", bookSchema);

// Routes
app.get("/books", async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

app.post("/books", async (req, res) => {
  const book = new Book(req.body);
  await book.save();
  res.json(book);
});

app.delete("/books/:id", async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: "Book withdrawn" });
});

// Server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});