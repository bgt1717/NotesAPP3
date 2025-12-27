import mongoose from "mongoose";

// User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
});

// Export the User model
export default mongoose.model("User", userSchema);
