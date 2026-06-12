const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const enviarEmail = async ({ para, asunto, texto }) => {
  try {
    const info = await transporter.sendMail({
      from: `"eBA" <${process.env.EMAIL_USER}>`,
      to: para,
      subject: asunto,
      text: texto,
    });

    console.log("Email enviado correctamente:", info.messageId);
    return info;
  } catch (error) {
    console.log("ERROR ENVIANDO EMAIL:");
    console.log(error.message);
    throw error;
  }
};

module.exports = enviarEmail;