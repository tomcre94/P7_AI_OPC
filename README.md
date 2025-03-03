# API de Prédiction de Sentiments

## Objectifs

L'API de prédiction de sentiments est conçue pour aider "Air Paradis" à anticiper les réactions des utilisateurs sur les réseaux sociaux en analysant automatiquement les sentiments des tweets. Elle fournit une prédiction binaire (positive ou négative) pour chaque tweet, permettant de détecter rapidement les sentiments négatifs et d'agir avant qu'un bad buzz potentiel ne se propage.

Conçue pour être facilement intégrée dans des applications ou interfaces, l'API reçoit un texte (tweet) en entrée et retourne une prédiction de sentiment. Grâce à une approche MLOps, elle assure un suivi continu des performances et une gestion centralisée des modèles, avec un système de traçabilité pour améliorer progressivement les prédictions.

## Structure des Dossiers

- **models/** : Héberge les fichiers des modèles de machine learning ou deep learning créés pour la prédiction des sentiments. Ce dossier centralise et versionne les différents modèles utilisés ou testés durant le projet.

- **static/** : Contient les ressources statiques pour l'interface web, comme les fichiers JavaScript et CSS. Ce dossier permet de gérer et personnaliser les éléments visuels et comportements dynamiques de l’interface HTML.

- **templates/** : Inclut l’interface HTML de l’application, utilisée pour visualiser et interagir avec l’API. Ce dossier suit la convention Flask pour le rendu des templates HTML.

- **Fichiers à la racine :**
  - **app.py** : Fichier principal initialisant et configurant l'API Flask pour la prédiction de sentiments. Il inclut les routes pour recevoir un tweet et retourner une prédiction de sentiment (positif ou négatif).
  - **requirements.txt** : Liste des packages Python nécessaires pour exécuter le projet, facilitant la reproduction de l’environnement d’exécution.
  - **test_app.py** : Contient les tests unitaires, écrits avec la bibliothèque unittest, pour vérifier le bon fonctionnement des routes et des prédictions de l'API.
