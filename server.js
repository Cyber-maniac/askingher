const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const submissionsFile = path.join(__dirname, 'submissions.txt');

// Helper to append submission to local file
function saveSubmission(phone){
  const line = `${new Date().toISOString()} ${phone}\n`;
  fs.appendFile(submissionsFile, line, (err) => {
    if(err) console.error('Failed to save submission', err);
  });
}

// POST /submit receives JSON { phone: '...' }
app.post('/submit', async (req, res) => {
  try{
    const { phone } = req.body || {};
    if(!phone) return res.status(400).json({ error: 'phone is required' });

    // Save locally
    saveSubmission(phone);

    // If Twilio credentials are provided, send an SMS to the configured admin number
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, ADMIN_PHONE } = process.env;
    if(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM && ADMIN_PHONE){
      try{
        const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        await twilio.messages.create({
          body: `New phone submission: ${phone}`,
          from: TWILIO_FROM,
          to: ADMIN_PHONE
        });
      } catch(err){
        console.error('Twilio send failed', err);
      }
    }

    return res.json({ ok: true });
  } catch(err){
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
});

// Serve the static landing page and any public assets
app.use(express.static(path.join(__dirname)));

// Health check for Render and monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'AskingHer receiver' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'q1.html'));
});

// Serve the phone page manually so the Next button works
app.get('/phonenumber.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'phonenumber.html'));
});

// Fallback for any other route to send the main landing page
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'q1.html'));
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
