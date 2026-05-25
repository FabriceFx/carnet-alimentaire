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
        const tz = Session.getScriptTimeZone();
        const todayStr = Utilities.formatDate(new Date(), tz, "dd/MM/yyyy");
        doc = DocumentApp.create('Export Carnet Alimentaire - ' + todayStr);
        const body = doc.getBody();

        body.appendParagraph('Carnet Alimentaire').setHeading(DocumentApp.ParagraphHeading.TITLE);

        // Ajout des infos du profil si elles existent
        const profileData = getProfileData();
        if (profileData && (profileData.nom || profileData.prenom)) {
            let profileText = `Patient: ${profileData.prenom} ${profileData.nom}`;
            if (profileData.dateNaissance) {
                let dobStr = '';
                if (profileData.dateNaissance instanceof Date) {
                    dobStr = Utilities.formatDate(profileData.dateNaissance, tz, "dd/MM/yyyy");
                } else {
                    const dobDate = new Date(profileData.dateNaissance);
                    if (!isNaN(dobDate.getTime())) {
                        dobStr = Utilities.formatDate(dobDate, tz, "dd/MM/yyyy");
                    } else {
                        dobStr = profileData.dateNaissance;
                    }
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
            body.appendParagraph(profileText).setHeading(DocumentApp.ParagraphHeading.SUBTITLE);
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