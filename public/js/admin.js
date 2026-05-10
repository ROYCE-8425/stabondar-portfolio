document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('cms_token');
  
  if (token) {
    verifyToken(token);
  } else {
    showLogin();
  }

  // Login handler
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('cms_token', data.token);
        verifyToken(data.token);
      } else {
        document.getElementById('login-error').classList.remove('hidden');
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Logout handler
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('cms_token');
    showLogin();
  });

  // Fetch Admin Data
  async function loadDashboard() {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      
      // Populate Settings
      document.getElementById('current-avatar').src = data.settings.avatar_url || '';
      document.getElementById('bio-input').value = data.settings.bio || '';

      // Populate Skills
      const skillsList = document.getElementById('skills-list');
      skillsList.innerHTML = '';
      data.skills.forEach(skill => {
        skillsList.innerHTML += `
          <div class="flex justify-between items-center bg-gray-800 p-3 rounded">
            <div>
              <span class="font-bold">${skill.name}</span>
              <p class="text-sm text-gray-400">${skill.description}</p>
            </div>
            <button onclick="deleteSkill(${skill.id})" class="text-red-500 hover:text-red-400 px-2 py-1 bg-red-900/30 rounded">Delete</button>
          </div>
        `;
      });
      // Populate Projects
      const projectsList = document.getElementById('projects-list');
      if(projectsList) {
        projectsList.innerHTML = '';
        data.projects.forEach(proj => {
          projectsList.innerHTML += `
            <div class="bg-gray-800 p-3 rounded flex flex-col justify-between">
              <div>
                <img src="${proj.image_url}" class="w-full h-24 object-cover rounded mb-2 border border-gray-600">
                <h4 class="font-bold truncate">${proj.title}</h4>
                <p class="text-xs text-gray-400">${proj.tags}</p>
              </div>
              <button onclick="deleteProject(${proj.id})" class="mt-2 text-red-500 hover:text-red-400 py-1 bg-red-900/30 rounded w-full text-sm">Delete</button>
            </div>
          `;
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  window.deleteSkill = async function(id) {
    if (!confirm('Are you sure?')) return;
    await fetch('/api/admin/skills/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('cms_token') }
    });
    loadDashboard();
  };

  window.deleteProject = async function(id) {
    if (!confirm('Are you sure?')) return;
    await fetch('/api/admin/projects/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('cms_token') }
    });
    loadDashboard();
  };

  // Avatar Upload
  document.getElementById('avatar-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('avatar-file');
    if (!fileInput.files[0]) return alert('Select an image first!');
    
    const formData = new FormData();
    formData.append('avatar', fileInput.files[0]);

    try {
      const res = await fetch('/api/admin/upload-avatar', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('cms_token') },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert('Avatar updated successfully!');
        loadDashboard();
      }
    } catch (err) { console.error(err); }
  });

  // Settings Save
  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const bio = document.getElementById('bio-input').value;
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('cms_token') },
      body: JSON.stringify({ key: 'bio', value: bio })
    });
    alert('Settings saved!');
  });

  // Add Skill
  document.getElementById('add-skill-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('skill-name').value,
      description: document.getElementById('skill-desc').value
    };
    await fetch('/api/admin/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('cms_token') },
      body: JSON.stringify(payload)
    });
    document.getElementById('add-skill-form').reset();
    loadDashboard();
  });

  // Add Project
  const projForm = document.getElementById('add-project-form');
  if(projForm) {
    projForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById('proj-title').value,
        tags: document.getElementById('proj-tags').value,
        image_url: document.getElementById('proj-image').value
      };
      await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('cms_token') },
        body: JSON.stringify(payload)
      });
      document.getElementById('add-project-form').reset();
      loadDashboard();
    });
  }

  // Utility
  async function verifyToken(token) {
    try {
      const res = await fetch('/api/admin/verify', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        showDashboard();
        loadDashboard();
      } else {
        showLogin();
      }
    } catch (err) { showLogin(); }
  }

  function showLogin() {
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
  }

  function showDashboard() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
  }
});
