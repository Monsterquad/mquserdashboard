import DashboardManager from "./dashboard.manager.js";

const MQUserDashboard = {
    dashboardManager: null,

    init() {
        // Vérifier que DashboardManager est chargé
        if (typeof DashboardManager === 'undefined') {
            console.error('DashboardManager n\'est pas chargé');
            return;
        }

        // Créer une instance du gestionnaire
        this.dashboardManager = new DashboardManager();

        // Exposer globalement pour compatibilité
        window.dashboardManager = this.dashboardManager;

        return this.dashboardManager;
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', function() {
    MQUserDashboard.init();
});

window.MQUserDashboard = MQUserDashboard;