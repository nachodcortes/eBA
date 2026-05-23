const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    contrasenia: {
      type: String,
      required: true,
    },
    edad: {
      type: Number,
    },
    ubicacionAproximada: {
      type: Object,
    },
    bio: {
      type: String,
    },
    instagram: {
      type: String,
    },
    fotoPerfil: {
      type: String,
    },
    intereses: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

usuarioSchema.pre("save", async function (next) {
  if (!this.isModified("contrasenia")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.contrasenia = await bcrypt.hash(this.contrasenia, salt);

  next();
});

usuarioSchema.methods.compararContrasenia = async function (contraseniaIngresada) {
  return await bcrypt.compare(contraseniaIngresada, this.contrasenia);
};

module.exports = mongoose.model("Usuario", usuarioSchema, "usuarios");