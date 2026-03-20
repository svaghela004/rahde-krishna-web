// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// File to store data
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Utility: load data
function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE);
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load data', err);
    return [];
  }
}

// Utility: save data
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Routes
app.get('/api/data', (req, res) => {
  const data = loadData();
  res.json(data);
});

app.post('/api/data', (req, res) => {
  const payload = req.body;
  const data = loadData();
  // add unique backendId
  payload.__backendId = `server-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  data.push(payload);
  saveData(data);
  res.json({ isOk: true });
});

app.delete('/api/data/:id', (req, res) => {
  const id = req.params.id;
  const data = loadData();
  const newData = data.filter(d => d.__backendId !== id);
  saveData(newData);
  res.json({ isOk: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});