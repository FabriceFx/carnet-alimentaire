# Guide de Standardisation et d'Harmonisation — FF Labs Google Apps Script

> **À destination des assistants IA (Google Gemini, Claude, etc.) et des développeurs.**
> Ce document est la **référence normative unique** pour tous les projets Google Apps Script de **Fabrice Faucheux (FF Labs)**. Tout code généré ou modifié dans ce contexte doit impérativement respecter l'intégralité des conventions définies ici. En cas de doute ou de conflit avec d'autres sources, ce guide prévaut.

---

## 📋 Table des Matières

1. [🏗️ Architecture & Normes de Code (.gs)](#1-️-architecture--normes-de-code-gs)
   - [A. Structure type d'un projet Google Apps Script](#a-structure-type-dun-projet-google-apps-script)
   - [B. Standardisation JSDoc](#b-standardisation-jsdoc)
   - [C. Le Point d'Entrée Principal (Code.gs)](#c-le-point-dentrée-principal-codegs)
   - [D. Le Helper d'Inclusion Côté Serveur (Utils.gs)](#d-le-helper-dinclusion-côté-serveur-utilsgs)
   - [E. Gestion Centralisée de la Configuration & Logs](#e-gestion-centralisée-de-la-configuration--logs)
   - [F. En-tête descriptif obligatoire pour chaque fichier .gs](#f-en-tête-descriptif-obligatoire-pour-chaque-fichier-gs)
   - [G. Communication Client-Serveur (google.script.run)](#g-communication-client-serveur-googlescriptrun)
   - [H. Performance & Traitement par Lots (Batching)](#h-performance--traitement-par-lots-batching)
   - [I. Sécurité & Gestion des Secrets (PropertiesService)](#i-sécurité--gestion-des-secrets-propertiesservice)
   - [J. Conventions de Nommage & de Casse (Casing)](#j-conventions-de-nommage--de-casse-casing)
2. [🎨 Système de Design & Interfaces (HTML/CSS - Google Workspace)](#2--système-de-design--interfaces-htmlcss---google-workspace)
   - [A. Palette de Couleurs Standard (Google Workspace Officiel)](#a-palette-de-couleurs-standard-google-workspace-officiel)
   - [B. Typographie & Règles de Casse (Français)](#b-typographie--règles-de-casse-français)
   - [C. Fichier CSS Unifié (Stylesheet.html)](#c-fichier-css-unifié-stylesheethtml)
   - [D. Pied de page figé (Footer) unifié des barres latérales](#d-pied-de-page-figé-footer-unifié-des-barres-latérales)
   - [E. Charte Graphique & Structure pour les E-mails de Notification](#e-charte-graphique--structure-pour-les-e-mails-de-notification)
   - [F. Ressources Externes & Icônes (Vanilla CSS & SVG Inline)](#f-ressources-externes--icônes-vanilla-css--svg-inline)
3. [🌐 Norme de Bilinguisme Intégral (FR/EN)](#3--norme-de-bilinguisme-intégral-fren)
4. [📄 Modèle Standard de README.md](#4--modèle-standard-de-readmemd)
5. [⚡ Checklist d'Harmonisation d'un Projet](#5--checklist-dharmonisation-dun-projet)

---

## 1. 🏗️ Architecture & Normes de Code (.gs)

Pour que les scripts soient maintenables et homogènes, chaque projet doit suivre une structure claire et des principes de développement rigoureux.

### A. Structure type d'un projet Google Apps Script

Dans Google Apps Script, tous les fichiers se terminent techniquement par `.gs` (côté serveur) ou `.html` (côté client). Pour unifier les projets, adopter cette structure :

```text
📂 NomDuProjet/
├── 📝 Code.gs                 # Logique d'initialisation, menus et points d'entrée
├── 📝 Config.gs               # Constantes globales, clés d'API et configurations
├── 📝 Utils.gs                # Helpers server-side (dont la fonction d'inclusion HTML)
├── 📝 ServiceSpecifique.gs    # Modules de classes ou services propres (ex: MonService.gs)
├── 📄 Sidebar.html            # Structure HTML de la barre latérale (ou boîte de dialogue)
├── 📄 Stylesheet.html         # Styles CSS unifiés (encapsulés dans une balise <style>)
├── 📄 JavaScript.html         # Scripts JS client-side (encapsulés dans une balise <script>)
└── ⚙️ appsscript.json         # Manifeste du projet (OAuth scopes, bibliothèques)
```

> [!TIP]
> **Comment afficher `appsscript.json` dans l'éditeur ?**
> Par défaut, Google masque le manifeste. Pour le rendre visible :
> 1. Cliquez sur la **roue crantée (Paramètres du projet)** dans le menu latéral gauche de l'éditeur Apps Script.
> 2. Cochez la case **"Afficher le fichier manifeste appsscript.json dans l'éditeur"**.
> 3. Revenez à l'éditeur (icône code `<>`) : le fichier est apparu !

---

### B. Standardisation JSDoc

Chaque fonction et classe doit posséder un bloc JSDoc complet décrivant précisément son rôle, ses paramètres typés, et ses valeurs de retour. Cela garantit une autocomplétion parfaite dans l'IDE.

```javascript
/**
 * Exemple de classe documentée selon la norme JSDoc FF Labs.
 * @class
 */
class MonService {
  /**
   * @param {Object} config - Configuration d'initialisation du service.
   * @param {string} config.spreadsheetId - L'ID du Spreadsheet parent.
   * @param {string} config.sheetName - Le nom de l'onglet cible.
   * @param {number} config.sheetId - L'ID numérique de l'onglet Sheets.
   */
  constructor(config) {
    /** @private @type {string} */
    this.spreadsheetId = config.spreadsheetId;
    /** @private @type {string} */
    this.sheetName = config.sheetName;
    /** @private @type {number} */
    this.sheetId = config.sheetId;
  }

  /**
   * Exemple de méthode avec chaînage.
   *
   * @param {string} newName - La nouvelle valeur à appliquer.
   * @return {MonService} L'instance active pour le chaînage de méthodes.
   * @throws {Error} Si la valeur est vide ou n'est pas une chaîne de caractères.
   */
  setName(newName) {
    if (!newName || typeof newName !== "string") {
      throw new Error("Valeur invalide. Une chaîne non vide est requise.");
    }
    // Logique métier...
    return this;
  }
}
```

---

### C. Le Point d'Entrée Principal (`Code.gs`)

Pour que les fichiers HTML (`Stylesheet.html`, `JavaScript.html`) soient correctement assemblés et que les balises dynamiques soient interprétées, il est **obligatoire** de charger la Sidebar sous forme de **Template** et de l'**évaluer** avant l'affichage.

```javascript
// Code.gs

/**
 * Crée le menu personnalisé dans l'interface de Google Sheets / Docs.
 * Adapter le nom du menu et les items au projet concerné.
 */
function onOpen() {
  SpreadsheetApp.getUi() // Ou DocumentApp pour Google Docs
    .createMenu("🔧 Nom du Menu")
    .addItem("Ouvrir le panneau", "ouvrirSidebar")
    .addToUi();
}

/**
 * Ouvre la barre latérale en évaluant les scriptlets dynamiques.
 * Le titre et la largeur sont à adapter selon le projet.
 */
function ouvrirSidebar() {
  // Obligatoire : createTemplateFromFile pour interpréter les balises <?!= include(...) ?>
  const template = HtmlService.createTemplateFromFile("Sidebar");

  // Passage de la langue de l'utilisateur pour le bilinguisme automatique (voir Section 3)
  template.locale = Session.getActiveUserLocale();

  const html = template.evaluate()
    .setTitle("Titre de la sidebar")
    .setWidth(300); // Largeur standard fixe Google Workspace

  SpreadsheetApp.getUi().showSidebar(html);
}
```

---

### D. Le Helper d'Inclusion Côté Serveur (`Utils.gs`)

Pour éviter des lignes d'inclusion complexes dans les interfaces HTML, déclarer ce helper standard unique dans le fichier `Utils.gs`.

```javascript
// Utils.gs

/**
 * Inclut le contenu d'un fichier HTML (CSS ou JS) directement dans un template.
 * Utile pour modulariser les fichiers Stylesheet.html et JavaScript.html.
 * Note : l'éditeur Apps Script masquant l'extension .html, passer uniquement le nom
 * (ex: 'Stylesheet', 'JavaScript').
 *
 * @param {string} filename - Le nom du fichier à inclure (sans extension .html).
 * @return {string} Le contenu textuel brut du fichier.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
```

---

### E. Gestion Centralisée de la Configuration & Logs

Chaque projet doit posséder un fichier `Config.gs` centralisant les préférences et la gestion des erreurs.

> [!IMPORTANT]
> **Format de version obligatoire : SemVer `X.Y.Z`** (ex: `1.0.0`, `2.3.1`). Ce format à trois niveaux est la norme unique pour tous les projets FF Labs. Ne pas utiliser le format à deux niveaux `X.Y`.

```javascript
// Config.gs

/**
 * Objet de configuration central du projet.
 * Adapter PROJECT_NAME et VERSION à chaque projet.
 * DEBUG_MODE : passer à false avant tout déploiement en production.
 */
const CONFIG = {
  PROJECT_NAME: "NomDuProjet",    // Remplacer par le nom exact du projet
  VERSION: "1.0.0",               // Format SemVer X.Y.Z obligatoire
  CACHE_DURATION: 300,            // Durée de cache en secondes
  DEBUG_MODE: true,               // Mettre à false en production
  COLORS: {
    PRIMARY: "#0b57d0",
    SECONDARY: "#444746"
  }
};

/**
 * Système de journalisation unifié pour tous les projets FF Labs.
 * En mode DEBUG_MODE actif, les logs INFO sont également affichés.
 * La branche ERROR est intentionnellement laissée ouverte : chaque projet
 * peut y brancher un enregistrement dans Sheets ou un envoi de mail d'alerte.
 *
 * @param {string} message - Message de log.
 * @param {string} [level="INFO"] - Niveau de sévérité : INFO, WARN ou ERROR.
 */
function logEvent(message, level = "INFO") {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${CONFIG.PROJECT_NAME} v${CONFIG.VERSION}] [${level}] ${message}`;

  console.log(logMessage);

  if (level === "ERROR") {
    // À compléter selon le projet : enregistrement dans une feuille dédiée,
    // envoi d'un e-mail d'alerte, etc.
  }
}
```

---

### F. En-tête descriptif obligatoire pour chaque fichier `.gs`

Pour assurer une traçabilité parfaite et faciliter la maintenance, **chaque fichier `.gs` doit obligatoirement comporter un en-tête standardisé** sous forme de commentaire de bloc JSDoc en tout début de fichier. Cet en-tête présente l'outil, l'auteur officiel, le projet parent, le rôle spécifique du fichier et sa version courante.

> [!IMPORTANT]
> La version indiquée dans cet en-tête doit être au format **SemVer `X.Y.Z`** et rester synchronisée avec `CONFIG.VERSION` dans `Config.gs`.

#### Gabarit d'en-tête standardisé :

```javascript
/**
 * ============================================================================
 *  NOM DE L'OUTIL EN MAJUSCULES (ex: TRAQUEUR DE TEMPS / MON APPLICATION)
 * ============================================================================
 *  Auteur      : Fabrice Faucheux (https://faucheux.bzh)
 *  Projet      : Nom de l'application parente (ex: FF Labs - Mon Application)
 *  Rôle        : Description claire et synthétique du contenu de ce fichier.
 *                (Seul le premier mot prend une majuscule en français.)
 *  Version     : X.Y.Z (ex: 1.0.0)
 * ============================================================================
 */
```

---

### G. Communication Client-Serveur (`google.script.run`)

Les appels asynchrones entre l'interface utilisateur (`JavaScript.html`) et le code serveur (`.gs`) doivent être sécurisés, gérer proprement l'état d'avancement et intercepter les erreurs.

> [!IMPORTANT]
> **Règle de gestion des flux asynchrones :**
> Tout appel de fonction via `google.script.run` doit obligatoirement :
> 1. Afficher l'overlay de chargement flouté (`#loadingOverlay`) immédiatement avant l'appel.
> 2. Définir explicitement `.withSuccessHandler()` et `.withFailureHandler()`.
> 3. Masquer l'overlay dans les deux gestionnaires de retour.
> 4. Afficher un toast rouge d'erreur explicite en cas d'échec de la fonction serveur.

#### Modèle d'appel type recommandé :

```javascript
// JavaScript.html
function executerActionServeur() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.add("show");

  google.script.run
    .withSuccessHandler((result) => {
      if (overlay) overlay.classList.remove("show");
      
      // Notification succès
      showToast(getTxt("msgSuccess"), "success");
      
      // Logique additionnelle de mise à jour de l'UI...
    })
    .withFailureHandler((error) => {
      if (overlay) overlay.classList.remove("show");
      
      // Notification erreur explicite
      showToast(getTxt("msgError") + " : " + error.message, "error");
      
      // Journalisation de l'erreur côté serveur
      google.script.run.logEvent("Erreur d'appel client : " + error.message, "ERROR");
    })
    .maFonctionServeur(); // Nom de la fonction serveur .gs
}
```

---

### H. Performance & Traitement par Lots (Batching)

Les appels vers les services Google Workspace (en particulier `SpreadsheetApp`) sont coûteux en temps de traitement. Réduire au maximum le nombre d'allers-retours serveur en lisant et écrivant de grands volumes de données en une seule opération.

> [!WARNING]
> **Règle absolue sur les boucles de données :**
> Il est strictement interdit d'utiliser des méthodes de lecture ou d'écriture individuelles (`getValue()`, `setValue()`, `setRowHeight()`, etc.) à l'intérieur d'une boucle `for` ou `forEach`.

#### ❌ Mauvaise pratique (à proscrire) :
```javascript
// Ralentit considérablement l'exécution et risque d'atteindre le quota de temps limite
for (let i = 1; i <= 100; i++) {
  sheet.getRange(i, 1).setValue("Valeur " + i);
}
```

#### ✅ Bonne pratique (obligatoire) :
```javascript
// Un seul appel d'écriture en base, exécution instantanée
const data = [];
for (let i = 1; i <= 100; i++) {
  data.push(["Valeur " + i]);
}
sheet.getRange(1, 1, 100, 1).setValues(data);
```

---

### I. Sécurité & Gestion des Secrets (`PropertiesService`)

La sécurité du code source est une priorité. Les projets FF Labs pouvant être partagés ou hébergés sur des dépôts de code publics (comme GitHub), aucun secret d'authentification ou paramètre confidentiel ne doit être écrit en clair dans le code.

> [!CAUTION]
> **Aucun secret dans Config.gs :**
> Les clés d'API, les jetons d'accès, les mots de passe et les identifiants tiers doivent être stockés en toute sécurité dans les propriétés du script à l'aide de `PropertiesService`. Ne jamais les coder en dur dans l'objet `CONFIG`.

#### Lecture sécurisée d'un secret :
```javascript
// Config.gs ou ServiceSpecifique.gs

/**
 * Récupère de façon sécurisée la clé d'API pour le service externe.
 * @return {string} La clé d'API configurée.
 * @throws {Error} Si la clé d'API n'a pas été définie dans les Script Properties.
 */
function getApiKey() {
  const apiKey = PropertiesService.getScriptProperties().getProperty("API_KEY");
  if (!apiKey) {
    throw new Error("Clé d'API manquante. Veuillez la configurer dans les paramètres du script (API_KEY).");
  }
  return apiKey;
}
```

*Note : Configurez les clés via les paramètres du projet Google Apps Script (icône engrenage ⚙️ -> Propriétés du script).*

---

### J. Conventions de Nommage & de Casse (Casing)

Pour garantir une harmonie totale et faciliter le travail de lecture collaborative et de maintenance, appliquer rigoureusement ces règles de casse :

| Élément | Format | Exemple | Commentaire |
| :--- | :--- | :--- | :--- |
| **Classes** | `PascalCase` | `MonService` | Initiales majuscules pour chaque mot |
| **Fonctions** | `camelCase` | `ouvrirSidebar` | Première lettre minuscule, puis majuscules |
| **Variables locales** | `camelCase` | `sheetName` | Identique aux fonctions |
| **Constantes / Config** | `UPPER_SNAKE_CASE` | `CONFIG.VERSION` | Majuscules séparées par des underscores |
| **Identifiants HTML** | `camelCase` | `btnSubmit` | Préfixe du type de composant recommandé (`btn`, `txt`, `card`) |
| **Clés de dictionnaire** | `camelCase` | `headerSubtitle` | Pour les dictionnaires de traduction FR/EN |

---

## 2. 🎨 Système de Design & Interfaces (HTML/CSS - Google Workspace)

Pour que les modules complémentaires fassent corps avec les applications hôtes (Google Sheets et Google Docs), les interfaces doivent respecter la charte officielle de **Google Workspace (Material Design 3)**.

### A. Palette de Couleurs Standard (Google Workspace Officiel)

Les couleurs de l'interface s'alignent directement sur la charte des barres de menu et barres d'outils de Google Sheets et Docs :

| Élément | Couleur | Code Hex | Usage / Description |
| :--- | :--- | :--- | :--- |
| **Principal (Primary)** | Bleu Google | `#0b57d0` | Actions majeures, boutons principaux, focus |
| **Survol (Hover)** | Bleu Foncé | `#0842a0` | État de survol des boutons primaires |
| **Secondaire (Secondary)** | Anthracite | `#444746` | Textes de description, labels, boutons contours |
| **Arrière-plan (Background)** | Gris-Bleu natif | `#f3f6fc` | Couleur de fond globale de la barre latérale |
| **Cartes (Cards)** | Blanc Pur | `#ffffff` | Blocs de formulaires ou conteneurs de données |
| **Bordures fines (Light)** | Gris clair | `#e3e3e3` | Contours de cartes, header, footer — à utiliser via `--border-light` |
| **Bordures / Lignes** | Gris standard | `#c7c7c7` | Lignes de délimitation des inputs — via `--border` |
| **Succès (Success)** | Vert Google | `#146c2e` | Validation, sauvegarde réussie |
| **Erreur (Danger)** | Rouge Google | `#b3261e` | Alertes, erreurs de clé ou de quotas |

---

### B. Typographie & Règles de Casse (Français)

Conformément aux directives de style Google, utiliser la police **Open Sans** (pour les en-têtes et le branding) et **Inter** (pour les textes denses de lecture) :

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

> [!IMPORTANT]
> **Règle typographique de casse en français**
> Pour tous les titres, labels, options de formulaires et boutons rédigés en français, appliquer rigoureusement le **Sentence case** : **seul le tout premier mot commence par une majuscule** (ex: *« Options globales »*, *« Nouveau tableau »*, *« Appliquer les styles »*). Ne jamais mettre de majuscules sur chaque mot comme en anglais.
>
> Cette règle s'applique également aux **gabarits et placeholders** de ce guide : toute valeur d'exemple en français doit respecter le Sentence case.

---

### C. Fichier CSS Unifié (`Stylesheet.html`)

Feuille de style globale à importer dans l'en-tête de toutes les sidebars pour garantir l'intégration native Workspace.

> [!NOTE]
> **Cohérence des variables CSS** : toutes les couleurs utilisées dans le CSS doivent être déclarées comme variables dans `:root`. En particulier, `#e3e3e3` (bordures fines) est exposé via `--border-light`, et `--footer-height` permet de synchroniser automatiquement le `padding-bottom` du `.container` avec la hauteur réelle du `.footer`.

```html
<style>
  /* Variables CSS — Charte Google Workspace (Material Design 3) */
  :root {
    --primary: #0b57d0;
    --primary-hover: #0842a0;
    --secondary: #444746;
    --bg-app: #f3f6fc;
    --bg-card: #ffffff;
    --text-main: #1f1f1f;
    --text-muted: #444746;
    --border: #c7c7c7;           /* Inputs et délimitations standard */
    --border-light: #e3e3e3;     /* Contours légers : cartes, header, footer */
    --border-focus: #0b57d0;
    --success: #146c2e;
    --error: #b3261e;
    --radius-lg: 16px;           /* Bordure des cartes MD3 */
    --radius-md: 8px;            /* Bordure des inputs */
    --radius-sm: 4px;            /* Petits éléments */
    --radius-pill: 100px;        /* Bouton pilule officiel Google */
    --transition: all 0.15s ease-in-out;
    --footer-height: 60px;       /* Hauteur du footer figé — synchronisée avec .container */
  }

  /* Reset & Base */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Open Sans', 'Inter', system-ui, -apple-system, sans-serif;
    background-color: var(--bg-app);
    color: var(--text-main);
    font-size: 13px;
    line-height: 1.5;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  /* Conteneur principal défilant */
  .container {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    padding-bottom: var(--footer-height); /* Espace réservé au footer figé */
  }

  /* En-tête de Sidebar épuré blanc natif */
  .header {
    background: var(--bg-card);
    color: var(--text-main);
    padding: 16px;
    border-bottom: 1px solid var(--border-light);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .header h1 {
    font-size: 15px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    letter-spacing: -0.01em;
  }

  .header h1 svg {
    color: var(--primary);
  }

  .header p {
    font-size: 11px;
    color: var(--text-muted);
  }

  /* Cartes de contenu plates sans ombre lourde (MD3 Flat Style) */
  .card {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 14px;
    margin-bottom: 12px;
    box-shadow: none;
    transition: var(--transition);
  }

  .card:hover {
    border-color: #b8b8b8;
  }

  .card-title {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-main);
  }

  /* Formulaires Workspace */
  .form-group {
    margin-bottom: 10px;
  }

  .label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    color: var(--text-muted);
    margin-bottom: 4px;
  }

  .input, .select {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 12px;
    background-color: var(--bg-card);
    color: var(--text-main);
    transition: var(--transition);
  }

  .input:focus, .select:focus {
    outline: none;
    border: 2px solid var(--primary);
    padding: 5px 9px; /* Compense le pixel de bordure supplémentaire */
  }

  /* Toast Notification (style Toast Android / Google Workspace) */
  .toast {
    position: fixed;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    background: #322f35;
    color: #f5eff7;
    padding: 10px 16px;
    border-radius: var(--radius-md);
    font-size: 11px;
    font-weight: 400;
    box-shadow: 0 3px 5px -1px rgba(0,0,0,0.2), 0 6px 10px 0 rgba(0,0,0,0.14);
    z-index: 100;
    opacity: 0;
    transition: all 0.2s ease-in-out;
    pointer-events: none;
    white-space: nowrap;
  }
  .toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  .toast.error {
    border-left: 4px solid var(--error);
  }
  .toast.success {
    border-left: 4px solid var(--success);
  }

  /* Boutons d'Action (format Pilule Workspace) */
  .btn {
    width: 100%;
    padding: 8px 16px;
    font-weight: 600;
    font-size: 12px;
    text-align: center;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    transition: var(--transition);
    margin-top: 4px;
    border: none;
  }

  .btn-primary {
    background-color: var(--primary);
    color: white;
    border-radius: var(--radius-pill);
  }

  .btn-primary:hover {
    background-color: var(--primary-hover);
    box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
  }

  .btn-secondary {
    background-color: transparent;
    color: var(--primary);
    border: 1px solid #747775;
    border-radius: var(--radius-pill);
  }

  .btn-secondary:hover {
    background-color: var(--bg-app);
    border-color: var(--primary);
  }

  /* Pied de page figé (Footer) */
  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: var(--footer-height);       /* Hauteur pilotée par la variable CSS */
    padding: 10px 12px;
    background-color: var(--bg-card);
    border-top: 1px solid var(--border-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: var(--text-muted);
    z-index: 10;
  }

  .footer-logo {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
    color: var(--secondary);
  }

  .footer-links a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;
  }

  .footer-links a:hover {
    text-decoration: underline;
  }

  /* Overlay chargeur flouté Google */
  #loadingOverlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(4px);         /* Supporté dans l'iframe GAS (Chromium) */
    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
  }
  #loadingOverlay.show {
    opacity: 1;
    pointer-events: auto;
  }

  .overlay-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(11, 87, 208, 0.15);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .animated-fade {
    animation: fadeIn 0.2s cubic-bezier(0, 0, 0.2, 1) forwards;
  }
</style>
```

---

### D. Pied de page figé (Footer) unifié des barres latérales

Chaque barre latérale (`Sidebar.html`) doit comporter un pied de page fixe offrant une signature harmonisée. Ce pied de page présente le logo officiel, le nom de l'entité, le lien de signature cliquable et un lien d'aide menant au dépôt GitHub public du projet.

> [!IMPORTANT]
> **Identifiant GitHub officiel et formatage des URLs**
> 1. Utiliser exclusivement l'identifiant GitHub officiel **`FabriceFx`** (avec respect des majuscules) dans tous les pieds de page et documentations.
> 2. Le lien d'aide doit pointer vers l'URL exacte du dépôt GitHub du projet concerné : `https://github.com/FabriceFx/NOM_DU_DEPOT`.
> 3. Tout ancien identifiant textuel différent (ex: `fabrice` en minuscules) est obsolète et génère une erreur 404 — ne pas l'utiliser.

#### Structure HTML standard :

```html
<!-- Pied de page officiel FF Labs -->
<div class="footer">
  <div class="footer-logo">
    <span>⚡ FF Labs</span>
  </div>
  <div>
    <a href="https://faucheux.bzh" target="_blank" style="color: inherit; text-decoration: none;">&lt;&gt; par Fabrice Faucheux</a>
  </div>
  <div class="footer-links">
    <a href="https://github.com/FabriceFx/NOM_DU_DEPOT" target="_blank" id="txt-footerHelp">Aide</a>
  </div>
</div>
```

---

### E. Charte Graphique & Structure pour les E-mails de Notification

Tous les e-mails de notification envoyés par les applications (rapports automatiques, bilans périodiques, alertes de sécurité) doivent présenter une identité graphique forte et standardisée, permettant aux destinataires de reconnaître instantanément la marque **FF Labs**.

#### 1. Directives d'Harmonisation Visuelle

- **Palette de couleurs** : fond gris-bleu Workspace (`#f3f6fc`), carte centrale blanc pur (`#ffffff`) avec bordures extra-fines (`1px solid #e3e3e3`), accents en bleu Workspace (`#0b57d0`).
- **Structure en carte épurée (MD3 Flat)** : conteneur d'une largeur maximale de **600px**, centré horizontalement, avec coins arrondis de **16px**.
- **En-tête de marque** : emoji thématique centré suivi du nom officiel du module (ex: `⚡ FF Labs`, `⏱️ Nom du module`).
- **Bouton d'action pilule** : tout appel à l'action doit être un bouton pilule (`border-radius: 100px`), fond bleu (`#0b57d0`), texte gras blanc.
- **Typographie** : pile de polices `'Open Sans', 'Inter', system-ui, -apple-system, sans-serif`.
- **Sentence case obligatoire** : tous les textes en français respectent le Sentence case (voir Section 2.B).
- **Signature obligatoire** : chaque e-mail se termine par le bloc de signature standardisé ci-dessous.

#### Bloc de signature standardisé (réutilisable) :

```html
<div style="text-align: center; margin-top: 20px; font-size: 11px; color: #444746; line-height: 1.4;">
  <p style="margin: 0 0 10px 0;">Ce message a été généré automatiquement par vos outils de développement.</p>
  <div style="margin-top: 14px; display: flex; justify-content: center; gap: 16px; font-size: 10px;">
    <span style="font-weight: bold; color: #444746;">⚡ FF Labs</span>
    <a href="https://faucheux.bzh" target="_blank" style="color: #0b57d0; text-decoration: none; font-weight: 600;">&lt;&gt; par Fabrice Faucheux</a>
  </div>
</div>
```

#### 2. Gabarit HTML standard pour `MailApp.sendEmail` :

```html
<meta charset="UTF-8">
<div style="background-color: #f3f6fc; padding: 24px; font-family: 'Open Sans', 'Inter', system-ui, -apple-system, sans-serif; color: #1f1f1f; max-width: 600px; margin: 0 auto; border-radius: 16px;">

  <!-- En-tête de marque -->
  <div style="text-align: center; margin-bottom: 20px;">
    <span style="font-size: 18px; font-weight: 700; color: #0b57d0; letter-spacing: -0.3px;">⚡ Nom de l'application</span>
  </div>

  <!-- Carte principale blanche -->
  <div style="background-color: #ffffff; border: 1px solid #e3e3e3; border-radius: 16px; padding: 24px; box-shadow: none;">
    <h2 style="font-size: 16px; font-weight: 600; color: #1f1f1f; margin-top: 0; margin-bottom: 6px;">Titre de la notification</h2>
    <p style="font-size: 13px; color: #444746; margin-top: 0; margin-bottom: 20px;">Sous-titre descriptif ou période d'activité</p>

    <!-- Zone de contenu ou tableau de KPI -->
    <p style="font-size: 13px; line-height: 1.6; color: #1f1f1f;">
      Texte de notification ici, rédigé en <strong>Sentence case</strong>.
    </p>

    <!-- Bouton d'action standardisé -->
    <div style="text-align: center; margin-top: 24px;">
      <a href="URL_ACTION" target="_blank" style="background-color: #0b57d0; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 100px; font-size: 13px; font-weight: 600; display: inline-block; box-shadow: 0 1px 3px rgba(11, 87, 208, 0.2);">Libellé du bouton</a>
    </div>
  </div>

  <!-- Pied de page & signature réglementaire -->
  <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #444746; line-height: 1.4;">
    <p style="margin: 0 0 10px 0;">Ce message a été généré automatiquement par vos outils de développement.</p>
    <div style="margin-top: 14px; display: flex; justify-content: center; gap: 16px; font-size: 10px;">
      <span style="font-weight: bold; color: #444746;">⚡ FF Labs</span>
      <a href="https://faucheux.bzh" target="_blank" style="color: #0b57d0; text-decoration: none; font-weight: 600;">&lt;&gt; par Fabrice Faucheux</a>
    </div>
  </div>

</div>

---

### F. Ressources Externes & Icônes (Vanilla CSS & SVG Inline)

Pour garantir une autonomie maximale, une esthétique premium et des performances d'affichage instantanées sans dépendances de réseaux externes dans les sidebars ou dialogues Google Workspace :

> [!TIP]
> **Autarcie graphique absolue :**
> 1. Ne pas charger de framework CSS externe (ex : Bootstrap, Tailwind, Bulma) sauf sur demande utilisateur explicite et justifiée. Toujours utiliser le système CSS unifié de `Stylesheet.html`.
> 2. **Ne jamais charger de polices d'icônes tierces** via des balises `<link>` (ex: FontAwesome, Material Design Icons) ou via des CDN.
> 3. Utiliser obligatoirement des **balises SVG inline** (`<svg>...</svg>`) directement insérées dans le HTML pour tous les éléments graphiques et icônes.

#### Exemple d'utilisation d'une icône SVG inline propre :

```html
<!-- Bouton avec icône SVG inline Material Design unifiée -->
<button class="btn btn-primary" id="btnSubmit">
  <!-- Icône de chargement/flèche intégrée au format SVG -->
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; vertical-align: middle;">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
  <span id="btnSubmitText">Ajouter l'élément</span>
</button>
```
```

---

## 3. 🌐 Norme de Bilinguisme Intégral (FR/EN)

Toutes les applications (interfaces utilisateur, aides en ligne, titres, boutons, alertes et messages d'erreur) doivent être **intégralement bilingues Français / Anglais**. L'interface s'adapte de façon transparente à la locale de l'utilisateur de Google Workspace.

### A. Détection automatique de la langue (Serveur)

Passer la locale de l'utilisateur depuis `Code.gs` lors de la création du template HTML (voir [Section 1.C](#c-le-point-dentrée-principal-codegs)) :

```javascript
template.locale = Session.getActiveUserLocale(); // ex: 'fr' ou 'en'
```

---

### B. Dictionnaire de Traduction Unifié (Client-Side)

Dans `JavaScript.html`, déclarer une constante `USER_LOCALE` récupérant la valeur serveur, puis utiliser un dictionnaire structuré `TRANSLATIONS` pour alimenter dynamiquement les éléments HTML.

Le dictionnaire ci-dessous est un exemple générique à adapter pour chaque projet. Toutes les clés présentes en `fr` doivent avoir leur équivalent en `en`.

```html
<!-- JavaScript.html -->
<script>
  // 1. Récupération de la locale injectée par le serveur (défaut : 'en')
  const USER_LOCALE = "<?!= locale ?>".toLowerCase().startsWith('fr') ? 'fr' : 'en';

  // 2. Dictionnaire de traduction global de l'application
  //    Toutes les clés FR doivent avoir leur équivalent EN.
  const TRANSLATIONS = {
    fr: {
      headerSubtitle: "Description courte de l'application",
      cardTitleNew: "Nouvel élément",
      labelFieldName: "Nom du champ",
      btnCreate: "Créer",
      btnCreating: "Création en cours...",
      msgSuccess: "✅ Opération réalisée avec succès !",
      msgError: "❌ Une erreur est survenue.",
      placeholderName: "Ex : MonElement_2026"
    },
    en: {
      headerSubtitle: "Short application description",
      cardTitleNew: "New item",
      labelFieldName: "Field name",
      btnCreate: "Create",
      btnCreating: "Creating...",
      msgSuccess: "✅ Operation completed successfully!",
      msgError: "❌ An error occurred.",
      placeholderName: "E.g.: MyItem_2026"
    }
  };

  // Raccourci pour obtenir une traduction (avec fallback sur 'en', puis sur la clé brute)
  function getTxt(key) {
    return TRANSLATIONS[USER_LOCALE][key] || TRANSLATIONS['en'][key] || key;
  }

  // 3. Application dynamique au chargement de l'interface
  document.addEventListener('DOMContentLoaded', () => {
    // Exemple d'injection — adapter les IDs aux éléments réels du projet
    document.getElementById('headerSubtitleText').textContent = getTxt('headerSubtitle');
    document.getElementById('cardTitleNewText').textContent   = getTxt('cardTitleNew');
    document.getElementById('labelFieldNameText').textContent = getTxt('labelFieldName');
    document.getElementById('mainInput').placeholder          = getTxt('placeholderName');
    document.getElementById('btnSubmit').textContent          = getTxt('btnCreate');
  });

  // Utilisation dans les toasts dynamiques
  function afficherSucces() {
    showToast(getTxt('msgSuccess'), 'success');
  }
</script>
```

---

## 4. 📄 Modèle Standard de README.md

La documentation est la vitrine des projets. Pour garantir une portée internationale et un professionnalisme maximal, **chaque projet doit obligatoirement posséder un fichier `README.md` bilingue (Français et Anglais)**.

Insérer un sélecteur de langue en haut du fichier :
> `[🇫🇷 Version Française](#-version-française) | [🇬🇧 English Version](#-english-version)`

> [!IMPORTANT]
> **Badge de statut** : utiliser `brightgreen` ou `success` pour les badges shields.io (pas `emerald`, qui n'est pas une couleur nommée valide et s'affiche en gris par défaut).

Canevas bilingue type à utiliser pour chaque projet :

````markdown
# 📦 NomDuProjet

[🇫🇷 Version Française](#-version-française) | [🇬🇧 English Version](#-english-version)

---

## 🇫🇷 Version Française

> Description courte, percutante et professionnelle du projet.

<a href="https://developers.google.com/apps-script"><img src="https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google-apps-script&logoColor=white" alt="Google Apps Script"></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-indigo?style=for-the-badge" alt="License: MIT"></a>
<a href="README.md"><img src="https://img.shields.io/badge/Status-Production-brightgreen?style=for-the-badge" alt="Status: Production"></a>

---

### ✨ Fonctionnalités clés

- 📊 **Fonctionnalité 1** : Description de la première fonctionnalité majeure.
- ⚡ **Fonctionnalité 2** : Description de la deuxième fonctionnalité majeure.
- 🛠️ **Fonctionnalité 3** : Description de la troisième fonctionnalité majeure.
- 🎨 **Interface intégrée** : Barre latérale élégante inspirée de la charte officielle de Google Workspace.

---

### 🚀 Installation & configuration

#### 1. Intégration dans votre script
Ajoutez le code source direct à votre projet ou liez le script en tant que bibliothèque :
1. Dans l'éditeur Apps Script, cliquez sur le bouton **Ajouter une bibliothèque** (`+`).
2. Saisissez l'ID de bibliothèque du projet : `VOTRE_LIBRARY_ID`.
3. Sélectionnez la dernière version stable et activez le mode développement si nécessaire.

#### 2. Déclaration des scopes requis (`appsscript.json`)
Assurez-vous que votre manifeste contient les autorisations minimales nécessaires :
```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.container.ui"
  ]
}
```

---

### 📖 Exemples d'utilisation

#### Initialisation et utilisation de base
```javascript
function demoMonProjet() {
  const ssId = SpreadsheetApp.getActiveSpreadsheet().getId();
  // Exemple d'appel API — adapter au projet réel
  Logger.log("Projet initialisé avec succès : " + ssId);
}
```

---

### 👤 Auteur

- **[Fabrice Faucheux](https://faucheux.bzh)** (FF Labs) — [GitHub](https://github.com/FabriceFx)

---

### 📄 Licence

Ce projet est sous licence MIT. Pour plus d'informations, veuillez consulter le fichier [LICENSE](LICENSE).

---

## 🇬🇧 English Version

> Short, punchy, and professional description of your project.

<a href="https://developers.google.com/apps-script"><img src="https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google-apps-script&logoColor=white" alt="Google Apps Script"></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-indigo?style=for-the-badge" alt="License: MIT"></a>
<a href="README.md"><img src="https://img.shields.io/badge/Status-Production-brightgreen?style=for-the-badge" alt="Status: Production"></a>

---

### ✨ Key Features

- 📊 **Feature 1**: Description of the first major feature.
- ⚡ **Feature 2**: Description of the second major feature.
- 🛠️ **Feature 3**: Description of the third major feature.
- 🎨 **Integrated Sidebar**: Elegant user interface inspired by Google Workspace design patterns.

---

### 🚀 Installation & Setup

#### 1. Integration in your script
Add the source code directly to your project or link it as a library:
1. In the Apps Script editor, click **Add a library** (`+`).
2. Enter the project library ID: `YOUR_LIBRARY_ID`.
3. Select the latest stable version and enable development mode if needed.

#### 2. Declaring OAuth Scopes (`appsscript.json`)
Ensure your Apps Script manifest contains the required minimum permissions.

---

### 📖 Usage Examples

#### Initialization & basic usage
```javascript
function demoMyProject() {
  const ssId = SpreadsheetApp.getActiveSpreadsheet().getId();
  // Example API call — adapt to the actual project
  Logger.log("Project initialized successfully: " + ssId);
}
```

---

### 👤 Author

- **[Fabrice Faucheux](https://faucheux.bzh)** (FF Labs) — [GitHub](https://github.com/FabriceFx)

---

### 📄 License

This project is licensed under the MIT License.

---
<p align="center"><a href="https://faucheux.bzh" target="_blank" style="color: inherit; text-decoration: none;">&lt;&gt; par Fabrice Faucheux</a></p>
````

---

## 5. ⚡ Checklist d'Harmonisation d'un Projet

Pour déployer cette homogénéité sur n'importe quel projet Google Apps Script, suivre les étapes ci-dessous dans l'ordre.

### Pour tout nouveau projet

- [ ] Créer la structure de fichiers standard (Section 1.A).
- [ ] Ajouter `Config.gs` avec l'objet `CONFIG` complet (`PROJECT_NAME`, `VERSION` en SemVer `X.Y.Z`, `DEBUG_MODE`, `COLORS`).
- [ ] Ajouter la fonction `logEvent` dans `Config.gs`.
- [ ] Ajouter la fonction `include(filename)` dans `Utils.gs`.
- [ ] Implémenter le template `createTemplateFromFile` dans `Code.gs` avec passage de `locale`.
- [ ] Placer l'en-tête JSDoc standardisé en tête de chaque fichier `.gs`.
- [ ] Implémenter la structure de communication client-serveur robuste avec `#loadingOverlay` et gestion asynchrone unifiée (Section 1.G).
- [ ] S'assurer qu'aucun secret ou clé d'API n'est écrit en dur dans le code et utiliser les `ScriptProperties` (Section 1.I).
- [ ] Respecter strictement les conventions de nommage et de casse pour tous les éléments (Section 1.J).
- [ ] Copier `Stylesheet.html` avec les variables CSS complètes (dont `--border-light` et `--footer-height`).
- [ ] N'utiliser aucun framework CSS externe et privilégier des icônes au format SVG inline directement dans le HTML (Section 2.F).
- [ ] Intégrer le footer HTML standard pointant vers `https://github.com/FabriceFx/NOM_DU_DEPOT`.
- [ ] Mettre en place le dictionnaire `TRANSLATIONS` dans `JavaScript.html` avec toutes les clés en `fr` **et** `en`.
- [ ] Créer le fichier `README.md` bilingue sur le modèle de la Section 4 (badge `brightgreen`).

### Pour un projet existant à harmoniser

- [ ] Vérifier et mettre à jour la version vers le format SemVer `X.Y.Z` (dans `Config.gs` **et** l'en-tête JSDoc).
- [ ] Identifier et migrer toutes les écritures ou lectures en boucle vers des opérations par lots (Batching `getValues`/`setValues`) (Section 1.H).
- [ ] Retirer tout secret codé en dur dans `Config.gs` et le migrer vers les Propriétés du script (Section 1.I).
- [ ] Remplacer les frameworks CSS importés ou les polices d'icônes externes par du Vanilla CSS et du SVG inline (Section 2.F).
- [ ] Ajouter les variables CSS manquantes (`--border-light`, `--footer-height`) dans `Stylesheet.html`.
- [ ] Remplacer toutes les occurrences de `#e3e3e3` par `var(--border-light)` dans le CSS.
- [ ] Synchroniser le `padding-bottom` du `.container` et la `height` du `.footer` via `--footer-height`.
- [ ] Vérifier que l'URL GitHub du footer utilise l'identifiant `FabriceFx` (majuscules incluses).
- [ ] Vérifier la conformité Sentence case de tous les labels et textes en français.
- [ ] Mettre à jour ou créer le `README.md` avec le badge de statut `brightgreen`.
- [ ] Documenter les fonctions non documentées avec des blocs JSDoc complets.

---

<p align="center"><a href="https://faucheux.bzh" target="_blank" style="color: inherit; text-decoration: none;">&lt;&gt; par Fabrice Faucheux</a></p>