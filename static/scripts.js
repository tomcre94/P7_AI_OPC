async function predictSentiment(event) {
  event.preventDefault();

  const tweetText = document
    .querySelector('textarea[name="tweet_to_predict"]')
    .value.trim();
  const resultDiv = document.getElementById('result');
  const submitButton = document.querySelector('button[type="submit"]');

  // Vérifier si le texte est vide
  if (!tweetText) {
    resultDiv.textContent = 'Veuillez entrer un texte à analyser';
    resultDiv.style.color = '#d9534f';
    return;
  }

  // Afficher un état de chargement
  resultDiv.innerHTML =
    '<div class="loading-spinner"></div> Analyse en cours...';
  resultDiv.style.color = '#55534e';
  submitButton.disabled = true;
  submitButton.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Analyse en cours...';

  try {
    // Envoi des données à l'API Flask
    const response = await fetch('/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tweet_to_predict: tweetText }),
    });

    const data = await response.json();

    // Déterminer la couleur et l'icône en fonction du sentiment
    let color, icon;
    if (data.prediction.toLowerCase().includes('positif')) {
      color = '#6c9a6d';
      icon = 'smile';
    } else if (data.prediction.toLowerCase().includes('négatif')) {
      color = '#d9534f';
      icon = 'frown';
    } else {
      color = '#8a8e75';
      icon = 'meh';
    }

    // Affichage du résultat avec animation
    resultDiv.style.opacity = '0';
    setTimeout(() => {
      resultDiv.innerHTML = `<i class="fas fa-${icon}"></i> ${data.prediction}`;
      resultDiv.style.color = color;
      resultDiv.style.opacity = '1';

      // Affichage des boutons de feedback
      document.querySelector('.feedback-buttons').style.display = 'flex';

      // Sauvegarde le tweet pour le feedback ultérieur
      document.querySelector('.feedback-buttons').dataset.tweet = tweetText;
    }, 300);
  } catch (error) {
    resultDiv.textContent = "Une erreur est survenue lors de l'analyse";
    resultDiv.style.color = '#d9534f';
  } finally {
    // Restaurer le bouton
    submitButton.disabled = false;
    submitButton.innerHTML =
      '<i class="fas fa-search"></i> Prédire le sentiment';
  }
}

async function sendFeedback(isPositive) {
  const tweetText = document.querySelector('.feedback-buttons').dataset.tweet;
  const feedbackRoute = isPositive ? '/feedbackpositif' : '/feedbacknegatif';

  try {
    // Envoi des feedbacks à l'API Flask
    await fetch(feedbackRoute, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tweet_to_predict: tweetText }),
    });

    // Afficher la notification de remerciement
    showNotification();
  } catch (error) {
    console.error("Erreur lors de l'envoi du feedback:", error);
  }
}

function showNotification() {
  const notificationDiv = document.getElementById('notification');

  // Afficher la notification avec animation
  notificationDiv.style.display = 'block';

  // Réinitialiser le formulaire
  document.getElementById('tweet').value = '';
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = '';
  document.querySelector('.feedback-buttons').style.display = 'none';

  // Fermer automatiquement la notification après 3 secondes
  setTimeout(() => {
    notificationDiv.style.opacity = '0';
    setTimeout(() => {
      notificationDiv.style.display = 'none';
      notificationDiv.style.opacity = '1';
    }, 300);
  }, 2000);
}

// Ajouter un style pour le spinner de chargement
document.addEventListener('DOMContentLoaded', function () {
  // Créer un élément style pour les animations CSS
  const style = document.createElement('style');
  style.textContent = `
        .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(138, 142, 117, 0.3);
            border-radius: 50%;
            border-top-color: #8a8e75;
            animation: spin 1s ease-in-out infinite;
            margin-right: 10px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        #result {
            transition: opacity 0.3s ease;
        }
    `;
  document.head.appendChild(style);
});
