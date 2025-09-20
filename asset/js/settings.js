// // ========================
// // Utilitaires
// // ========================
// function showOutput(htmlContent) {
//   const output = document.getElementById('output');
//   output.innerHTML = htmlContent;
//   output.style.display = 'block';
// }

// function hideOutput() {
//   const output = document.getElementById('output');
//   output.style.display = 'none';
// }

// // ========================
// // Thème
// // ========================
// function toggleTheme() {
//   document.body.classList.toggle('dark-theme');
//   const themeToggle = document.querySelector('.theme-toggle i');
//   themeToggle.classList.toggle('fa-moon');
//   themeToggle.classList.toggle('fa-sun');
// }

// // ========================
// // Navigation
// // ========================
// function backToDashboard() {
//   window.location.href = "dashboard.html";
// }

// // ========================
// // Gestion des administrateurs
// // ========================
// function showAdminOptions() {
//   const panel = document.getElementById('admin-options');
//   panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
// }

// // ---------- Ajouter un admin ----------
// function addAdmin() {
//   showOutput(`
//     <h4>Ajouter un administrateur</h4>
//     <form id="add-admin-form">
//       <input type="text" id="admin-name" placeholder="Nom" required />
//       <input type="email" id="admin-email" placeholder="Email" required />
//       <input type="password" id="admin-password" placeholder="Mot de passe" required />
//       <button type="submit">Ajouter</button>
//     </form>
//     <button onclick="hideOutput()">Fermer</button>
//   `);

//   document.getElementById('add-admin-form').addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const name = document.getElementById('admin-name').value.trim();
//     const email = document.getElementById('admin-email').value.trim();
//     const password = document.getElementById('admin-password').value.trim();

//     try {
//       const res = await fetch("http://localhost:3000/api/admins", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, email, password })
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Erreur lors de l’ajout");
//       showOutput(`✅ Administrateur ajouté avec succès : ${email} <button onclick="hideOutput()">Fermer</button>`);
//     } catch (err) {
//       showOutput(`❌ ${err.message} <button onclick="hideOutput()">Fermer</button>`);
//     }
//   });
// }

// // ---------- Supprimer un admin ----------
// function deleteAdmin() {
//   showOutput(`
//     <h4>Supprimer un administrateur</h4>
//     <form id="delete-admin-form">
//       <input type="email" id="delete-admin-email" placeholder="Email de l’administrateur" required />
//       <button type="submit">Supprimer</button>
//     </form>
//     <button onclick="hideOutput()">Fermer</button>
//   `);

//   document.getElementById('delete-admin-form').addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const email = document.getElementById('delete-admin-email').value.trim();

//     try {
//       const res = await fetch(`http://localhost:3000/api/admins/${email}`, {
//         method: "DELETE",
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Erreur lors de la suppression");
//       showOutput(`✅ Administrateur supprimé : ${email} <button onclick="hideOutput()">Fermer</button>`);
//     } catch (err) {
//       showOutput(`❌ ${err.message} <button onclick="hideOutput()">Fermer</button>`);
//     }
//   });
// }

// // ---------- Changer le mot de passe ----------
// function changePassword() {
//   showOutput(`
//     <h4>Changer le mot de passe</h4>
//     <form id="change-password-form">
//       <input type="email" id="password-admin-email" placeholder="Email" required />
//       <input type="password" id="old-password" placeholder="Ancien mot de passe" required />
//       <input type="password" id="new-password" placeholder="Nouveau mot de passe" required />
//       <button type="submit">Changer</button>
//     </form>
//     <button onclick="hideOutput()">Fermer</button>
//   `);

//   document.getElementById('change-password-form').addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const email = document.getElementById('password-admin-email').value.trim();
//     const oldPassword = document.getElementById('old-password').value.trim();
//     const newPassword = document.getElementById('new-password').value.trim();

//     try {
//       const res = await fetch("http://localhost:3000/api/admins/change-password", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, oldPassword, newPassword })
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Erreur lors du changement de mot de passe");
//       showOutput(`✅ Mot de passe changé pour : ${email} <button onclick="hideOutput()">Fermer</button>`);
//     } catch (err) {
//       showOutput(`❌ ${err.message} <button onclick="hideOutput()">Fermer</button>`);
//     }
//   });
// }

// // ---------- Voir les statistiques ----------
// function viewStats() {
//   showOutput("<h4>📊 Statistiques en cours de chargement...</h4>");

//   fetch("http://localhost:3000/api/stats")
//     .then(res => res.json())
//     .then(data => {
//       showOutput(`<h4>📊 Statistiques</h4><pre>${JSON.stringify(data, null, 2)}</pre><button onclick="hideOutput()">Fermer</button>`);
//     })
//     .catch(err => {
//       showOutput(`❌ Impossible de charger les statistiques <button onclick="hideOutput()">Fermer</button>`);
//     });
// }
