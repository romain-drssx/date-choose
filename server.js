const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Server is running' });
});

app.post('/api/date', async (req, res) => {
  const { date, time, activity } = req.body;

  if (!date || !time || !activity) {
    return res.status(400).json({ error: 'Date, heure et activité sont requis.' });
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    return res.status(500).json({
      error: 'Configuration email manquante. Mets GMAIL_USER et GMAIL_PASS dans le fichier .env.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailTo = process.env.EMAIL_TO || 'dudu.romain.8@gmail.com';

    const info = await transporter.sendMail({
      from: `"Date surprise" <${process.env.GMAIL_USER}>`,
      to: mailTo,
      subject: 'Nouvelle date proposée',
      text: [
        'Nouvelle date proposée :',
        '',
        `Date : ${date}`,
        `Heure : ${time}`,
        `Activité : ${activity}`,
        '',
        'Bonne chance !'
      ].join('\n')
    });

    res.json({ ok: true, messageId: info.messageId });
  } catch (error) {
    console.error('Erreur envoi email:', error);
    res.status(500).json({ error: 'L’envoi du mail a échoué.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
