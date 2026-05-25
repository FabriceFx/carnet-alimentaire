# 📦 Carnet Alimentaire

[🇫🇷 Version française](#-version-française) | [🇬🇧 English Version](#-english-version)

---

## 🇫🇷 Version française

> Ce projet est une application intégrée à Google Sheets permettant de saisir, suivre et analyser facilement un journal alimentaire quotidien.

<a href="https://developers.google.com/apps-script"><img src="https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google-apps-script&logoColor=white" alt="Google Apps Script"></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-indigo?style=for-the-badge" alt="License: MIT"></a>
<a href="README.md"><img src="https://img.shields.io/badge/Status-Production-brightgreen?style=for-the-badge" alt="Status: Production"></a>

---

### ✨ Fonctionnalités clés

- 📊 **Saisie rapide (Sidebar)** : Interface latérale (HTML/CSS) pour saisir rapidement chaque repas.
- ⚡ **Auto-complétion intelligente** : Suggère les repas fréquemment saisis.
- 🛠️ **Gestion du Profil** : Espace dédié pour enregistrer ses données personnelles (Poids, Sexe, Objectifs).
- 🎨 **Interface intégrée MD3** : Interfaces élégantes inspirées de la charte officielle de Google Workspace.
- 🤖 **Analyse diététique par IA** : Chaque journée exportée vers Google Docs bénéficie d'une analyse générée par Gemini.

---

### 🚀 Installation & configuration

#### 1. Déploiement avec Clasp
1. Clonez ce dépôt.
2. Assurez-vous d'avoir installé `clasp` (`npm install -g @google/clasp`).
3. Connectez-vous à Google (`clasp login`).
4. Créez un projet Apps Script lié à un Sheet ou poussez (`clasp push`).

#### 2. Déclaration des scopes requis (`appsscript.json`)
Assurez-vous que votre manifeste contient :
```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.container.ui",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/script.external_request"
  ]
}
```

---

### 🤖 Configuration de l'analyse IA (Gemini)

1. Rendez-vous sur Google AI Studio.
2. Créez une clé API (Create API key).
3. Dans Google Sheet, menu **Carnet alimentaire > Paramètres (Clé API)**, collez la clé.

---

### 👤 Auteur

- **[Fabrice Faucheux](https://faucheux.bzh)** (FF Labs) — [GitHub](https://github.com/FabriceFx)

---

### 📄 Licence

Ce projet est sous licence MIT.

---

## 🇬🇧 English Version

> This project is a Google Sheets add-on designed to easily input, track, and analyze a daily food diary.

<a href="https://developers.google.com/apps-script"><img src="https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google-apps-script&logoColor=white" alt="Google Apps Script"></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-indigo?style=for-the-badge" alt="License: MIT"></a>
<a href="README.md"><img src="https://img.shields.io/badge/Status-Production-brightgreen?style=for-the-badge" alt="Status: Production"></a>

---

### ✨ Key Features

- 📊 **Quick Input (Sidebar)**: Side interface (HTML/CSS) to quickly input each meal.
- ⚡ **Smart Autocomplete**: Suggests frequently entered meals.
- 🛠️ **Profile Management**: Dedicated space to record personal data.
- 🎨 **Integrated MD3 UI**: Elegant interfaces inspired by official Google Workspace design.
- 🤖 **AI Dietary Analysis**: Every exported day to Google Docs gets an analysis powered by Gemini.

---

### 🚀 Installation & Setup

#### 1. Deployment via Clasp
1. Clone this repository.
2. Ensure `clasp` is installed (`npm install -g @google/clasp`).
3. Login to Google (`clasp login`).
4. Push to Apps Script (`clasp push`).

#### 2. Declaring OAuth Scopes (`appsscript.json`)
Ensure your manifest contains required scopes (Spreadsheets, UI, Documents, External Requests).

---

### 🤖 AI Analysis Setup (Gemini)

1. Go to Google AI Studio.
2. Generate an API Key.
3. In Google Sheets, menu **Carnet Alimentaire > Settings (API Key)**, paste your key.

---

### 👤 Author

- **[Fabrice Faucheux](https://faucheux.bzh)** (FF Labs) — [GitHub](https://github.com/FabriceFx)

---

### 📄 License

This project is licensed under the MIT License.

---
<p align="center"><a href="https://faucheux.bzh" target="_blank" style="color: inherit; text-decoration: none;">&lt;&gt; par Fabrice Faucheux</a></p>
