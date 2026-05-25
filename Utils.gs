/**
 * ============================================================================
 *  CARNET ALIMENTAIRE
 * ============================================================================
 *  Auteur      : Fabrice Faucheux (https://faucheux.bzh)
 *  Projet      : FF Labs - Carnet Alimentaire
 *  Rôle        : Fonctions utilitaires serveur (helpers).
 *  Version     : 1.0.0
 * ============================================================================
 */

/**
 * Inclut le contenu d'un fichier HTML (CSS ou JS) directement dans un template.
 * Utile pour modulariser les fichiers Stylesheet.html et JavaScript.html.
 *
 * @param {string} filename - Le nom du fichier à inclure (sans extension .html).
 * @return {string} Le contenu textuel brut du fichier.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
