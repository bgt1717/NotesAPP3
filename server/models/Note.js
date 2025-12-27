import mongoose from "mongoose";

// Note schema
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    pinned: {
      type: Boolean,
      default: false,
    },

    // This will be used later for user ownership
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Export the Note model
export default mongoose.model("Note", noteSchema);
