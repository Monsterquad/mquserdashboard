/**
 * Gestionnaire principal du dashboard
 * Path: modules/mquserdashboard/views/js/dashboard.manager.js
 */

class DashboardManager {
    constructor() {
        this.baseUrl = prestashop.urls.base_url;
        this.currentSection = 'profile';
        this.currentOrderPage = 1;
        this.ordersPerPage = 10;

        // Initialisation des services
        this.service = new DashboardService();
        this.renderer = new DashboardRenderer();

        this.customerData = null;

        this.init();
    }

    /**
     * Initialisation du dashboard
     */
    init() {
        this.bindNavigation();
        this.loadInitialData();
    }

    /**
     * Gestion de la navigation
     */
    bindNavigation() {
        const menuItems = document.querySelectorAll('.left-link li');
        const sections = document.querySelectorAll('.dashboard-section');

        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Mise à jour visuelle
                menuItems.forEach(mi => mi.classList.remove('active'));
                item.classList.add('active');

                // Changement de section
                const sectionName = item.getAttribute('data-section');
                this.currentSection = sectionName;

                sections.forEach(section => section.style.display = 'none');
                const targetSection = document.getElementById(sectionName + '-section');
                if (targetSection) {
                    targetSection.style.display = 'block';
                    this.loadSectionData(sectionName);
                }
            });
        });
    }

    /**
     * Charge les données initiales
     */
    async loadInitialData() {
        try {
            const data = await this.service.loadInitialData();
            
            // Rendu des données initiales
            this.renderer.renderProfile(data.customer);
            //this.renderer.renderOrders(data.orders);
            
            // Affichage de la section active
            await this.loadSectionData(this.currentSection);
            
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            this.renderer.showError('Impossible de charger les données du dashboard');
        }
    }

    /**
     * Charge les données d'une section spécifique
     */
    async loadSectionData(section) {
        try {
            switch (section) {
                case 'profile':
                    await this.loadProfileData();
                    break;

                case 'orders':
                    await this.loadOrdersData();
                    break;

                case 'stats':
                    await this.loadStatsData();
                    break;

                default:
                    console.warn(`Section "${section}" non implémentée`);
            }
        } catch (error) {
            console.error(`Erreur lors du chargement de la section ${section}:`, error);
            this.renderer.showError(`Impossible de charger les données de la section ${section}`);
        }
    }

    /**
     * Charge les données du profil
     */
    async loadProfileData() {
        try {
            this.customerData = await this.service.getCustomerInfo();
            this.renderer.renderProfile(this.customerData);
        } catch (error) {
            console.error('Erreur lors du chargement du profil:', error);
            this.renderer.showError('Impossible de charger les informations du profil');
        }
    }

    /**
     * Charge les données des commandes
     */
    async loadOrdersData(page = 1) {
        try {
            this.currentOrderPage = page;
            const ordersData = await this.service.getOrders(page, this.ordersPerPage);
            this.renderer.renderOrders(ordersData.orders, ordersData.pagination, this.ordersPerPage);
        } catch (error) {
            console.error('Erreur lors du chargement des commandes:', error);
            this.renderer.showError('Impossible de charger les commandes');
        }
    }

    /**
     * Charge les données des statistiques
     */
    async loadStatsData() {
        try {
            const statsData = await this.service.getStats();
            this.renderer.renderStats(statsData);
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            this.renderer.showError('Impossible de charger les statistiques');
        }
    }

    /**
     * Navigation vers une page de commandes
     */
    goToOrderPage(page) {
        if (page < 1) return;
        
        this.loadOrdersData(page);
        
        // Scroll vers le haut de la section
        const ordersSection = document.getElementById('orders-section');
        if (ordersSection) {
            ordersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Change le nombre de commandes par page
     */
    changeOrdersPerPage(value) {
        this.ordersPerPage = parseInt(value);
        this.currentOrderPage = 1;
        this.loadOrdersData(1);
    }

    /**
     * Rafraîchit une section spécifique
     */
    async refreshSection(sectionName) {
        // Vider le cache pour cette section
        this.service.clearCache();
        
        // Recharger les données
        await this.loadSectionData(sectionName);
        
        this.renderer.showSuccess('Section rafraîchie avec succès');
    }

    /**
     * Rafraîchit tout le dashboard
     */
    async refreshDashboard() {
        this.service.clearCache();
        await this.loadInitialData();
        this.renderer.showSuccess('Dashboard rafraîchi avec succès');
    }

    /*
     * Fonction pour éffacer le contenue et le remplacer
     */

    /**
     * Éditer le profil
     */
    editProfile() {
        window.location.href = this.baseUrl + 'identity';
    }

    /**
     * editer les adresses
     */
    editAddress(){
        this.renderer.renderModifAddress(this.customerData.addresses)
    }
    /**
     * Voir les détails d'une commande
     */
    viewOrderDetails(orderId) {
        window.location.href = this.baseUrl + 'index.php?controller=order-detail&id_order=' + orderId;
    }

    /**
     * Télécharger une facture
     */
    downloadInvoice(orderId) {
        window.location.href = this.baseUrl + 'index.php?controller=pdf-invoice&id_order=' + orderId;
    }

    /**
     * Gestion des erreurs globales
     */
    handleError(error, context = '') {
        console.error(`Erreur dans ${context}:`, error);
        
        let errorMessage = 'Une erreur est survenue';
        
        if (error.message) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        
        this.renderer.showError(errorMessage);
    }

    /**
     * Obtient la section active
     */
    getCurrentSection() {
        return this.currentSection;
    }

    /**
     * Change la section active
     */
    setCurrentSection(sectionName) {
        this.currentSection = sectionName;
    }

    /**
     * Obtient les paramètres de pagination des commandes
     */
    getOrdersPagination() {
        return {
            currentPage: this.currentOrderPage,
            ordersPerPage: this.ordersPerPage
        };
    }

    /**
     * Méthodes utilitaires pour les actions externes
     */
    
    /**
     * Recharge les commandes (utile après une action externe)
     */
    async reloadOrders() {
        if (this.currentSection === 'orders') {
            await this.loadOrdersData(this.currentOrderPage);
        }
    }

    /**
     * Recharge le profil (utile après une modification)
     */
    async reloadProfile() {
        if (this.currentSection === 'profile') {
            await this.loadProfileData();
        }
    }
}

// Initialisation au chargement de la page
let dashboardManager;

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier que les dépendances sont chargées
    if (typeof DashboardService === 'undefined') {
        console.error('DashboardService n\'est pas chargé');
        return;
    }
    
    if (typeof DashboardRenderer === 'undefined') {
        console.error('DashboardRenderer n\'est pas chargé');
        return;
    }
    
    // Initialiser le gestionnaire principal
    dashboardManager = new DashboardManager();
});