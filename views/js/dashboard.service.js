/**
 * Service pour la gestion des données du dashboard
 * Path: modules/mquserdashboard/views/js/dashboard.service.js
 */

class DashboardService {
    constructor() {
        this.baseUrl = prestashop.urls.base_url;
        this.ajaxUrl = this.baseUrl + 'module/mquserdashboard/ajax';
        this.cache = {};
    }

    /**
     * Effectue une requête AJAX
     */
    async fetchData(action, params = {}) {
        const formData = new FormData();
        formData.append('action', action);
        formData.append('ajax', '1');

        Object.keys(params).forEach(key => {
            formData.append(key, params[key]);
        });

        try {
            const response = await fetch(this.ajaxUrl, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur AJAX:', error);
            throw error;
        }
    }

    /**
     * Charge les données initiales du dashboard
     */
    async loadInitialData() {
        try {
            const response = await this.fetchData('getDashboardData');
            console.log(response)
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
        try {
            if (this.cache.customer) {
                return this.cache.customer;
            }

            const data = await this.fetchData('getCustomerInfo');
            if (data.success) {
                this.cache.customer = data.data;
                return data.data;
            }
            throw new Error('Impossible de récupérer les informations client');
        } catch (error) {
            console.error('Erreur lors du chargement des informations client:', error);
            throw error;
        }
    }

    /**
     * Charge les commandes avec pagination
     */
    async getOrders(page = 1, limit = 10) {
        try {
            const data = await this.fetchData('getOrders', {
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

    /**
     * Récupère les statistiques
     */
    async getStats() {
        try {
            if (this.cache.stats) {
                return this.cache.stats;
            }

            const data = await this.fetchData('getStats');
            if (data.success) {
                this.cache.stats = data.data;
                return data.data;
            }
            throw new Error('Impossible de récupérer les statistiques');
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            throw error;
        }
    }

    /**
     * Met à jour le cache pour une section donnée
     */
    updateCache(section, data) {
        this.cache[section] = data;
    }

    /**
     * Vide le cache
     */
    clearCache() {
        this.cache = {};
    }

    /**
     * Récupère une donnée du cache
     */
    getCacheData(key) {
        return this.cache[key] || null;
    }
}