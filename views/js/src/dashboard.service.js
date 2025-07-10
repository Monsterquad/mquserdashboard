/**
 * Service pour la gestion des données du dashboard
 * Path: modules/mquserdashboard/views/js/dashboard.service.js
 */

class DashboardService {
    constructor() {
        this.profil = new Profil();
    }

    /**
     * Charge les données initiales du dashboard
     */
    async loadInitialData() {
        try {
            const response = await Fetcher.fetchData('getDashboardData');
            if (response.success) {
                this.cache = response.data;
                return response.data;
            }
            throw new Error('Données non valides');
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            throw error;
        }
    }

    /**
     * Récupère les informations du client
     */
    async getCustomerInfo() {
        return this.profil.customerInfo()
    }

    /**
     * Charge les commandes avec pagination
     */
    async getOrders(page = 1, limit = 10) {
        try {
            const data = await Fetcher.fetchData('getOrders', {
                page: page,
                limit: limit
            });

            if (data.success) {
                return {
                    orders: data.data.orders,
                    pagination: data.data.pagination
                };
            }
            throw new Error('Impossible de récupérer les commandes');
        } catch (error) {
            console.error('Erreur lors du chargement des commandes:', error);
            throw error;
        }
    }
}