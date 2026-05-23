const mongoose = require("mongoose");

const asistenciaSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    eventoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evento",
      required: true,
    },
    estado: {
      type: String,
      enum: ["voy", "interesado", "cancelado"],
      default: "voy",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Asistencia", asistenciaSchema, "asistencias");