const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbFile = path.join(__dirname, 'database.json');

// Default DB structure
const defaultDb = {
  users: [
    {
      id: 1,
      username: 'trannhuy',
      password: bcrypt.hashSync('admin', 10)
    }
  ],
  settings: {
    avatar_url: 'assets/images/avatar.png',
    bio: 'Creating digital experiences that blend technology and art.'
  },
  skills: [
    { id: 1, icon: 'atom', name: 'React / Next.js', description: 'Building fast, scalable SPAs and SSR apps', display_order: 0 },
    { id: 2, icon: 'palette', name: 'CSS / Tailwind', description: 'Responsive layouts & modern design systems', display_order: 1 },
    { id: 3, icon: 'sparkles', name: 'GSAP / Framer', description: 'Smooth animations & micro-interactions', display_order: 2 },
    { id: 4, icon: 'globe', name: 'Three.js / WebGL', description: '3D graphics & immersive web experiences', display_order: 3 }
  ],
  projects: []
};

// Ensure DB file exists
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify(defaultDb, null, 2));
}

// Helper functions to read/write JSON
function readDB() {
  const data = fs.readFileSync(dbFile, 'utf8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

// Database API to mimic simple async queries
module.exports = {
  getUser: (username) => {
    const db = readDB();
    return db.users.find(u => u.username === username);
  },
  
  getSettings: () => {
    return readDB().settings;
  },
  
  updateSetting: (key, value) => {
    const db = readDB();
    db.settings[key] = value;
    writeDB(db);
  },
  
  getSkills: () => {
    const db = readDB();
    return db.skills.sort((a, b) => a.display_order - b.display_order);
  },
  
  addSkill: (skill) => {
    const db = readDB();
    skill.id = Date.now(); // Simple ID generation
    if (!skill.display_order) skill.display_order = 0;
    db.skills.push(skill);
    writeDB(db);
    return skill.id;
  },
  
  deleteSkill: (id) => {
    const db = readDB();
    db.skills = db.skills.filter(s => s.id !== parseInt(id));
    writeDB(db);
  },
  
  getProjects: () => {
    const db = readDB();
    return db.projects.sort((a, b) => a.display_order - b.display_order);
  },
  
  addProject: (project) => {
    const db = readDB();
    project.id = Date.now();
    if (!project.display_order) project.display_order = 0;
    db.projects.push(project);
    writeDB(db);
    return project.id;
  },
  
  deleteProject: (id) => {
    const db = readDB();
    db.projects = db.projects.filter(p => p.id !== parseInt(id));
    writeDB(db);
  }
};
