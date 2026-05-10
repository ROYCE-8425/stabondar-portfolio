const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8000;
const SECRET_KEY = 'super-secret-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(express.json());
// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Set up Multer for avatar uploads directly to public/assets/images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/assets/images'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- AUTH MIDDLEWARE ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (token == null) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}

// --- PUBLIC ROUTES (Frontend Data) ---
app.get('/api/data', (req, res) => {
  try {
    const data = {
      settings: db.getSettings(),
      skills: db.getSkills(),
      projects: db.getProjects()
    };
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN API ROUTES ---

// Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.getUser(username);
  
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  if (bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Verify token
app.get('/api/admin/verify', authenticateToken, (req, res) => {
  res.json({ success: true, username: req.user.username });
});

// Update Settings (Bio, Contact, etc.)
app.post('/api/admin/settings', authenticateToken, (req, res) => {
  const { key, value } = req.body;
  try {
    db.updateSetting(key, value);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload Avatar
app.post('/api/admin/upload-avatar', authenticateToken, upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const avatarUrl = 'assets/images/' + req.file.filename;
  
  try {
    db.updateSetting('avatar_url', avatarUrl);
    res.json({ success: true, avatar_url: avatarUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Skill
app.post('/api/admin/skills', authenticateToken, (req, res) => {
  try {
    const id = db.addSkill(req.body);
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Skill
app.delete('/api/admin/skills/:id', authenticateToken, (req, res) => {
  try {
    db.deleteSkill(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Project
app.post('/api/admin/projects', authenticateToken, (req, res) => {
  try {
    const id = db.addProject(req.body);
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Project
app.delete('/api/admin/projects/:id', authenticateToken, (req, res) => {
  try {
    db.deleteProject(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Default fallback to serve index.html for unknown routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`CMS Server is running on http://localhost:${PORT}`);
});
