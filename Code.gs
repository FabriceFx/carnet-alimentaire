/**
 * Crée le menu personnalisé à l'ouverture du classeur.
 */
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Carnet Alimentaire')
        .addItem('Ouvrir la saisie', 'showSidebar')
        .addItem('Mon Profil', 'showProfile')
        .addItem('Générer le Google Doc', 'generateFoodDiaryDoc')
        .addItem('Créer feuille filtrée (saisies)', 'createFilteredSheet')
        .addToUi();
        
    checkInputSheet();
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
 * Affiche la barre latérale HTML.
 */
function showSidebar() {
    const html = HtmlService.createHtmlOutputFromFile('Sidebar')
        .setTitle('Saisie du Carnet Alimentaire');
    SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Affiche la boîte de dialogue du profil utilisateur.
 */
function showProfile() {
    const html = HtmlService.createHtmlOutputFromFile('Profil')
        .setTitle('Profil Utilisateur')
        .setWidth(400)
        .setHeight(500);
    SpreadsheetApp.getUi().showModalDialog(html, 'Profil Utilisateur');
}

/**
 * Récupère les données du profil depuis l'onglet "Profil".
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
        } catch(e) {}
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
 * Enregistre les données du repas dans la feuille de calcul.
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
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        const data = sheet.getDataRange().getValues();

        if (data.length <= 1) {
            SpreadsheetApp.getUi().alert("La feuille de calcul ne contient aucune donnée à exporter.");
            return;
        }

        // Création du document
        doc = DocumentApp.create('Export Carnet Alimentaire - ' + new Date().toLocaleDateString());
        const body = doc.getBody();

        body.appendParagraph('Carnet Alimentaire').setHeading(DocumentApp.ParagraphHeading.TITLE);

        // Ajout des infos du profil si elles existent
        const profileData = getProfileData();
        if (profileData && (profileData.nom || profileData.prenom)) {
            let profileText = `Patient: ${profileData.prenom} ${profileData.nom}`;
            if (profileData.dateNaissance) {
                const dob = new Date(profileData.dateNaissance);
                profileText += `\nNé(e) le: ${dob.toLocaleDateString()}`;
            }
            if (profileData.sexe && profileData.sexe !== 'Non précisé') {
                profileText += `\nSexe: ${profileData.sexe}`;
            }
            if (profileData.poids) {
                profileText += `\nPoids de départ: ${profileData.poids} kg`;
            }
            body.appendParagraph(profileText).setHeading(DocumentApp.ParagraphHeading.SUBTITLE);
        }

        // Extraction des données (en sautant la ligne d'en-tête)
        const rows = data.slice(1);

        // Regroupement par date
        const dataByDate = {};
        rows.forEach(row => {
            const dateStr = row[0] ? new Date(row[0]).toLocaleDateString() : 'Date inconnue';
            if (!dataByDate[dateStr]) dataByDate[dateStr] = [];
            dataByDate[dateStr].push(row);
        });

        // Définition de l'ordre d'affichage des repas
        const ordreCategories = [
            "Petit déjeuner", "Matinée", "Déjeuner",
            "Après-midi", "Dîner", "Soirée",
            "Nuit", "Autres prises alimentaires"
        ];

        // Style des tableaux
        const styleHeader = {};
        styleHeader[DocumentApp.Attribute.BACKGROUND_COLOR] = '#F3F4F6';
        styleHeader[DocumentApp.Attribute.BOLD] = true;

        // Génération du contenu pour chaque date
        for (const date in dataByDate) {
            body.appendParagraph('Journée du ' + date).setHeading(DocumentApp.ParagraphHeading.HEADING1);

            // Création du tableau de la journée
            const cells = [
                ["Période / Lieu", "Menu précis", "Quantités", "Cuisson / Assaisonnement"]
            ];

            // Tri des lignes selon l'ordre logique des repas
            const repasDuJour = dataByDate[date];
            repasDuJour.sort((a, b) => ordreCategories.indexOf(a[1]) - ordreCategories.indexOf(b[1]));

            repasDuJour.forEach(repas => {
                const periodeLieu = String(repas[1] || '') + (repas[2] ? '\n(' + repas[2] + ')' : '');
                cells.push([
                    periodeLieu,
                    String(repas[3] || ''),
                    String(repas[4] || ''),
                    String(repas[5] || '')
                ]);
            });

            const table = body.appendTable(cells);

            // Formatage basique du tableau
            for (let i = 0; i < 4; i++) {
                table.getRow(0).getCell(i).setAttributes(styleHeader);
            }

            body.appendParagraph(''); // Espace entre les journées
        }

        doc.saveAndClose();
        
        const docUrl = doc.getUrl();
        const ui = SpreadsheetApp.getUi();
        ui.alert("Document généré avec succès !", "Vous pouvez y accéder ici : " + docUrl, ui.ButtonSet.OK);
        
    } catch (e) {
        if (doc) {
            try { doc.saveAndClose(); } catch(err) {}
        }
        SpreadsheetApp.getUi().alert("Erreur lors de la génération :\n" + e.message);
    }
}

/**
 * Crée une nouvelle feuille contenant uniquement les saisies valides (non vides/absentes).
 */
function createFilteredSheet() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sourceSheet = spreadsheet.getActiveSheet();
    const data = sourceSheet.getDataRange().getValues();

    if (data.length <= 1) {
        SpreadsheetApp.getUi().alert("La feuille source ne contient aucune donnée.");
        return;
    }

    // On récupère l'en-tête
    const header = data[0];
    
    // On filtre les lignes pour ne garder que celles ayant un menu renseigné
    // (Considérant qu'une saisie "absente" est une ligne sans repas ou notée comme telle)
    const filteredRows = data.slice(1).filter(row => {
        const menu = String(row[3] || '').trim().toLowerCase();
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