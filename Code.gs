/**
 * ============================================================================
 *  CARNET ALIMENTAIRE
 * ============================================================================
 *  Auteur      : Fabrice Faucheux (https://faucheux.bzh)
 *  Projet      : FF Labs - Carnet Alimentaire
 *  Rôle        : Point d'entrée principal et logique métier serveur.
 *  Version     : 1.0.0
 * ============================================================================
 */

/**
 * Initialise le menu personnalisé à l'ouverture du Google Sheet.
 */
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Carnet alimentaire')
        .addItem('Ouvrir la saisie', 'showSidebar')
        .addItem('Mon profil', 'showProfile')
        .addItem('Générer le Google Doc', 'generateFoodDiaryDoc')
        .addItem('Créer feuille filtrée (saisies)', 'createFilteredSheet')
        .addSeparator()
        .addItem('Paramètres (clé API)', 'showSettings')
        .addToUi();

    checkInputSheet();
    cleanEmptySheets();
}

/**
 * Vérifie si une feuille de saisie existe, sinon propose de la créer.
 */
function checkInputSheet() {
    try {
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const sheets = spreadsheet.getSheets();

        let hasInputSheet = false;
        for (let i = 0; i < sheets.length; i++) {
            const sheet = sheets[i];
            // On s'assure que la feuille a au moins 4 colonnes avant de lire
            if (sheet.getMaxColumns() >= 4) {
                const firstRow = sheet.getRange(1, 1, 1, 4).getValues()[0];
                if (String(firstRow[0]).toLowerCase() === "date" &&
                    String(firstRow[3]).toLowerCase() === "menu précis") {
                    hasInputSheet = true;
                    break;
                }
            }
        }

        if (!hasInputSheet) {
            const ui = SpreadsheetApp.getUi();
            const response = ui.alert(
                'Carnet Alimentaire',
                "Il semble qu'aucune feuille de saisie ne soit présente.\nVoulez-vous créer la feuille 'Carnet' avec les bonnes colonnes ?",
                ui.ButtonSet.YES_NO
            );

            if (response == ui.Button.YES) {
                let newSheet = spreadsheet.getSheetByName("Carnet");
                if (!newSheet) {
                    newSheet = spreadsheet.insertSheet("Carnet");
                }
                const headers = ["Date", "Période", "Heure et lieu", "Menu précis", "Quantités", "Cuisson / Assaisonnement"];
                newSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
                newSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
                newSheet.setFrozenRows(1);
            }
        }
    } catch (e) {
        // En cas d'exécution avec un simple trigger sans permission complète
        console.error("Erreur lors de la vérification de la feuille : " + e);
    }
}

/**
 * Récupère la liste des menus précédents pour l'auto-complétion.
 */
function getFrequentMenus() {
    const sheet = getInputSheet();
    if (!sheet) return [];

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];

    // Colonne D (index 4) : "Menu précis"
    const values = sheet.getRange(2, 4, lastRow - 1, 1).getValues().flat();

    // Filtrer les doublons et les valeurs vides
    return [...new Set(values)].filter(String).slice(0, 50); // Top 50 pour plus de choix
}

/**
 * Affiche la barre latérale pour saisir un repas.
 */
function showSidebar() {
    const template = HtmlService.createTemplateFromFile('Sidebar');
    template.locale = Session.getActiveUserLocale();
    const html = template.evaluate().setTitle('Saisie de repas').setWidth(300);
    SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Affiche la boîte de dialogue du profil utilisateur.
 */
function showProfile() {
    const template = HtmlService.createTemplateFromFile('Profil');
    template.locale = Session.getActiveUserLocale();
    const html = template.evaluate()
        .setTitle('Profil utilisateur')
        .setWidth(400)
        .setHeight(500);
    SpreadsheetApp.getUi().showModalDialog(html, 'Profil utilisateur');
}

/**
 * Affiche la boîte de dialogue des paramètres (Clé API).
 */
function showSettings() {
    const template = HtmlService.createTemplateFromFile('Settings');
    template.locale = Session.getActiveUserLocale();
    const html = template.evaluate()
        .setTitle('Paramètres - Intelligence artificielle')
        .setWidth(450)
        .setHeight(350);
    SpreadsheetApp.getUi().showModalDialog(html, 'Paramètres - Intelligence artificielle');
}

/**
 * Récupère la clé API stockée.
 */
function getApiKey() {
    return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '';
}

/**
 * Sauvegarde la clé API.
 */
function saveApiKey(key) {
    try {
        if (!key) {
            PropertiesService.getScriptProperties().deleteProperty('GEMINI_API_KEY');
        } else {
            PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', key);
        }
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * @typedef {Object} ProfileData
 * @property {string} nom - Le nom de l'utilisateur
 * @property {string} prenom - Le prénom de l'utilisateur
 * @property {string} dateNaissance - La date de naissance au format YYYY-MM-DD
 * @property {string} sexe - Le sexe de l'utilisateur (Femme, Homme, Autre)
 * @property {number|string} poids - Le poids de départ en kg
 */

/**
 * Récupère les données du profil depuis l'onglet "Profil".
 * 
 * @return {ProfileData|null} L'objet structuré contenant les données du profil, ou null si la feuille est vide/inexistante.
 */
function getProfileData() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Profil");
    if (!sheet || sheet.getLastRow() < 2) return null;

    const data = sheet.getRange(2, 1, 1, 5).getValues()[0];
    if (!data || data.length === 0) return null;

    let dob = '';
    if (data[2] && data[2] !== '') {
        try {
            const date = new Date(data[2]);
            if (!isNaN(date.getTime())) {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                dob = `${yyyy}-${mm}-${dd}`;
            }
        } catch (e) { }
    }

    return {
        nom: data[0] || '',
        prenom: data[1] || '',
        dateNaissance: dob,
        sexe: data[3] || 'Non précisé',
        poids: data[4] || ''
    };
}

/**
 * Sauvegarde les données du profil dans l'onglet "Profil".
 * 
 * @param {ProfileData} profileData - L'objet contenant les informations du profil à sauvegarder
 * @return {{success: boolean, message: string}} Objet de statut indiquant le succès ou l'échec de l'opération
 */
function saveProfileData(profileData) {
    try {
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = spreadsheet.getSheetByName("Profil");

        if (!sheet) {
            sheet = spreadsheet.insertSheet("Profil");
            const headers = ["Nom", "Prénom", "Date de naissance", "Sexe", "Poids de départ (kg)"];
            sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
            sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
        }

        const rowData = [
            profileData.nom,
            profileData.prenom,
            profileData.dateNaissance,
            profileData.sexe,
            profileData.poids
        ];

        sheet.getRange(2, 1, 1, 5).setValues([rowData]);

        // S'assurer que la feuille Profil reste masquée
        if (!sheet.isSheetHidden()) {
            sheet.hideSheet();
        }

        return { success: true, message: "Profil enregistré avec succès !" };
    } catch (error) {
        return { success: false, message: "Erreur : " + error.toString() };
    }
}

/**
 * @typedef {Object} MealData
 * @property {string} date - La date du repas (YYYY-MM-DD)
 * @property {string} categorie - La période de la journée (Petit déjeuner, Déjeuner, etc.)
 * @property {string} heureLieu - L'heure et le lieu combinés ou juste l'heure
 * @property {string} menu - La description précise du repas
 * @property {string} quantites - Les quantités combinées avec l'unité (ex: "150 g")
 * @property {string} cuisson - Le mode de cuisson et l'assaisonnement combinés
 */

/**
 * Enregistre les données du repas dans la feuille de calcul principale.
 * 
 * @param {MealData} formData - Les données structurées du repas envoyées depuis la Sidebar
 * @return {{success: boolean, message: string}} Objet de statut de l'opération
 */
function saveMealData(formData) {
    try {
        const sheet = getInputSheet();
        if (!sheet) {
            return { success: false, message: "Erreur : Impossible de trouver la feuille de saisie." };
        }

        sheet.appendRow([
            formData.date,
            formData.categorie,
            formData.heureLieu,
            formData.menu,
            formData.quantites,
            formData.cuisson
        ]);
        return { success: true, message: "Le repas a bien été enregistré !" };
    } catch (error) {
        return { success: false, message: "Erreur : " + error.toString() };
    }
}

/**
 * Trouve et retourne la feuille de saisie principale.
 */
function getInputSheet() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Essayer de trouver par nom en priorité
    let sheet = spreadsheet.getSheetByName("Carnet");
    if (sheet) return sheet;

    // Sinon, on cherche une feuille qui a les bons en-têtes
    const sheets = spreadsheet.getSheets();
    for (let i = 0; i < sheets.length; i++) {
        if (sheets[i].getMaxColumns() >= 4) {
            const firstRow = sheets[i].getRange(1, 1, 1, 4).getValues()[0];
            if (String(firstRow[0]).toLowerCase() === "date" &&
                String(firstRow[3]).toLowerCase() === "menu précis") {
                return sheets[i];
            }
        }
    }

    return null;
}

/**
 * Génère un Google Doc structuré à partir des données de la feuille.
 */
function generateFoodDiaryDoc() {
    let doc;
    try {
        const sheet = getInputSheet();

        if (!sheet) {
            SpreadsheetApp.getUi().alert("Erreur : Feuille de carnet introuvable.");
            return;
        }

        const data = sheet.getDataRange().getValues();

        if (data.length <= 1) {
            SpreadsheetApp.getUi().alert("La feuille de calcul ne contient aucune donnée à exporter.");
            return;
        }

        // Création du document
        const tz = Session.getScriptTimeZone();
        const todayStr = Utilities.formatDate(new Date(), tz, "dd/MM/yyyy");
        doc = DocumentApp.create('Export carnet alimentaire - ' + todayStr);
        const body = doc.getBody();

        const titlePara = body.appendParagraph('Carnet alimentaire');
        titlePara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        titlePara.setAttributes({
            [DocumentApp.Attribute.FONT_FAMILY]: 'Arial',
            [DocumentApp.Attribute.FONT_SIZE]: 24,
            [DocumentApp.Attribute.BOLD]: true,
            [DocumentApp.Attribute.FOREGROUND_COLOR]: '#0b57d0'
        });

        // Ajout des infos du profil si elles existent
        const profileData = getProfileData();
        if (profileData && (profileData.nom || profileData.prenom)) {
            let profileText = `Patient: ${profileData.prenom} ${profileData.nom}`;
            if (profileData.dateNaissance) {
                let dobStr = '';
                const dobDate = new Date(profileData.dateNaissance);
                if (!isNaN(dobDate.getTime())) {
                    dobStr = Utilities.formatDate(dobDate, tz, "dd/MM/yyyy");
                } else {
                    dobStr = profileData.dateNaissance;
                }
                if (dobStr) {
                    profileText += `\nNé(e) le: ${dobStr}`;
                }
            }
            if (profileData.sexe && profileData.sexe !== 'Non précisé') {
                profileText += `\nSexe: ${profileData.sexe}`;
            }
            if (profileData.poids) {
                profileText += `\nPoids de départ: ${profileData.poids} kg`;
            }
            const subtitlePara = body.appendParagraph(profileText);
            subtitlePara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
            subtitlePara.setAttributes({
                [DocumentApp.Attribute.FONT_FAMILY]: 'Arial',
                [DocumentApp.Attribute.FONT_SIZE]: 11,
                [DocumentApp.Attribute.ITALIC]: true,
                [DocumentApp.Attribute.FOREGROUND_COLOR]: '#5f6368'
            });
            subtitlePara.setSpacingAfter(20);
        }

        // Extraction de l'en-tête et définition dynamique des index de colonnes
        const headerRow = data[0].map(h => String(h).toLowerCase().trim());
        const colDate = headerRow.findIndex(h => h === "date");
        const colPeriode = headerRow.findIndex(h => h.includes("période") || h.includes("categorie"));
        const colHeure = headerRow.findIndex(h => h.includes("heure") || h.includes("lieu"));
        const colMenu = headerRow.findIndex(h => h.includes("menu"));
        const colQte = headerRow.findIndex(h => h.includes("quantité") || h.includes("quantite"));
        const colCuisson = headerRow.findIndex(h => h.includes("cuisson") || h.includes("assaisonnement"));

        const iDate = colDate >= 0 ? colDate : 0;
        const iPeriode = colPeriode >= 0 ? colPeriode : 1;
        const iHeure = colHeure >= 0 ? colHeure : 2;
        const iMenu = colMenu >= 0 ? colMenu : 3;
        const iQte = colQte >= 0 ? colQte : 4;
        const iCuisson = colCuisson >= 0 ? colCuisson : 5;

        // Extraction des données (en sautant la ligne d'en-tête)
        const rows = data.slice(1);

        // Regroupement par date
        const dataByDate = {};
        rows.forEach(row => {
            let dateStr = 'Date inconnue';
            const cellDate = row[iDate];
            if (cellDate) {
                const dateObj = (cellDate instanceof Date) ? cellDate : new Date(cellDate);
                if (!isNaN(dateObj.getTime())) {
                    dateStr = Utilities.formatDate(dateObj, tz, "dd/MM/yyyy");
                } else {
                    dateStr = String(cellDate);
                }
            }
            if (!dataByDate[dateStr]) dataByDate[dateStr] = [];
            dataByDate[dateStr].push(row);
        });

        // Définition de l'ordre d'affichage des repas
        const ordreCategories = [
            "Petit déjeuner", "Matinée", "Déjeuner",
            "Après-midi", "Dîner", "Soirée",
            "Nuit", "Autres prises alimentaires"
        ];

        // Styles des tableaux
        const styleCell = {};
        styleCell[DocumentApp.Attribute.FONT_FAMILY] = 'Arial';
        styleCell[DocumentApp.Attribute.FONT_SIZE] = 10;
        styleCell[DocumentApp.Attribute.PADDING_TOP] = 6;
        styleCell[DocumentApp.Attribute.PADDING_BOTTOM] = 6;
        styleCell[DocumentApp.Attribute.PADDING_LEFT] = 8;
        styleCell[DocumentApp.Attribute.PADDING_RIGHT] = 8;

        const styleHeader = Object.assign({}, styleCell);
        styleHeader[DocumentApp.Attribute.FONT_FAMILY] = 'Arial';
        styleHeader[DocumentApp.Attribute.BACKGROUND_COLOR] = '#F3F4F6';
        styleHeader[DocumentApp.Attribute.BOLD] = true;
        styleHeader[DocumentApp.Attribute.FONT_SIZE] = 11;

        // Génération du contenu pour chaque date
        for (const date in dataByDate) {
            body.appendParagraph('Journée du ' + date).setHeading(DocumentApp.ParagraphHeading.HEADING1);

            // Création du tableau de la journée
            const cells = [
                ["Période / Lieu", "Menu précis", "Quantités", "Cuisson / Assaisonnement"]
            ];

            // Tri des lignes selon l'ordre logique des repas
            const repasDuJour = dataByDate[date];
            repasDuJour.sort((a, b) => ordreCategories.indexOf(a[iPeriode]) - ordreCategories.indexOf(b[iPeriode]));

            repasDuJour.forEach(repas => {
                const pValue = String(repas[iPeriode] || '');
                const hValue = String(repas[iHeure] || '');
                const periodeLieu = pValue + (hValue ? '\n(' + hValue + ')' : '');
                cells.push([
                    periodeLieu,
                    String(repas[iMenu] || ''),
                    String(repas[iQte] || ''),
                    String(repas[iCuisson] || '')
                ]);
            });

            const table = body.appendTable(cells);
            table.setBorderWidth(1);
            table.setBorderColor('#D3D3D3');

            // Largeurs spécifiques des colonnes (total ~500pt)
            table.setColumnWidth(0, 110);
            table.setColumnWidth(1, 180);
            table.setColumnWidth(2, 90);
            table.setColumnWidth(3, 120);

            // Formatage avancé du tableau
            const numRows = table.getNumRows();
            for (let r = 0; r < numRows; r++) {
                const row = table.getRow(r);
                for (let c = 0; c < 4; c++) {
                    const cell = row.getCell(c);
                    cell.setAttributes(r === 0 ? styleHeader : styleCell);
                }
            }

            // 1. Préparation des données pour l'analyse avec index dynamiques
            const repasPourAnalyse = repasDuJour.map(repas => ({
                periode: repas[iPeriode],
                heure: repas[iHeure],
                menu: repas[iMenu],
                quantite: repas[iQte],
                cuisson: repas[iCuisson]
            }));

            // Appel de l'analyse sémantique
            const analyseDietetique = analyzeDayNutrition(repasPourAnalyse, profileData);

            // 2. Création du bloc de texte stylisé
            const pAnalyse = body.appendParagraph('');
            pAnalyse.setSpacingBefore(8).setSpacingAfter(16);

            // Style de l'encadré de conseils
            const styleConseil = {};
            styleConseil[DocumentApp.Attribute.BACKGROUND_COLOR] = '#EFF6FF';
            styleConseil[DocumentApp.Attribute.FONT_FAMILY] = 'Arial';
            styleConseil[DocumentApp.Attribute.FONT_SIZE] = 9.5;
            styleConseil[DocumentApp.Attribute.FOREGROUND_COLOR] = '#1E40AF';

            // Ajout d'un titre interne à l'encadré
            const textObj = pAnalyse.appendText("💡 Analyse & Conseils Diététiques :\n" + analyseDietetique);
            textObj.setAttributes(styleConseil);

            body.appendParagraph(''); // Espace entre les journées
        }

        doc.saveAndClose();

        const docUrl = doc.getUrl();
        const ui = SpreadsheetApp.getUi();
        const htmlOutput = HtmlService.createHtmlOutput(`
            <div style="font-family: 'Inter', sans-serif; text-align: center; padding: 15px;">
                <p style="font-size: 14px; margin-bottom: 20px;">Votre carnet alimentaire a été généré sous forme de document Google Docs avec succès.</p>
                <a href="${docUrl}" target="_blank" style="background-color: #0b57d0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-size: 14px; font-weight: 500; display: inline-block;">Ouvrir le document</a>
            </div>
        `).setWidth(400).setHeight(150);
        ui.showModalDialog(htmlOutput, 'Document généré avec succès !');

    } catch (e) {
        if (doc) {
            try { doc.saveAndClose(); } catch (err) { }
        }
        SpreadsheetApp.getUi().alert("Erreur lors de la génération :\n" + e.message);
    }
}

/**
 * Crée une nouvelle feuille contenant uniquement les saisies valides (non vides/absentes).
 */
function createFilteredSheet() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sourceSheet = getInputSheet();

    if (!sourceSheet) {
        SpreadsheetApp.getUi().alert("Erreur : Feuille de carnet introuvable.");
        return;
    }

    const data = sourceSheet.getDataRange().getValues();

    if (data.length <= 1) {
        SpreadsheetApp.getUi().alert("La feuille source ne contient aucune donnée.");
        return;
    }

    // On récupère l'en-tête et l'index dynamique de la colonne "Menu"
    const header = data[0];
    const headerRow = header.map(h => String(h).toLowerCase().trim());
    const colMenu = headerRow.findIndex(h => h.includes("menu"));
    const iMenu = colMenu >= 0 ? colMenu : 3;

    // On filtre les lignes pour ne garder que celles ayant un menu renseigné
    // (Considérant qu'une saisie "absente" est une ligne sans repas ou notée comme telle)
    const filteredRows = data.slice(1).filter(row => {
        const menu = String(row[iMenu] || '').trim().toLowerCase();
        return menu !== '' && menu !== 'absent' && menu !== 'absente' && menu !== 'néant' && menu !== 'rien';
    });

    if (filteredRows.length === 0) {
        SpreadsheetApp.getUi().alert("Aucune saisie valide n'a été trouvée.");
        return;
    }

    const newSheetName = 'Saisies filtrées - ' + new Date().toLocaleDateString();
    let newSheet = spreadsheet.getSheetByName(newSheetName);

    if (newSheet) {
        newSheet.clear();
    } else {
        newSheet = spreadsheet.insertSheet(newSheetName);
    }

    // On réinsère l'en-tête et les lignes filtrées
    const outputData = [header].concat(filteredRows);
    newSheet.getRange(1, 1, outputData.length, outputData[0].length).setValues(outputData);

    SpreadsheetApp.getUi().alert("Feuille créée avec succès !");
}

/**
 * Supprime les feuilles entièrement vides (sans données) pour nettoyer le classeur.
 * Ne supprime pas la feuille si c'est la seule restante, ni les feuilles système (Profil, Carnet).
 */
function cleanEmptySheets() {
    try {
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const sheets = spreadsheet.getSheets();

        let sheetCount = sheets.length;

        for (let i = sheets.length - 1; i >= 0; i--) {
            if (sheetCount <= 1) break; // Ne jamais supprimer la dernière feuille

            const sheet = sheets[i];
            const name = sheet.getName();

            // On protège les feuilles principales même si elles sont temporairement vides
            if (name === "Profil" || name === "Carnet") continue;

            // Si la feuille est totalement vide
            if (sheet.getLastRow() === 0) {
                spreadsheet.deleteSheet(sheet);
                sheetCount--;
            }
        }
    } catch (e) {
        // Ignorer les erreurs mineures de nettoyage
    }
}

/**
 * Appelle l'API Gemini pour générer une analyse diététique basée sur les repas de la journée.
 * @param {Array} repasObj Lignes de données structurées de la journée
 * @param {Object} profileData Métadonnées de l'utilisateur (optionnel)
 * @return {String} L'analyse textuelle formatée
 */
function analyzeDayNutrition(repasObj, profileData) {
    const apiKey = getApiKey();
    if (!apiKey) return "Avis diététique indisponible (Clé API manquante dans les propriétés du script).";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    // Formatage textuel des repas pour le prompt (en utilisant l'objet structuré pour garantir la correspondance des colonnes)
    let journalTexte = repasObj.map(r => {
        return `- ${r.periode} (${r.heure || 'Heure non précisée'}): ${r.menu} | Qté: ${r.quantite || 'N/A'} | Cuisson/Assais: ${r.cuisson || 'N/A'}`;
    }).join('\n');

    let contexteProfil = profileData ? `Le profil de la personne est : Sexe ${profileData.sexe}, Poids de départ ${profileData.poids} kg.` : '';

    const prompt = `En tant qu'expert en diététique et nutrition, analyse le journal alimentaire suivant pour une seule journée. 
${contexteProfil}
  
Fournis une analyse constructive, concise (maximum 150 mots) et structurée selon ces trois axes cardinaux :
1. Points forts (ex: bonne hydratation, présence de légumes, rythme respecté).
2. Vigilances (ex: manque de protéines le midi, dîner trop lourd ou tardif, produits industriels).
3. Conseil concret (une action simple et mesurable pour le lendemain).
  
Sois factuel, professionnel et encourageant. Ne compte pas les calories, reste sur l'équilibre qualitatif.
  
Voici le journal de la journée :
${journalTexte}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.2 }
    };

    const options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
    };

    try {
        const response = UrlFetchApp.fetch(url, options);
        const json = JSON.parse(response.getContentText());
        if (json.candidates && json.candidates.length > 0) {
            const candidate = json.candidates[0];
            let text = "";
            if (candidate.content && candidate.content.parts) {
                text = candidate.content.parts.map(p => p.text || "").join("");
            }
            if (candidate.finishReason && candidate.finishReason !== "STOP") {
                text += `\n[Info technique: Génération interrompue. Raison = ${candidate.finishReason}]`;
            }
            if (text) return text.trim();
        }
        if (json.error) {
            return "Erreur de l'API : " + json.error.message;
        }
        return "Impossible de générer l'analyse. Réponse de l'API : " + response.getContentText();
    } catch (e) {
        return "Erreur lors de l'analyse nutritionnelle : " + e.toString();
    }
}