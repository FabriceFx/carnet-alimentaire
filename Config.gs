/**
 * ============================================================================
 *  CARNET ALIMENTAIRE
 * ============================================================================
 *  Auteur      : Fabrice Faucheux (https://faucheux.bzh)
 *  Projet      : FF Labs - Carnet Alimentaire
 *  Rôle        : Configuration globale et système de journalisation (logs).
 *  Version     : 1.0.0
 * ============================================================================
 */

/**
 * Objet de configuration central du projet.
 */
const CONFIG = {
  PROJECT_NAME: "Carnet Alimentaire",
  VERSION: "1.0.0",
  DEBUG_MODE: true,
  COLORS: {
    PRIMARY: "#0b57d0",
    SECONDARY: "#444746"
  }
};

/**
 * Système de journalisation unifié pour tous les projets FF Labs.
 * En mode DEBUG_MODE actif, les logs INFO sont également affichés.
 *
 * @param {string} message - Message de log.
 * @param {string} [level="INFO"] - Niveau de sévérité : INFO, WARN ou ERROR.
 */
function logEvent(message, level = "INFO") {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${CONFIG.PROJECT_NAME} v${CONFIG.VERSION}] [${level}] ${message}`;

  if (CONFIG.DEBUG_MODE || level === "ERROR") {
    console.log(logMessage);
  }

  if (level === "ERROR") {
    // Logique additionnelle d'erreur (ex: alerte email) possible ici
  }
}
