// server.js
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors());                 // permite llamar desde file:// o http://localhost
app.use(express.json());

// Transport Gmail via SMTP (usa App Password, ver .env)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // tu Gmail
    pass: process.env.EMAIL_PASS  // App Password (no tu password normal)
  }
});

app.post("/send-receipt", async (req, res) => {
  try {
    const { to, user_name, method, details, items, total } = req.body;

    if (!to || !user_name || !method || !total) {
      return res.status(400).json({ ok: false, error: "Datos incompletos" });
    }

    const subject = "Comprobante de compra - " + user_name;

    const text =
      "Hola " + user_name + ",\n\n" +
      "Tu transaccion fue registrada como exitosa.\n\n" +
      "Metodo: " + method + "\n" +
      "Detalles: " + (details || "N/D") + "\n\n" +
      "Pedido:\n" + (items || "N/D") + "\n\n" +
      "Total: " + total + "\n\n" +
      "Gracias por tu compra.";

    const html =
      "<p>Hola <b>" + user_name + "</b>,</p>" +
      "<p>Tu transacción fue registrada como exitosa.</p>" +
      "<p><b>Método:</b> " + method + "<br>" +
      "<b>Detalles:</b> " + (details || "N/D") + "</p>" +
      "<p><b>Pedido:</b><br>" +
      (items ? items.replace(/\n/g, "<br>") : "N/D") + "</p>" +
      "<p><b>Total:</b> " + total + "</p>" +
      "<p>Gracias por tu compra.</p>";

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,            // tu Gmail de destino
      subject: subject,
      text: text,
      html: html
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Mailer error:", err);
    return res.status(500).json({ ok: false, error: "No se pudo enviar el correo" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Mail server listo en http://localhost:" + PORT);
});
