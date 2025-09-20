// models/Image.js
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  id: { type: String, default: "default" },
  descricao: { type: String, default: "default" },
  grupo: { type: String, default: "default" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Image", imageSchema);
