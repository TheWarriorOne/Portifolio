// models/Image.js
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  id: { type: String, default: "default" },
  descricao: { type: String, default: "default" },
  grupo: { type: String, default: "default" },
  imagens: [{ type: String, required: true }], // Array de nomes de arquivos
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Image", imageSchema);