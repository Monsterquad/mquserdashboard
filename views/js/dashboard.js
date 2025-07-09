/**
 * Gestion du dashboard avec AJAX
 * Path: modules/mquserdashboard/views/js/dashboard.js
 */

class DashboardManager {
    constructor() {
        this.baseUrl = prestashop.urls.base_url;
        this.ajaxUrl = this.baseUrl + 'module/mquserdashboard/ajax';
        this.currentSection = 'profile';
        this.cache = {};

        this.init();
    }

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
            const response = await this.fetchData('getDashboardData');
            if (response.success) {
                this.cache = response.data;
                this.renderProfile(response.data.customer);
                this.renderOrders(response.data.orders);
                this.renderStats(response.data.stats);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            this.showError('Impossible de charger les données');
        }
    }

    /**
     * Charge les données d'une section spécifique
     */
    async loadSectionData(section) {
        switch (section) {
            case 'profile':
                if (!this.cache.customer) {
                    const data = await this.fetchData('getCustomerInfo');
                    if (data.success) {
                        this.cache.customer = data.data;
                        this.renderProfile(data.data);
                    }
                } else {
                    this.renderProfile(this.cache.customer);
                }
                break;

            case 'orders':
                // Toujours recharger les commandes pour avoir la pagination complète
                this.currentOrderPage = 1;
                await this.loadOrders();
                break;

            // Autres sections à implémenter...
        }
    }

    /**
     * Charge les commandes avec pagination
     */
    async loadOrders(page = 1) {
        try {
            const data = await this.fetchData('getOrders', {
                page: page,
                limit: this.ordersPerPage
            });

            if (data.success) {
                this.currentOrderPage = page;
                this.renderOrders(data.data.orders, data.data.pagination);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des commandes:', error);
            this.showError('Impossible de charger les commandes');
        }
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
     * Affiche les informations du profil
     */
    renderProfile(customer) {
        const profileSection = document.getElementById('profile-section');
        if (!profileSection || !customer) return;

        const html = `
            <h2 class="dashboard-title">Mon profil</h2>
            
            <div class="profile-grid">
                <!-- Informations personnelles -->
                <div class="profile-card">
                    <h3 class="profile-card-title">Informations personnelles</h3>
                    <div class="profile-info">
                        <div class="info-row">
                            <span class="info-label">Civilité :</span>
                            <span class="info-value">${customer.gender || 'Non défini'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Nom :</span>
                            <span class="info-value">${customer.lastname}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Prénom :</span>
                            <span class="info-value">${customer.firstname}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Email :</span>
                            <span class="info-value">${customer.email}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Date de naissance :</span>
                            <span class="info-value">${this.formatDate(customer.birthday) || 'Non définie'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Inscrit le :</span>
                            <span class="info-value">${this.formatDate(customer.date_add)}</span>
                        </div>
                    </div>
                    <button class="btn-edit" onclick="dashboardManager.editProfile()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Modifier
                    </button>
                </div>

                <!-- Adresses -->
                <div class="profile-card">
                    <h3 class="profile-card-title">Mes adresses</h3>
                    ${this.renderAddresses(customer.addresses)}
                </div>

                <!-- Statistiques -->
                <div class="profile-card">
                    <h3 class="profile-card-title">Statistiques</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-value">${customer.loyalty_points || 0}</span>
                            <span class="stat-label">Points de fidélité</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${customer.wishlist_count || 0}</span>
                            <span class="stat-label">Articles favoris</span>
                        </div>
                    </div>
                </div>

                <!-- Préférences -->
                <div class="profile-card">
                    <h3 class="profile-card-title">Préférences</h3>
                    <div class="preferences">
                        <label class="checkbox-label">
                            <input type="checkbox" ${customer.newsletter ? 'checked' : ''} disabled>
                            <span>Newsletter</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" ${customer.optin ? 'checked' : ''} disabled>
                            <span>Offres partenaires</span>
                        </label>
                    </div>
                </div>
            </div>
        `;

        profileSection.innerHTML = html;
    }

    /**
     * Affiche les adresses
     */
    renderAddresses(addresses) {
        if (!addresses || addresses.length === 0) {
            return '<p class="empty-message">Aucune adresse enregistrée</p>';
        }

        return addresses.map(addr => `
            <div class="address-item ${addr.is_default ? 'default' : ''}">
                <div class="address-alias">${addr.alias} ${addr.is_default ? '<span class="badge">Par défaut</span>' : ''}</div>
                <div class="address-content">
                    ${addr.company ? `<div>${addr.company}</div>` : ''}
                    <div>${addr.firstname} ${addr.lastname}</div>
                    <div>${addr.address1}</div>
                    ${addr.address2 ? `<div>${addr.address2}</div>` : ''}
                    <div>${addr.postcode} ${addr.city}</div>
                    <div>${addr.country}</div>
                    ${addr.phone ? `<div>Tél: ${addr.phone}</div>` : ''}
                    ${addr.phone_mobile ? `<div>Mobile: ${addr.phone_mobile}</div>` : ''}
                </div>
                <div class="address-actions">
                    <button class="btn-icon" title="Modifier">✏️</button>
                    <button class="btn-icon" title="Supprimer">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Affiche les commandes
     */
    renderOrders(orders, pagination = null) {
        const ordersSection = document.getElementById('orders-section');
        if (!ordersSection) return;

        if (!orders || orders.length === 0) {
            ordersSection.innerHTML = `
                <h2 class="dashboard-title">Mes commandes</h2>
                <div class="empty-state">
                    <p>Vous n'avez pas encore passé de commande</p>
                </div>
            `;
            return;
        }

        const html = `
            <h2 class="dashboard-title">Mes commandes ${pagination ? `(${pagination.total} au total)` : ''}</h2>
            
            ${pagination && pagination.total > pagination.limit ? `
                <div class="orders-filter-bar">
                    <div class="results-info">
                        Affichage de ${((pagination.page - 1) * pagination.limit) + 1} à ${Math.min(pagination.page * pagination.limit, pagination.total)} sur ${pagination.total} commandes
                    </div>
                    <div class="items-per-page">
                        <label>Commandes par page:</label>
                        <select onchange="dashboardManager.changeOrdersPerPage(this.value)">
                            <option value="5" ${this.ordersPerPage === 5 ? 'selected' : ''}>5</option>
                            <option value="10" ${this.ordersPerPage === 10 ? 'selected' : ''}>10</option>
                            <option value="20" ${this.ordersPerPage === 20 ? 'selected' : ''}>20</option>
                            <option value="50" ${this.ordersPerPage === 50 ? 'selected' : ''}>50</option>
                        </select>
                    </div>
                </div>
            ` : ''}
            
            <div class="orders-list">
                ${orders.map(order => this.renderOrderCard(order)).join('')}
            </div>
            
            ${pagination && pagination.pages > 1 ? this.renderPagination(pagination) : ''}
        `;

        ordersSection.innerHTML = html;
    }

    /**
     * Affiche la pagination
     */
    renderPagination(pagination) {
        const { page, pages } = pagination;
        let paginationHtml = '<div class="pagination-wrapper"><ul class="pagination">';

        // Bouton précédent
        paginationHtml += `
            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="dashboardManager.goToOrderPage(${page - 1}); return false;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </a>
            </li>
        `;

        // Numéros de page avec ellipses
        const maxVisible = 5;
        let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
        let endPage = Math.min(pages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        // Première page si nécessaire
        if (startPage > 1) {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="dashboardManager.goToOrderPage(1); return false;">1</a>
                </li>
            `;
            if (startPage > 2) {
                paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Pages visibles
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <li class="page-item ${i === page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="dashboardManager.goToOrderPage(${i}); return false;">${i}</a>
                </li>
            `;
        }

        // Dernière page si nécessaire
        if (endPage < pages) {
            if (endPage < pages - 1) {
                paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="dashboardManager.goToOrderPage(${pages}); return false;">${pages}</a>
                </li>
            `;
        }

        // Bouton suivant
        paginationHtml += `
            <li class="page-item ${page === pages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="dashboardManager.goToOrderPage(${page + 1}); return false;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </a>
            </li>
        `;

        paginationHtml += '</ul></div>';
        return paginationHtml;
    }

    /**
     * Navigation vers une page de commandes
     */
    goToOrderPage(page) {
        if (page < 1) return;
        this.loadOrders(page);
        // Scroll vers le haut de la section
        document.getElementById('orders-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Change le nombre de commandes par page
     */
    changeOrdersPerPage(value) {
        this.ordersPerPage = parseInt(value);
        this.currentOrderPage = 1;
        this.loadOrders(1);
    }

    /**
     * Affiche une carte de commande
     */
    renderOrderCard(order) {
        return `
            <div class="order-card-detailed">
                <div class="order-header">
                    <div class="order-main-info">
                        <h4>Commande #${order.reference}</h4>
                        <span class="order-date">${this.formatDate(order.date_add)}</span>
                    </div>
                    <div class="order-status-badge" style="background-color: ${order.status.color}20; color: ${order.status.color}">
                        ${order.status.name}
                    </div>
                </div>
                
                <div class="order-details">
                    <div class="detail-item">
                        <span class="detail-label">Paiement :</span>
                        <span>${order.payment}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Transporteur :</span>
                        <span>${order.carrier.name}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Nombre d'articles :</span>
                        <span>${order.nb_products}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Total :</span>
                        <span class="order-total">${order.total_paid}</span>
                    </div>
                </div>

                ${order.tracking_number ? `
                    <div class="tracking-info">
                        <span>Numéro de suivi :</span>
                        <a href="${order.tracking_number.url}" target="_blank">${order.tracking_number.number}</a>
                    </div>
                ` : ''}

                <div class="order-actions">
                    <button class="btn-secondary" onclick="dashboardManager.viewOrderDetails(${order.id})">
                        Voir le détail
                    </button>
                    ${order.invoice_number ? `
                        <button class="btn-secondary" onclick="dashboardManager.downloadInvoice(${order.id})">
                            Télécharger la facture
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Affiche les statistiques
     */
    renderStats(stats) {
        // À implémenter selon vos besoins
    }

    /**
     * Formatage de date
     */
    formatDate(dateString) {
        if (!dateString || dateString === '0000-00-00') return null;

        const date = new Date(dateString);
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };

        return date.toLocaleDateString('fr-FR', options);
    }

    /**
     * Affiche un message d'erreur
     */
    showError(message) {
        const alertHtml = `
            <div class="alert alert-danger alert-dismissible" role="alert">
                ${message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;

        const container = document.querySelector('.main-dashboard');
        if (container) {
            container.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }

    /**
     * Affiche un message de succès
     */
    showSuccess(message) {
        const alertHtml = `
            <div class="alert alert-success alert-dismissible" role="alert">
                ${message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;

        const container = document.querySelector('.main-dashboard');
        if (container) {
            container.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }

    /**
     * Éditer le profil
     */
    editProfile() {
        // Redirection vers la page d'édition du profil PrestaShop
        window.location.href = this.baseUrl + 'identity';
    }

    /**
     * Voir les détails d'une commande
     */
    viewOrderDetails(orderId) {
        // Redirection vers la page de détail de commande PrestaShop
        window.location.href = this.baseUrl + 'index.php?controller=order-detail&id_order=' + orderId;
    }

    /**
     * Télécharger une facture
     */
    downloadInvoice(orderId) {
        // Redirection vers le téléchargement de facture
        window.location.href = this.baseUrl + 'index.php?controller=pdf-invoice&id_order=' + orderId;
    }
}

// Initialisation au chargement de la page
let dashboardManager;

document.addEventListener('DOMContentLoaded', function() {
    dashboardManager = new DashboardManager();
});