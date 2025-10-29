// backend/src/models/Image.js
import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  id: { type: String, default: "default" },
  descricao: { type: String, default: "default" },
  grupo: { type: String, default: "default" },
  imagens: [
    {
      name: { type: String, required: true },
      approved: { type: Boolean, default: false },
      rejected: { type: Boolean, default: false }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  __v: { type: Number, default: 0 } // Campo de versão do Mongoose
});

export default mongoose.model("Image", imageSchema);