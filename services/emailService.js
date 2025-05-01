// services/emailService.js
const nodemailer = require('nodemailer')
 require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

transporter.verify((error, success) => {
  if (error) {
    console.error('Erreur de connexion SMTP :', error)
  } else {
    console.log('Transporteur email prêt à envoyer !')
  }
})

module.exports = transporter
