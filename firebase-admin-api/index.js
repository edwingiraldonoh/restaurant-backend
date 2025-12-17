require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.SERVICE_ACCOUNT_PATH) {
  console.error('Set SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS env var pointing to the service account JSON file.');
  process.exit(1);
}

const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Middleware simple para autenticar con una API key (evitar exposición pública)
const API_KEY = process.env.API_KEY || 'dev-key';
app.use((req, res, next) => {
  const key = req.header('x-api-key') || req.query.apiKey;
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

app.post('/set-role/:uid', async (req, res) => {
  const { uid } = req.params;
  const { role, adminClaim } = req.body;
  try {
    const claims = {};
    if (role) claims.role = String(role).toUpperCase();
    if (adminClaim !== undefined) claims.admin = !!adminClaim;

    await admin.auth().setCustomUserClaims(uid, claims);
    return res.json({ ok: true, uid, claims });
  } catch (err) {
    console.error('Error setting claims', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Endpoint para listar usuarios (sólo accesible con API_KEY)
app.get('/list-users', async (req, res) => {
  try {
    const maxResults = parseInt(req.query.maxResults) || 1000;
    const list = [];
    // paginar con listUsers
    let result = await admin.auth().listUsers(1000);
    result.users.forEach(u => list.push(u.toJSON()));
    while (result.pageToken) {
      result = await admin.auth().listUsers(1000, result.pageToken);
      result.users.forEach(u => list.push(u.toJSON()));
      if (list.length >= maxResults) break;
    }
    return res.json({ ok: true, users: list.slice(0, maxResults) });
  } catch (err) {
    console.error('Error listing users', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

const port = process.env.PORT || 4001;
app.listen(port, () => console.log(`Firebase Admin API listening on ${port}`));
