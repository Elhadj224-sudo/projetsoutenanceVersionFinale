document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("don-form");
  const output = document.getElementById("don-output");
  const donsList = document.getElementById("dons-list");

  if (!form) {
    console.error("Formulaire introuvable !");
    return;
  }

  // ⚡ URL backend
  const API_URL = "http://localhost:3000/api/dons";

  // Envoyer un don
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("Formulaire soumis"); // 🔹 Debug

    const formData = {
      nom: form.nom.value,
      prenom: form.prenom.value,
      email: form.email.value,
      telephone: form.telephone.value,
      nature: form.nature.value,
      message: form.message.value,
      autorisation: form.autorisation.checked
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      console.log("Réponse fetch:", res.status);

      const data = await res.json();
      console.log("Data reçue:", data);

      if (data.success) {
        output.innerHTML = `<p style="color:green">✅ Merci pour votre don !</p>`;
        form.reset();
        chargerDons(); // Actualiser la liste
      } else {
        output.innerHTML = `<p style="color:red">❌ Erreur : ${data.error || 'Serveur'}</p>`;
      }
    } catch (err) {
      output.innerHTML = `<p style="color:red">⚠️ Erreur serveur</p>`;
      console.error("Erreur fetch:", err);
    }
  });

  // Charger tous les dons
  async function chargerDons() {
    if (!donsList) return;
    donsList.innerHTML = "Chargement...";

    try {
      const res = await fetch(API_URL);
      console.log("Status fetch dons:", res.status);
      const dons = await res.json();

      if (!Array.isArray(dons) || dons.length === 0) {
        donsList.innerHTML = "<p>Aucun don reçu.</p>";
        return;
      }

      donsList.innerHTML = "";
      dons.forEach(don => {
        const div = document.createElement("div");
        div.classList.add("message-item");
        div.innerHTML = `
          <h3>Donateur : ${don.nom || "Anonyme"}</h3>
          <p><strong>Email :</strong> ${don.email || "Non renseigné"}</p>
          <p><strong>Montant / Nature :</strong> ${don.nature || "Non précisé"}</p>
          <p><strong>Message :</strong> ${don.message || "Aucun message"}</p>
          <small>Reçu le : ${new Date(don.createdAt).toLocaleString()}</small>
        `;
        donsList.appendChild(div);
      });
    } catch (err) {
      donsList.innerHTML = "<p>Erreur de chargement des dons.</p>";
      console.error("Erreur chargement dons:", err);
    }
  }

  // Charger les dons au démarrage
  chargerDons();
});
