# Carnet Alimentaire - Google Apps Script

Ce projet est une application intégrée à Google Sheets permettant de saisir, suivre et analyser facilement un journal alimentaire quotidien.

## 🌟 Fonctionnalités

- **Saisie Rapide (Sidebar) :** Une barre latérale moderne (HTML/CSS) pour saisir rapidement chaque repas (Période, Heure, Menu, Quantité, Cuisson).
- **Auto-complétion Intelligente :** Suggère les repas fréquemment saisis pour accélérer la saisie.
- **Gestion du Profil :** Un espace dédié pour enregistrer ses données personnelles (Poids, Sexe, Objectifs, etc.).
- **Export Automatique vers Google Docs :** Un script robuste qui regroupe les saisies par journée et génère un document de synthèse propre et mis en forme, prêt à être imprimé ou partagé avec un professionnel de la santé.
- **Analyse Diététique par IA (Gemini) :** Chaque journée exportée bénéficie d'une analyse sémantique et de conseils diététiques personnalisés générés par l'intelligence artificielle Gemini (Google AI Studio).
- **Nettoyage Automatique :** Suppression automatique des feuilles vides pour garder le classeur organisé.

## 🚀 Installation & Déploiement

Ce projet est conçu pour être exécuté via [Google Apps Script (clasp)](https://github.com/google/clasp).

1. Clonez ce dépôt.
2. Assurez-vous d'avoir installé `clasp` via npm (`npm install -g @google/clasp`).
3. Connectez-vous à votre compte Google (`clasp login`).
4. Créez un nouveau projet Apps Script lié à une Google Sheet (`clasp create --type sheets` ou modifiez le fichier `.clasp.json` existant pour lier l'ID de votre Sheet).
5. Poussez le code sur Apps Script (`clasp push`).
6. Ouvrez votre Google Sheet et autorisez l'exécution du script lors de la première ouverture du menu `Carnet Alimentaire`.

## 🤖 Configuration de l'Analyse IA (Gemini)

Pour activer les conseils diététiques générés par l'intelligence artificielle lors de l'export vers Google Docs, vous devez configurer une clé API gratuite :

1. Rendez-vous sur [Google AI Studio](https://aistudio.google.com/app/apikey) et connectez-vous.
2. Cliquez sur **"Create API key"** et copiez la clé générée.
3. Dans votre Google Sheet, allez dans le menu **Carnet Alimentaire > Paramètres (Clé API)**.
4. Collez la clé dans le champ et cliquez sur Enregistrer.

*Le script utilise le modèle `gemini-3.5-flash` pour garantir des réponses rapides et qualitatives.*

## 📂 Architecture des fichiers

- `Code.gs` : Le cœur logique de l'application (serveur). Contient les fonctions de menu, de traitement des données, de création de documents Docs, et d'appels à l'API Gemini.
- `Sidebar.html` : L'interface utilisateur HTML/CSS/JS de la barre latérale pour la saisie des repas.
- `Profil.html` : L'interface de configuration du profil utilisateur.
- `Settings.html` : L'interface pour configurer la clé API Gemini de manière sécurisée (PropertiesService).
- `appsscript.json` : Le fichier de manifeste avec les autorisations (OAuth scopes) et la configuration du fuseau horaire.

## 🛡️ Robustesse des Données

- Utilisation exclusive de sélecteurs par nom de feuille ou par contenu d'en-tête (contournement de `getActiveSheet()`) pour éviter d'écraser des données par erreur.
- La colonne "Menu" est localisée dynamiquement en lisant l'en-tête, rendant le script insensible aux réorganisations manuelles des colonnes par l'utilisateur.

---
*Développé pour simplifier le suivi nutritionnel.*
