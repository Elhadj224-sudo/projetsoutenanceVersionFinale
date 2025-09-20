// -------------------- HAMBURGER MENU --------------------
document.getElementById('hamburger')?.addEventListener('click', () => {
  document.querySelector('.main-nav')?.classList.toggle('active');
});

// -------------------- DROPDOWN MOBILE --------------------
document.querySelectorAll('.dropdown > a').forEach(link => {
  link.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      const dropdownMenu = this.nextElementSibling;
      dropdownMenu.classList.toggle('active');
    }
  });
});

// -------------------- NAVIGATION FLUIDE --------------------
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      e.preventDefault();
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      targetSection.classList.add('active');
      document.querySelector('.main-nav')?.classList.remove('active');
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// -------------------- ADMIN ACCESS --------------------
let authToken = null;
document.querySelectorAll('a[href="#admin"]').forEach(link => {
  link.addEventListener("click", (e) => {
    if (!authToken) {
      e.preventDefault();
      alert("Accès réservé aux administrateurs. Veuillez vous connecter.");
    }
  });
});

// -------------------- CARROUSEL --------------------
let slideIndex = 0;
const slides = document.querySelectorAll('.carousel-img');
const dots = document.querySelectorAll('.dot');

function showSlide(n) {
  slides.forEach((s, i) => {
    s.style.opacity = '0';
    dots[i].classList.remove('active');
    s.style.display = 'none';
  });
  slides[n].style.display = 'block';
  setTimeout(() => slides[n].style.opacity = '1', 50);
  dots[n].classList.add('active');
}

dots.forEach((dot, i) => dot.addEventListener('click', () => { slideIndex = i; showSlide(slideIndex); }));

setInterval(() => {
  slideIndex = (slideIndex + 1) % slides.length;
  showSlide(slideIndex);
}, 5000);

showSlide(slideIndex);

// -------------------- CONTACT FORM --------------------
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    try {
      const res = await fetch('http://localhost:3000/api/contact', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) { alert('✅ Message envoyé !'); this.reset(); }
      else alert('❌ Erreur : ' + (data.message || 'Inconnue'));
    } catch (err) { console.error(err); alert('❌ Impossible d’envoyer le message.'); }
  });
}

// -------------------- SOCKET.IO - ACTUALITES --------------------
const socket = io('http://localhost:3000');

function createNewsItem(actualite) {
  const container = document.querySelector('#actualites .news-container');
  if (!container) return;

  const newsItem = document.createElement('div');
  newsItem.className = 'news-item animate-card';
  newsItem.dataset.id = actualite._id;

  const img = document.createElement('img');
  img.src = actualite.image 
    ? actualite.image.startsWith('/uploads') ? `http://localhost:3000${actualite.image}` : `http://localhost:3000/uploads/${actualite.image}`
    : 'asset/images/default-news.jpg';
  img.alt = actualite.title || 'Image actualité';
  img.className = 'news-img';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'news-content';
  const titre = document.createElement('h4');
  const date = actualite.createdAt ? new Date(actualite.createdAt).toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'}) : '';
  titre.textContent = `[${date}] ${actualite.title}`;
  const paragraphe = document.createElement('p');
  paragraphe.textContent = actualite.content;

  contentDiv.append(titre, paragraphe);
  newsItem.append(img, contentDiv);

  // Appliquer le tronquage directement ici
  truncateText(paragraphe, 5);

  newsItem.addEventListener('click', () => afficherDetailsActualite(actualite));

  container.prepend(newsItem);
}

async function loadAllNews() {
  try {
    const res = await fetch('http://localhost:3000/api/news');
    const news = await res.json();
    if (Array.isArray(news)) news.reverse().forEach(createNewsItem);
  } catch (err) { console.error('Erreur chargement actualités :', err); }
}

socket.on('newsDeleted', (deletedId) => {
  const newsToRemove = document.querySelector(`#actualites .news-container [data-id="${deletedId}"]`);
  if (newsToRemove) newsToRemove.remove();
});

loadAllNews();

// -------------------- AFFICHAGE DETAILS --------------------
function afficherDetailsActualite(actualite) {
  const section = document.getElementById('news-details');
  document.getElementById('details-title').textContent = actualite.title;
  document.getElementById('details-image').src = actualite.image 
    ? actualite.image.startsWith('/uploads') ? `http://localhost:3000${actualite.image}` : `http://localhost:3000/uploads/${actualite.image}` 
    : 'asset/images/default-news.jpg';
  document.getElementById('details-content').textContent = actualite.content;

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  section.style.display = 'block';
  section.classList.add('active');
  section.scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('close-details')?.addEventListener('click', () => {
  const section = document.getElementById('news-details');
  section.style.display = 'none';
  section.classList.remove('active');
  document.getElementById('accueil').classList.add('active');
});

// -------------------- EXPERIENCES --------------------
document.querySelectorAll('.experience-item').forEach(item => {
  item.addEventListener('click', () => {
    const title = item.querySelector('h3')?.textContent;
    const image = item.querySelector('img')?.src;
    const description = item.querySelector('p')?.textContent;
    afficherDetailsExperience({title, image, description});
  });
});

function afficherDetailsExperience(exp) {
  const section = document.getElementById('experience-details');
  document.getElementById('experience-title').textContent = exp.title || '';
  document.getElementById('experience-image').src = exp.image || 'asset/images/default.jpg';
  document.getElementById('experience-description').textContent = exp.description || '';

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  section.style.display = 'block';
  section.classList.add('active');
  section.scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('close-experience-details')?.addEventListener('click', () => {
  const section = document.getElementById('experience-details');
  section.style.display = 'none';
  section.classList.remove('active');
});

// -------------------- TRUNCATE TEXT --------------------
function truncateText(element, lines = 5) {
  const originalText = element.textContent;
  const textLines = originalText.split(/\. |\n/);
  if (textLines.length > lines) {
    const preview = textLines.slice(0, lines).join('. ') + '...';
    element.textContent = preview;

    if (!element.nextElementSibling || !element.nextElementSibling.classList.contains('btn-see-more')) {
      const btn = document.createElement('button');
      btn.textContent = "Voir plus";
      btn.classList.add('btn-see-more');
      element.parentNode.appendChild(btn);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        element.textContent = originalText;
        btn.style.display = 'none';
      });
    }
  }
}
