/**
 * Fetch Data from CMS API and inject into DOM
 * Dispatches 'cmsDataLoaded' when complete so animations can start.
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('API down');
    const data = await res.json();

    // 1. Update Avatar
    const avatarImg = document.querySelector('.hero__avatar');
    if (avatarImg && data.settings.avatar_url) {
      avatarImg.src = data.settings.avatar_url;
    }

    // 2. Update Bio
    const bioText = document.querySelector('.about__text');
    if (bioText && data.settings.bio) {
      bioText.textContent = data.settings.bio;
    }

    // 3. Update Skills
    const skillsGrid = document.querySelector('.skills__grid');
    if (skillsGrid && data.skills && data.skills.length > 0) {
      skillsGrid.innerHTML = ''; // Clear hardcoded skills
      data.skills.forEach(skill => {
        const skillCard = document.createElement('div');
        skillCard.className = 'skill-card';
        skillCard.innerHTML = `
          <h3 class="skill-card__name">${skill.name}</h3>
          <p class="skill-card__desc">${skill.description}</p>
        `;
        skillsGrid.appendChild(skillCard);
      });
      // Re-initialize lucide icons for newly injected HTML
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }

    // 4. Update Projects
    const projectsScroll = document.getElementById('horizontal-scroll');
    const projectsCount = document.querySelector('.projects-section__count');
    if (projectsScroll && data.projects && data.projects.length > 0) {
      projectsScroll.innerHTML = '';
      if (projectsCount) projectsCount.textContent = `(${data.projects.length < 10 ? '0' : ''}${data.projects.length})`;
      
      data.projects.forEach((proj, index) => {
        const num = index + 1;
        const formattedNum = num < 10 ? '0' + num : num;
        
        const card = document.createElement('div');
        card.className = 'project-card';
        card.setAttribute('data-cursor-hover', '');
        card.innerHTML = `
          <div class="project-card__num">#${formattedNum}</div>
          <div class="project-card__image-wrap">
            <img class="project-card__image" src="${proj.image_url}" alt="${proj.title}" id="project-img-${proj.id}">
          </div>
          <div class="project-card__info">
            <h3 class="project-card__title">${proj.title}</h3>
            <span class="project-card__tag">${proj.tags}</span>
          </div>
        `;
        projectsScroll.appendChild(card);
      });
    }

    // 5. Signal that data is injected so GSAP and other scripts can safely initialize
    window.dispatchEvent(new Event('cmsDataLoaded'));
    
  } catch (err) {
    console.error('Failed to load CMS data, falling back to static HTML.', err);
    // If backend isn't running, just trigger the event so animations still work on the static HTML
    window.dispatchEvent(new Event('cmsDataLoaded'));
  }
});
