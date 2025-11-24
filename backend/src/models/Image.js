// backend/src/models/Image.js
import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  id: { type: String, default: "default" },
  descricao: { type: String, default: "default" },
  grupo: { type: String, default: "default" },
  imagens: [
  {
    name: String,
    gridFsId: String, // novo campo
    approved: { type: Boolean, default: false },
    rejected: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }
]
});

export default mongoose.model("Image", imageSchema);