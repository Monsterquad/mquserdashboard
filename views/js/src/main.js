/**
 * Fichier principal du module mquserdashboard
 * Path: modules/mquserdashboard/views/js/main.js
 */

// Configuration globale du module
const MQUserDashboard = {
    config: {
        debug: false,
        autoRefresh: false,
        refreshInterval: 300000, // 5 minutes
        animations: true
    },

    // État global
    state: {
        isInitialized: false,
        currentUser: null,
        modules: {}
    },

    // Utilitaires globaux
    utils: {
        /**
         * Logger avec niveau de debug
         */
        log: function(message, level = 'info') {
            if (MQUserDashboard.config.debug) {
                console[level](`[MQUserDashboard] ${message}`);
            }
        },

        /**
         * Vérification de la compatibilité du navigateur
         */
        checkBrowserCompatibility: function() {
            const requiredFeatures = [
                'fetch',
                'Promise',
                'localStorage',
                'addEventListener'
            ];

            return requiredFeatures.every(feature =>
                typeof window[feature] !== 'undefined'
            );
        },

        /**
         * Gestion des erreurs globales
         */
        handleGlobalError: function(error, context) {
            console.error(`[MQUserDashboard] Erreur globale dans ${context}:`, error);

            // Envoi d'erreur au serveur si nécessaire
            if (MQUserDashboard.config.debug) {
                this.sendErrorToServer(error, context);
            }
        },

        /**
         * Envoi d'erreur au serveur (optionnel)
         */
        sendErrorToServer: function(error, context) {
            // Implémentation optionnelle pour le logging serveur
            // fetch('/module/mquserdashboard/logError', {
            //     method: 'POST',
            //     body: JSON.stringify({
            //         error: error.message,
            //         context: context,
            //         url: window.location.href,
            //         userAgent: navigator.userAgent
            //     })
            // }).catch(() => {});
        }
    },

    /**
     * Initialisation du module
     */
    init: function() {
        // Vérification de la compatibilité
        if (!this.utils.checkBrowserCompatibility()) {
            console.error('[MQUserDashboard] Navigateur non compatible');
            this.showBrowserCompatibilityWarning();
            return;
        }

        // Vérification que nous sommes sur la bonne page
        if (!this.isValidPage()) {
            this.utils.log('Page non valide pour le dashboard');
            return;
        }

        try {
            this.initializeDashboard();
            this.setupGlobalEvents();
            this.state.isInitialized = true;
            this.utils.log('Module initialisé avec succès');
        } catch (error) {
            this.utils.handleGlobalError(error, 'initialization');
        }
    },

    /**
     * Vérification que nous sommes sur une page valide
     */
    isValidPage: function() {
        // Vérifier la présence des éléments nécessaires
        const requiredElements = [
            '.main-dashboard',
            '.left-link',
            '.dashboard-section'
        ];

        return requiredElements.every(selector =>
            document.querySelector(selector) !== null
        );
    },

    /**
     * Initialisation du dashboard principal
     */
    initializeDashboard: function() {
        // Le DashboardManager s'initialise automatiquement
        // Mais on peut ajouter des configurations supplémentaires ici

        // Configuration du refresh automatique
        if (this.config.autoRefresh) {
            this.setupAutoRefresh();
        }

        // Configuration des animations
        if (this.config.animations) {
            this.setupAnimations();
        }

        this.utils.log('Dashboard initialisé');
    },

    /**
     * Configuration des événements globaux
     */
    setupGlobalEvents: function() {
        // Gestion des erreurs JavaScript globales
        window.addEventListener('error', (event) => {
            this.utils.handleGlobalError(event.error, 'window.error');
        });

        // Gestion des promesses rejetées
        window.addEventListener('unhandledrejection', (event) => {
            this.utils.handleGlobalError(event.reason, 'unhandledrejection');
        });

        // Gestion de la visibilité de la page
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });

        // Gestion du redimensionnement
        window.addEventListener('resize', this.debounce(() => {
            this.onWindowResize();
        }, 250));

        this.utils.log('Événements globaux configurés');
    },

    /**
     * Configuration du refresh automatique
     */
    setupAutoRefresh: function() {
        setInterval(() => {
            if (window.dashboardManager && !document.hidden) {
                window.dashboardManager.refreshSection(
                    window.dashboardManager.getCurrentSection()
                );
            }
        }, this.config.refreshInterval);

        this.utils.log('Auto-refresh configuré');
    },

    /**
     * Configuration des animations
     */
    setupAnimations: function() {
        // Ajouter des classes CSS pour les animations
        document.body.classList.add('dashboard-animations-enabled');

        // Observer les changements de section pour les animations
        const sections = document.querySelectorAll('.dashboard-section');
        sections.forEach(section => {
            section.addEventListener('transitionend', (e) => {
                if (e.target === section) {
                    section.classList.add('section-loaded');
                }
            });
        });

        this.utils.log('Animations configurées');
    },

    /**
     * Événements de cycle de vie de la page
     */
    onPageHidden: function() {
        this.utils.log('Page cachée');
        // Pause des timers, sauvegarde d'état, etc.
    },

    onPageVisible: function() {
        this.utils.log('Page visible');
        // Reprise des timers, refresh des données, etc.
        if (window.dashboardManager) {
            window.dashboardManager.refreshSection(
                window.dashboardManager.getCurrentSection()
            );
        }
    },

    onWindowResize: function() {
        this.utils.log('Redimensionnement de la fenêtre');
        // Réajustement des layouts responsives
    },

    /**
     * Affichage d'un avertissement de compatibilité
     */
    showBrowserCompatibilityWarning: function() {
        const warning = document.createElement('div');
        warning.className = 'browser-compatibility-warning';
        warning.innerHTML = `
            <div class="alert alert-warning">
                <strong>Navigateur non compatible</strong><br>
                Votre navigateur ne supporte pas toutes les fonctionnalités nécessaires.
                Veuillez utiliser un navigateur plus récent.
            </div>
        `;

        const container = document.querySelector('.main-dashboard') || document.body;
        container.insertBefore(warning, container.firstChild);
    },

    /**
     * Utilitaire debounce
     */
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * API publique pour d'autres modules
     */
    api: {
        /**
         * Obtenir l'instance du dashboard manager
         */
        getDashboardManager: function() {
            return window.dashboardManager;
        },

        /**
         * Rafraîchir une section
         */
        refreshSection: function(sectionName) {
            if (window.dashboardManager) {
                return window.dashboardManager.refreshSection(sectionName);
            }
        },

        /**
         * Obtenir l'état actuel
         */
        getState: function() {
            return MQUserDashboard.state;
        },

        /**
         * Définir la configuration
         */
        setConfig: function(config) {
            Object.assign(MQUserDashboard.config, config);
        }
    }
};

// Auto-initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function() {
    MQUserDashboard.init();
});

// Exposition de l'API globale
window.MQUserDashboard = MQUserDashboard;