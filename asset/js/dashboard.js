document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM chargé, initialisation du dashboard...");

  // ✅ Vérifie la présence du token JWT
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn("Token manquant. Redirection vers login.");
    window.location.href = "login.html";
    return;
  }

  // Fonction utilitaire pour ajouter le header Authorization
  function getAuthHeaders(contentType = 'application/json') {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Aucun token trouvé dans le localStorage");
      window.location.href = "login.html";
      return {};
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    // Pour FormData, on ne spécifie PAS Content-Type (le navigateur le gère)
    if (contentType && contentType !== 'multipart/form-data') {
      headers['Content-Type'] = contentType;
    }
    
    return headers;
  }

  // Vérification de la connexion (via ping API)
  fetch("http://localhost:3000/api/news", {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  })
    .then(res => {
      if (!res.ok) throw new Error("Non autorisé");
      return res.json();
    })
    .then(() => {
      // Chargement initial
      afficherOnglet(newsSection);
      chargerActualites();
    })
    .catch(err => {
      console.error("Accès refusé :", err);
      window.location.href = "login.html";
    });

  // Déconnexion
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("http://localhost:3000/api/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: getAuthHeaders(),
        });

        // ✅ Supprime le token côté client
        localStorage.removeItem('token');

        if (res.ok) {
          window.location.href = "login.html";
        } else {
          alert("Erreur lors de la déconnexion.");
        }
      } catch {
        alert("Erreur réseau lors de la déconnexion.");
      }
    });
  } else {
    console.error("Bouton de déconnexion non trouvé");
  }

  // Récupération des onglets et sections
  const newsTab = document.getElementById("news-tab");
  const membersTab = document.getElementById("members-tab");
  const messagesTab = document.getElementById("messages-tab");
  const experiencesTab = document.getElementById("experiences-tab");
  const partnersTab = document.getElementById("partners-tab");
  const donsTab = document.getElementById("dons-tab");

  const newsSection = document.getElementById("news-section");
  const membersSection = document.getElementById("members-section");
  const messagesSection = document.getElementById("messages-section");
  const experiencesSection = document.getElementById("experiences-section");
  const partnersSection = document.getElementById("partners-section");
  const donsSection = document.getElementById("dons-section");

  // Vérification que tous les éléments existent
  if (!newsTab || !membersTab || !messagesTab || !experiencesTab || !partnersTab || !donsTab ||
      !newsSection || !membersSection || !messagesSection || !experiencesSection || !partnersSection || !donsSection) {
    console.error("Un ou plusieurs éléments de navigation sont manquants dans le DOM");
    return;
  }

  // Gestion affichage onglet (toggle active & display)
  function afficherOnglet(section) {
    const sections = [
      newsSection,
      membersSection,
      messagesSection,
      experiencesSection,
      partnersSection,
      donsSection
    ];
  
    sections.forEach(sec => {
      if (!sec) return;
      if (sec === section) {
        sec.style.display = "block";
        sec.classList.add("active");
      } else {
        sec.style.display = "none";
        sec.classList.remove("active");
      }
    });
  
    // Mise à jour onglets actifs
    document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
  
    if (section === newsSection && newsTab) newsTab.classList.add('active');
    if (section === membersSection && membersTab) membersTab.classList.add('active');
    if (section === messagesSection && messagesTab) messagesTab.classList.add('active');
    if (section === experiencesSection && experiencesTab) experiencesTab.classList.add('active');
    if (section === partnersSection && partnersTab) partnersTab.classList.add('active');
    if (section === donsSection && donsTab) donsTab.classList.add('active');
  }
  
  // Événements onglets
  if (newsTab) {
    newsTab.addEventListener("click", e => {
      e.preventDefault();
      afficherOnglet(newsSection);
      chargerActualites();
    });
  }

  if (membersTab) {
    membersTab.addEventListener("click", e => {
      e.preventDefault();
      afficherOnglet(membersSection);
      chargerMembres();
    });
  }

  if (messagesTab) {
    messagesTab.addEventListener("click", e => {
      e.preventDefault();
      afficherOnglet(messagesSection);
      chargerMessages();
    });
  }

  if (experiencesTab) {
    experiencesTab.addEventListener("click", e => {
      e.preventDefault();
      afficherOnglet(experiencesSection);
      chargerExperiences();
    });
  }

  if (partnersTab) {
    partnersTab.addEventListener("click", e => {
      e.preventDefault();
      afficherOnglet(partnersSection);
      chargerPartenaires();
    });
  }

  if (donsTab) {
    donsTab.addEventListener("click", e => {
      e.preventDefault();
      afficherOnglet(donsSection);
      chargerDons();
    });
  }

  // ==========================
  // 🎯 GESTION DES ACTUALITÉS CORRIGÉE
  // ==========================
  async function chargerActualites() {
    const newsList = document.getElementById("news-list");
    if (!newsList) return console.error("Élément news-list non trouvé");

    newsList.innerHTML = "Chargement...";

    try {
      const res = await fetch(`http://localhost:3000/api/news/`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }
      
      const news = await res.json();

      newsList.innerHTML = "";

      if (!Array.isArray(news) || news.length === 0) {
        newsList.innerHTML = "<p>Aucune actualité disponible.</p>";
        return;
      }

      news.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("news-item");
        
        const imageHtml = item.image 
          ? `<img src="http://localhost:3000${item.image}" alt="${item.title}" style="max-width: 300px; margin: 10px 0;" />` 
          : '';
        
        div.innerHTML = `
          <h3>${item.title}</h3>
          <p>${item.content}</p>
          ${imageHtml}
          <small>Publié le : ${new Date(item.createdAt).toLocaleDateString()}</small><br />
          <button class="btn-edit-news" data-id="${item._id || item.id}">Modifier</button>
          <button class="btn-delete-news" data-id="${item._id || item.id}">Supprimer</button>
        `;
        newsList.appendChild(div);
      });

      // Réattacher les événements
      document.querySelectorAll(".btn-edit-news").forEach(btn => {
        btn.onclick = () => ouvrirFormulaireActualite(btn.dataset.id);
      });
      
      document.querySelectorAll(".btn-delete-news").forEach(btn => {
        btn.onclick = () => supprimerActualite(btn.dataset.id);
      });

    } catch (err) {
      console.error("Erreur détaillée:", err);
      newsList.innerHTML = "<p>Erreur de chargement des actualités.</p>";
    }
  }

  function reinitialiserFormulaireActualite() {
    const newsForm = document.getElementById("news-form");
    const newsIdElem = document.getElementById("news-id");
    const titleElem = document.getElementById("title");
    const contentElem = document.getElementById("content");
    const newsImageElem = document.getElementById("newsImage");
    const formTitleElem = document.getElementById("form-title");
    const newsFormContainer = document.getElementById("news-form-container");
    const overlay = document.getElementById("overlay");

    if (newsForm) newsForm.reset();
    if (newsIdElem) newsIdElem.value = "";
    if (titleElem) titleElem.value = "";
    if (contentElem) contentElem.value = "";
    if (newsImageElem) newsImageElem.value = "";
    if (formTitleElem) formTitleElem.textContent = "Ajouter une actualité";
    if (newsFormContainer) newsFormContainer.style.display = "block";
    if (overlay) overlay.style.display = "block";
  }

  async function ouvrirFormulaireActualite(id) {
    const newsIdElem = document.getElementById("news-id");
    const titleElem = document.getElementById("title");
    const contentElem = document.getElementById("content");
    const newsImageElem = document.getElementById("newsImage");
    const formTitleElem = document.getElementById("form-title");
    const newsFormContainer = document.getElementById("news-form-container");
    const overlay = document.getElementById("overlay");

    try {
      const res = await fetch(`http://localhost:3000/api/news/${id}`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Erreur chargement actualité");
      const newsItem = await res.json();

      // Préparation du formulaire pour modification
      if (newsIdElem) newsIdElem.value = newsItem._id || newsItem.id || "";
      if (titleElem) titleElem.value = newsItem.title || "";
      if (contentElem) contentElem.value = newsItem.content || "";
      if (newsImageElem) newsImageElem.value = "";
      if (formTitleElem) formTitleElem.textContent = "Modifier une actualité";
      if (newsFormContainer) newsFormContainer.style.display = "block";
      if (overlay) overlay.style.display = "block";
    } catch {
      alert("Impossible de charger l'actualité.");
    }
  }

  async function supprimerActualite(id) {
    if (!id || !confirm("Confirmer la suppression de cette actualité ?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/news/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Erreur suppression");
      alert("Actualité supprimée.");
      chargerActualites();
    } catch {
      alert("Impossible de supprimer l'actualité.");
    }
  }

  // Ajouter nouvelle actualité
  const addNewsBtn = document.getElementById("add-news-btn");
  if (addNewsBtn) addNewsBtn.addEventListener("click", reinitialiserFormulaireActualite);

  // ✅ CORRECTION : Soumission formulaire actualité avec debug amélioré
// Soumission formulaire actualité - VERSION CORRIGÉE
const newsForm = document.getElementById("news-form");
if (newsForm) {
  newsForm.addEventListener("submit", async e => {
    e.preventDefault();
    console.log("📝 Début soumission formulaire actualité CORRIGÉE");

    // ➡️ CORRECTION : Utiliser le nouvel ID "news-content"
    const newsIdElem = document.getElementById("news-id");
    const titleElem = document.getElementById("title");
    const contentElem = document.getElementById("news-content"); // CHANGÉ ICI
    const imageInput = document.getElementById("newsImage");

    // Debug de vérification
    console.log("🔍 Éléments trouvés:");
    console.log("titleElem:", titleElem);
    console.log("contentElem (news-content):", contentElem);
    
    if (contentElem) {
      console.log("Valeur du contenu:", contentElem.value);
    }

    // Validation
    if (!titleElem || !contentElem) {
      alert("Erreur: Formulaire incomplet.");
      return;
    }

    const titreValue = titleElem.value.trim();
    const contenuValue = contentElem.value.trim();

    console.log("✅ Valeurs validées - Titre:", titreValue, "Contenu:", contenuValue);

    if (!titreValue || !contenuValue) {
      alert("Titre et contenu sont obligatoires.");
      return;
    }

    // Préparation FormData
    const formData = new FormData();
    formData.append("title", titreValue);
    formData.append("content", contenuValue);
    
    if (imageInput && imageInput.files.length > 0) {
      formData.append("image", imageInput.files[0]);
    }

    const id = newsIdElem ? newsIdElem.value : "";
    const url = id ? `http://localhost:3000/api/news/${id}` : `http://localhost:3000/api/news`;
    const method = id ? "PUT" : "POST";

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = "login.html";
        return;
      }

      const res = await fetch(url, { 
        method, 
        credentials: "include",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData 
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }

      const result = await res.json();
      console.log("✅ Réponse serveur:", result);

      alert("Actualité enregistrée avec succès !");
      
      // Réinitialiser et fermer
      newsForm.reset();
      if (newsIdElem) newsIdElem.value = "";
      document.getElementById("news-form-container").style.display = "none";
      document.getElementById("overlay").style.display = "none";

      // Recharger la liste
      chargerActualites();
      
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur lors de l'enregistrement : " + err.message);
    }
  });
}

  // Annuler formulaire
  const newsFormCancel = document.getElementById("news-form-cancel");
  if (newsFormCancel) {
    newsFormCancel.addEventListener("click", () => {
      const newsForm = document.getElementById("news-form");
      const newsIdElem = document.getElementById("news-id");
      const newsFormContainer = document.getElementById("news-form-container");
      const overlay = document.getElementById("overlay");

      if (newsForm) newsForm.reset();
      if (newsIdElem) newsIdElem.value = "";
      if (newsFormContainer) newsFormContainer.style.display = "none";
      if (overlay) overlay.style.display = "none";
    });
  }

  // --- Membres ---
const addMemberBtn = document.getElementById("add-member-btn");
const memberFormContainer = document.getElementById("member-form-container");
const memberForm = document.getElementById("member-form");

if (addMemberBtn && memberFormContainer) {
  addMemberBtn.addEventListener("click", () => {
    const memberForm = document.getElementById("member-form");
    const memberIdElem = document.getElementById("member-id");
    const memberFormTitle = document.getElementById("member-form-title");
    
    if (memberForm && memberIdElem && memberFormTitle) {
      memberForm.reset();
      memberIdElem.value = "";
      memberFormTitle.textContent = "Ajouter un membre";
      memberFormContainer.style.display = "block";
    }
  });
}

async function chargerMembres() {
  const membersList = document.getElementById("members-list");
  if (!membersList) {
    console.error("Élément members-list non trouvé");
    return;
  }
  
  membersList.innerHTML = "Chargement...";

  try {
    const res = await fetch("http://localhost:3000/api/members", {
      credentials: "include",
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    const members = await res.json();

    if (!Array.isArray(members) || members.length === 0) {
      membersList.innerHTML = "<p>Aucun membre disponible.</p>";
      return;
    }

    membersList.innerHTML = "";

    members.forEach(member => {
      const div = document.createElement("div");
      div.classList.add("member-item");

      const imgSrc = member.img ? `http://localhost:3000${member.img}` : "https://via.placeholder.com/150";

      div.innerHTML = `
        <h3>${member.name || "Nom inconnu"}</h3>
        <p><strong>Bio :</strong> ${member.bio || "Bio non disponible"}</p>
        <small><strong>Rôle :</strong> ${member.role || "Rôle non défini"}</small><br />
        <img src="${imgSrc}" alt="Photo de ${member.name || 'membre'}" width="150" /><br />
        <button class="btn-edit-member" data-id="${member._id || member.id}">Modifier</button>
        <button class="btn-delete-member" data-id="${member._id || member.id}">Supprimer</button>
      `;

      membersList.appendChild(div);
    });

    // Boutons modifier membre
    document.querySelectorAll(".btn-edit-member").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!id) return;

        try {
          const res = await fetch(`http://localhost:3000/api/members/${id}`, {
            credentials: "include",
            headers: getAuthHeaders(),
          });
          
          if (!res.ok) throw new Error("Erreur chargement membre");
          const member = await res.json();

          // Vérification que les éléments existent
          const memberIdElem = document.getElementById("member-id");
          const memberNameElem = document.getElementById("member-name");
          const memberRoleElem = document.getElementById("member-role");
          const memberBioElem = document.getElementById("member-bio");
          const memberImgElem = document.getElementById("member-img");
          const memberFormTitle = document.getElementById("member-form-title");

          if (memberIdElem && memberNameElem && memberRoleElem && 
              memberBioElem && memberImgElem && memberFormTitle && memberFormContainer) {
            memberIdElem.value = member._id || member.id || "";
            memberNameElem.value = member.name || "";
            memberRoleElem.value = member.role || "";
            memberBioElem.value = member.bio || "";
            memberImgElem.value = "";

            memberFormTitle.textContent = "Modifier un membre";
            memberFormContainer.style.display = "block";
          } else {
            console.error("Un ou plusieurs éléments du formulaire de membre sont manquants");
          }
        } catch {
          alert("Impossible de charger les informations du membre.");
        }
      });
    });

    // Boutons supprimer membre
    document.querySelectorAll(".btn-delete-member").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!id) return;
        
        if (confirm("Confirmer la suppression de ce membre ?")) {
          try {
            const res = await fetch(`http://localhost:3000/api/members/${id}`, {
              method: "DELETE",
              credentials: "include",
              headers: getAuthHeaders(),
            });
            
            if (!res.ok) throw new Error("Erreur suppression");
            alert("Membre supprimé.");
            chargerMembres();
          } catch {
            alert("Impossible de supprimer le membre.");
          }
        }
      });
    });

  } catch (err) {
    membersList.innerHTML = "<p>Erreur de chargement des membres.</p>";
    console.error(err);
  }
}

// Gestion formulaire membre (ajout/modif) - VERSION CORRIGÉE
if (memberForm) {
  memberForm.addEventListener("submit", async e => {
    e.preventDefault();
    console.log("📝 Début soumission formulaire membre avec upload");

    // Vérification que les éléments existent
    const memberIdElem = document.getElementById("member-id");
    const memberNameElem = document.getElementById("member-name");
    const memberRoleElem = document.getElementById("member-role");
    const memberBioElem = document.getElementById("member-bio");
    const imgInput = document.getElementById("member-img");

    if (!memberIdElem || !memberNameElem || !memberRoleElem || !memberBioElem || !imgInput) {
      console.error("Un ou plusieurs éléments du formulaire de membre sont manquants");
      alert("Erreur: Formulaire incomplet");
      return;
    }

    const id = memberIdElem.value;
    const name = memberNameElem.value.trim();
    const role = memberRoleElem.value.trim();
    const bio = memberBioElem.value.trim();

    console.log("🔍 Données membre:", { name, role, bio, hasImage: imgInput.files.length > 0 });

    if (!name || !role || !bio) {
      alert("Tous les champs sauf photo sont obligatoires.");
      return;
    }

    // Préparation FormData pour l'upload
    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("bio", bio);
    
    if (imgInput.files.length > 0) {
      formData.append("image", imgInput.files[0]);
      console.log("📸 Fichier image ajouté:", imgInput.files[0].name, imgInput.files[0].type, imgInput.files[0].size + ' bytes');
    }

    try {
      const url = id ? `http://localhost:3000/api/members/${id}` : `http://localhost:3000/api/members`;
      const method = id ? "PUT" : "POST";

      console.log("🚀 Envoi requête:", method, url);

      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = "login.html";
        return;
      }

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      console.log("📡 Statut réponse:", res.status);
      console.log("📡 OK:", res.ok);

      if (!res.ok) {
        let errorText;
        try {
          errorText = await res.text();
          console.error("❌ Erreur serveur détaillée:", errorText);
        } catch {
          errorText = "Impossible de lire la réponse d'erreur";
        }
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }

      let result;
      try {
        result = await res.json();
        console.log("✅ Réponse serveur COMPLÈTE:", result);
      } catch (parseError) {
        console.error("❌ Erreur parsing JSON:", parseError);
        throw new Error("Réponse serveur invalide");
      }

      // ➡️ CORRECTION : Vérification plus flexible du succès
      if (result._id || result.success || result.message) {
        // Si on a un ID, un champ success ou un message, considérer comme réussi
        alert("Membre enregistré avec succès !");
        memberForm.reset();
        memberIdElem.value = "";
        
        if (memberFormContainer) {
          memberFormContainer.style.display = "none";
        }
        
        chargerMembres();
      } else {
        throw new Error(result.message || "Erreur inconnue du serveur");
      }

    } catch (err) {
      console.error("💥 Erreur détaillée:", err);
      
      // Messages d'erreur plus spécifiques
      if (err.message.includes('400') && err.message.includes('Unexpected token')) {
        alert("Erreur: Le serveur ne peut pas traiter les fichiers. Vérifiez la configuration du backend (multer).");
      } else if (err.message.includes('413')) {
        alert("Erreur: Le fichier est trop volumineux. Taille maximale: 5MB");
      } else if (err.message.includes('415')) {
        alert("Erreur: Type de fichier non supporté. Utilisez uniquement des images (JPG, PNG, etc.)");
      } else {
        alert("Erreur lors de l'enregistrement : " + err.message);
      }
    }
  });

} else {
  console.error("Formulaire de membre non trouvé");
}

// Bouton annuler formulaire membre
const memberFormCancel = document.getElementById("member-form-cancel");
if (memberFormCancel && memberFormContainer) {
  memberFormCancel.addEventListener("click", () => {
    const memberForm = document.getElementById("member-form");
    const memberIdElem = document.getElementById("member-id");
    
    if (memberForm && memberIdElem) {
      memberForm.reset();
      memberIdElem.value = "";
      memberFormContainer.style.display = "none";
    }
  });
}

  // --- Messages ---
  async function chargerMessages() {
    const messagesList = document.getElementById("messages-list");
    if (!messagesList) {
      console.error("Élément messages-list non trouvé");
      return;
    }
    
    messagesList.innerHTML = "Chargement...";

    try {
      const res = await fetch("http://localhost:3000/api/contact/all", {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const messages = await res.json();

      if (!Array.isArray(messages) || messages.length === 0) {
        messagesList.innerHTML = "<p>Aucun message reçu.</p>";
        return;
      }

      messagesList.innerHTML = "";

      messages.forEach(msg => {
        const div = document.createElement("div");
        div.classList.add("message-item");

        div.innerHTML = `
          <h3>Nom : ${msg.nom || "Non renseigné"}</h3>
          <p><strong>Email :</strong> ${msg.email || "Non renseigné"}</p>
          <p><strong>Téléphone :</strong> ${msg.telephone || "Non renseigné"}</p>
          <p><strong>Message :</strong> ${msg.message || "Message vide"}</p>
          ${msg.fichier ? `<p><button class="voir-fichier-btn" data-fichier="${msg.fichier}">📎 Voir le fichier</button></p>` : ""}
          <p><button class="repondre-btn" data-email="${msg.email}" data-tel="${msg.telephone}">✉️ Répondre</button></p>
        `;

        messagesList.appendChild(div);
      });

      attachFichierButtons();
      attachReplyButtons();

    } catch (err) {
      messagesList.innerHTML = "<p>Erreur de chargement des messages.</p>";
      console.error(err);
    }
  }

  // --- Gestion boutons voir fichier ---
  function attachFichierButtons() {
    document.querySelectorAll(".voir-fichier-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const fichier = btn.dataset.fichier;
        if (fichier) {
          window.location.href = `voir-fichier.html?fichier=${encodeURIComponent(fichier)}`;
        }
      });
    });
  }

  // --- Gestion boutons répondre ---
  function attachReplyButtons() {
    document.querySelectorAll(".repondre-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.email;
        const tel = btn.dataset.tel;

        if (!email && !tel) {
          alert("Aucune information de contact disponible.");
          return;
        }

        const choix = prompt(
          `Comment souhaitez-vous répondre ?\n\n` +
          `${email ? `1 - Par Email (${email})\n` : ""}` +
          `${tel ? `2 - Par SMS (${tel})\n` : ""}` +
          `\nEntrez 1 ou 2 :`
        );

        if (choix === "1" && email) {
          window.location.href = `mailto:${email}?subject=Réponse à votre message&body=Bonjour,`;
        } else if (choix === "2" && tel) {
          window.location.href = `sms:${tel}`;
        } else {
          alert("Choix invalide ou contact manquant.");
        }
      });
    });
  }
/* ==========================
   🎯 GESTION DES EXPÉRIENCES CORRIGÉE
========================== */

async function chargerExperiences() {
  const container = document.querySelector(".experiences-container");
  if (!container) return;

  container.innerHTML = "Chargement...";

  try {
    const res = await fetch("http://localhost:3000/api/experiences", {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    });

    console.log("📡 Statut chargement expériences:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Erreur chargement expériences:", errorText);
      throw new Error(`Erreur ${res.status}: ${errorText}`);
    }

    const experiences = await res.json();
    console.log("✅ Expériences chargées:", experiences);

    container.innerHTML = "";

    if (!Array.isArray(experiences) || experiences.length === 0) {
      container.innerHTML = "<p>Aucune expérience disponible.</p>";
      return;
    }

    experiences.forEach(exp => {
      const div = document.createElement("div");
      div.classList.add("experience-item");

      const imgSrc = exp.image ? `http://localhost:3000${exp.image}` : "https://via.placeholder.com/300x200";

      div.innerHTML = `
        <h3>${exp.title}</h3>
        <p>${exp.description}</p>
        <img src="${imgSrc}" alt="Image expérience" width="300" />
        <button class="btn-edit-experience" data-id="${exp._id || exp.id}">Modifier</button>
        <button class="btn-delete-experience" data-id="${exp._id || exp.id}">Supprimer</button>
      `;

      container.appendChild(div);
    });

    // Gestion modifier
    document.querySelectorAll(".btn-edit-experience").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        console.log("🔄 Modification expérience ID:", id);

        try {
          const res = await fetch(`http://localhost:3000/api/experiences/${id}`, {
            method: "GET",
            credentials: "include",
            headers: getAuthHeaders(),
          });

          console.log("📡 Statut récupération expérience:", res.status);

          if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ Erreur récupération expérience:", errorText);
            alert("Erreur lors de la récupération de l'expérience");
            return;
          }

          const exp = await res.json();
          console.log("✅ Expérience récupérée:", exp);

          document.getElementById("experience-id").value = exp._id || exp.id;
          document.getElementById("experience-title").value = exp.title || "";
          document.getElementById("experience-description").value = exp.description || "";
          document.getElementById("experience-form").style.display = "block";

        } catch (error) {
          console.error("💥 Erreur modification expérience:", error);
          alert("Erreur lors du chargement de l'expérience");
        }
      });
    });

    // Gestion suppression
    document.querySelectorAll(".btn-delete-experience").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm("Confirmer la suppression de cette expérience ?")) return;

        try {
          const res = await fetch(`http://localhost:3000/api/experiences/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: getAuthHeaders(),
          });

          console.log("📡 Statut suppression expérience:", res.status);

          if (res.ok) {
            alert("Expérience supprimée avec succès !");
            chargerExperiences();
          } else {
            const errorText = await res.text();
            console.error("❌ Erreur suppression expérience:", errorText);
            alert("Erreur lors de la suppression");
          }
        } catch (error) {
          console.error("💥 Erreur suppression expérience:", error);
          alert("Erreur lors de la suppression");
        }
      });
    });

  } catch (err) {
    console.error("💥 Erreur chargement expériences:", err);
    container.innerHTML = "<p>Erreur de chargement des expériences.</p>";
  }
}

// 🎯 Envoi du formulaire expérience CORRIGÉ
const expForm = document.getElementById("experience-form");
if (expForm) {
  expForm.addEventListener("submit", async e => {
    e.preventDefault();
    console.log("📝 Début soumission formulaire expérience");

    const id = document.getElementById("experience-id").value;
    const title = document.getElementById("experience-title").value.trim();
    const description = document.getElementById("experience-description").value.trim();
    const img = document.getElementById("experience-image");

    console.log("🔍 Données expérience:", { id, title, description, hasImage: img.files.length > 0 });

    // Validation
    if (!title || !description) {
      alert("Le titre et la description sont obligatoires.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    
    if (img.files.length > 0) {
      formData.append("image", img.files[0]);
      console.log("📸 Fichier image ajouté:", img.files[0].name);
    }

    const url = id ? `http://localhost:3000/api/experiences/${id}` : `http://localhost:3000/api/experiences`;
    const method = id ? "PUT" : "POST";

    console.log("🚀 Envoi requête expérience:", method, url);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = "login.html";
        return;
      }

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`
          // NE PAS ajouter 'Content-Type' pour FormData
        },
        body: formData,
      });

      console.log("📡 Statut réponse expérience:", res.status);

      if (!res.ok) {
        let errorText;
        try {
          errorText = await res.text();
          console.error("❌ Erreur serveur expérience:", errorText);
        } catch {
          errorText = "Impossible de lire la réponse d'erreur";
        }
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }

      let result;
      try {
        result = await res.json();
        console.log("✅ Réponse serveur expérience:", result);
      } catch (parseError) {
        console.error("❌ Erreur parsing JSON expérience:", parseError);
        throw new Error("Réponse serveur invalide");
      }

      // Vérification flexible du succès
      if (result._id || result.success || result.title) {
        alert("Expérience enregistrée avec succès !");
        expForm.reset();
        document.getElementById("experience-id").value = "";
        expForm.style.display = "none";
        chargerExperiences();
      } else {
        throw new Error(result.message || "Erreur inconnue du serveur");
      }

    } catch (err) {
      console.error("💥 Erreur détaillée expérience:", err);
      alert("Erreur lors de l'enregistrement : " + err.message);
    }
  });
}

// Bouton annuler expérience
const expFormCancel = document.getElementById("experience-form-cancel");
if (expFormCancel) {
  expFormCancel.addEventListener("click", () => {
    expForm.reset();
    document.getElementById("experience-id").value = "";
    expForm.style.display = "none";
  });
}

// Bouton ajouter expérience
const addExpBtn = document.getElementById("add-experience-btn");
if (addExpBtn) {
  addExpBtn.addEventListener("click", () => {
    document.getElementById("experience-id").value = "";
    document.getElementById("experience-title").value = "";
    document.getElementById("experience-description").value = "";
    document.getElementById("experience-image").value = "";
    expForm.style.display = "block";
  });
}
  /* ==========================
   🎯 GESTION DES PARTENAIRES CORRIGÉE
========================== */

async function chargerPartenaires() {
  const container = document.querySelector(".partners-container");
  if (!container) return;

  container.innerHTML = "Chargement...";

  try {
    const res = await fetch("http://localhost:3000/api/partners", {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    });

    console.log("📡 Statut chargement partenaires:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Erreur chargement partenaires:", errorText);
      throw new Error(`Erreur ${res.status}: ${errorText}`);
    }

    const partners = await res.json();
    console.log("✅ Partenaires chargés:", partners);

    container.innerHTML = "";

    if (!Array.isArray(partners) || partners.length === 0) {
      container.innerHTML = "<p>Aucun partenaire disponible.</p>";
      return;
    }

    partners.forEach(partner => {
      const div = document.createElement("div");
      div.classList.add("partner-item");

      const imgSrc = partner.logo ? `http://localhost:3000${partner.logo}` : "https://via.placeholder.com/150";

      div.innerHTML = `
        <h3>${partner.name}</h3>
        <img src="${imgSrc}" alt="Logo partenaire" width="150" />
        <button class="btn-edit-partner" data-id="${partner._id || partner.id}">Modifier</button>
        <button class="btn-delete-partner" data-id="${partner._id || partner.id}">Supprimer</button>
      `;

      container.appendChild(div);
    });

    // Modifier
    document.querySelectorAll(".btn-edit-partner").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        console.log("🔄 Modification partenaire ID:", id);

        try {
          const res = await fetch(`http://localhost:3000/api/partners/${id}`, {
            method: "GET",
            credentials: "include",
            headers: getAuthHeaders(),
          });

          console.log("📡 Statut récupération partenaire:", res.status);

          if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ Erreur récupération partenaire:", errorText);
            alert("Erreur lors de la récupération du partenaire");
            return;
          }

          const partner = await res.json();
          console.log("✅ Partenaire récupéré:", partner);

          document.getElementById("partner-id").value = partner._id || partner.id;
          document.getElementById("partner-name").value = partner.name || "";
          document.getElementById("partner-form").style.display = "block";

        } catch (error) {
          console.error("💥 Erreur modification partenaire:", error);
          alert("Erreur lors du chargement du partenaire");
        }
      });
    });

    // Supprimer
    document.querySelectorAll(".btn-delete-partner").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm("Confirmer la suppression de ce partenaire ?")) return;

        try {
          const res = await fetch(`http://localhost:3000/api/partners/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: getAuthHeaders(),
          });

          console.log("📡 Statut suppression partenaire:", res.status);

          if (res.ok) {
            alert("Partenaire supprimé avec succès !");
            chargerPartenaires();
          } else {
            const errorText = await res.text();
            console.error("❌ Erreur suppression partenaire:", errorText);
            alert("Erreur lors de la suppression");
          }
        } catch (error) {
          console.error("💥 Erreur suppression partenaire:", error);
          alert("Erreur lors de la suppression");
        }
      });
    });

  } catch (err) {
    console.error("💥 Erreur chargement partenaires:", err);
    container.innerHTML = "<p>Erreur de chargement des partenaires.</p>";
  }
}

// 🎯 Formulaire partenaires CORRIGÉ
const partnerForm = document.getElementById("partner-form");
if (partnerForm) {
  partnerForm.addEventListener("submit", async e => {
    e.preventDefault();
    console.log("📝 Début soumission formulaire partenaire");

    const id = document.getElementById("partner-id").value;
    const name = document.getElementById("partner-name").value.trim();
    const logo = document.getElementById("partner-logo");

    console.log("🔍 Données partenaire:", { id, name, hasLogo: logo.files.length > 0 });

    // Validation
    if (!name) {
      alert("Le nom du partenaire est obligatoire.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    
    if (logo.files.length > 0) {
      formData.append("logo", logo.files[0]);
      console.log("📸 Fichier logo ajouté:", logo.files[0].name);
    }

    const url = id ? `http://localhost:3000/api/partners/${id}` : `http://localhost:3000/api/partners`;
    const method = id ? "PUT" : "POST";

    console.log("🚀 Envoi requête partenaire:", method, url);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = "login.html";
        return;
      }

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      console.log("📡 Statut réponse partenaire:", res.status);

      if (!res.ok) {
        let errorText;
        try {
          errorText = await res.text();
          console.error("❌ Erreur serveur partenaire:", errorText);
        } catch {
          errorText = "Impossible de lire la réponse d'erreur";
        }
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }

      let result;
      try {
        result = await res.json();
        console.log("✅ Réponse serveur partenaire:", result);
      } catch (parseError) {
        console.error("❌ Erreur parsing JSON partenaire:", parseError);
        throw new Error("Réponse serveur invalide");
      }

      // Vérification flexible du succès
      if (result._id || result.success || result.name) {
        alert("Partenaire enregistré avec succès !");
        partnerForm.reset();
        document.getElementById("partner-id").value = "";
        partnerForm.style.display = "none";
        chargerPartenaires();
      } else {
        throw new Error(result.message || "Erreur inconnue du serveur");
      }

    } catch (err) {
      console.error("💥 Erreur détaillée partenaire:", err);
      alert("Erreur lors de l'enregistrement : " + err.message);
    }
  });
}

// Bouton annuler partenaire
const partnerFormCancel = document.getElementById("partner-form-cancel");
if (partnerFormCancel) {
  partnerFormCancel.addEventListener("click", () => {
    partnerForm.reset();
    document.getElementById("partner-id").value = "";
    partnerForm.style.display = "none";
  });
}

// Bouton ajouter partenaire
const addPartnerBtn = document.getElementById("add-partner-btn");
if (addPartnerBtn) {
  addPartnerBtn.addEventListener("click", () => {
    document.getElementById("partner-id").value = "";
    document.getElementById("partner-name").value = "";
    document.getElementById("partner-logo").value = "";
    partnerForm.style.display = "block";
  });
}
  /* ==========================
     🎯 GESTION DES DONS
  ========================== */
  async function chargerDons() {
    const donsList = document.getElementById("dons-list");
    if (!donsList) {
      console.error("Élément dons-list non trouvé");
      return;
    }
    
    donsList.innerHTML = "Chargement...";

    try {
      const res = await fetch("http://localhost:3000/api/dons", {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const dons = await res.json();

      if (!Array.isArray(dons) || dons.length === 0) {
        donsList.innerHTML = "<p>Aucun don reçu.</p>";
        return;
      }

      donsList.innerHTML = "";
      dons.forEach(don => {
        const div = document.createElement("div");
        div.classList.add("don-message");
        div.innerHTML = `
          <h3>${don.nom || "Anonyme"} ${don.prenom || ""}</h3>
          <p><strong>Email :</strong> ${don.email}</p>
          <p><strong>Téléphone :</strong> ${don.telephone}</p>
          <p><strong>Nature du don :</strong> ${don.nature}</p>
          <p><strong>Message :</strong> ${don.message || "Aucun message"}</p>
          <small>📅 ${new Date(don.createdAt).toLocaleString()}</small>
          <hr/>
        `;
        donsList.appendChild(div);
      });
    } catch (err) {
      donsList.innerHTML = "<p>Erreur de chargement des dons.</p>";
      console.error("Erreur chargement dons:", err);
    }
  }
});