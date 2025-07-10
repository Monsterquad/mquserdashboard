/**
 * Renderer pour l'affichage du dashboard
 * Path: modules/mquserdashboard/views/js/dashboard.renderer.js
 */

class DashboardRenderer {
    constructor() {
        this.baseUrl = prestashop.urls.base_url;
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
                    <button class="btn-edit" onclick="dashboardManager.editAddress()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Modifier
                    </button>
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
 * Affiche le formulaire de modification du profil
 */
renderModifProfil(customer) {
    const profileSection = document.getElementById('profile-section');
    if (!profileSection || !customer) return;

    const html = `
        <h2 class="dashboard-title">Modifier mon profil</h2>
        
        <div class="modif-profile-container">
            <form class="modif-profile-form" id="profile-form">
                <div class="modif-profile-grid">
                    <!-- Informations personnelles -->
                    <div class="modif-profile-card">
                        <h3 class="modif-profile-card-title">Informations personnelles</h3>
                        
                        <div class="modif-profile-field-group">
                            <label class="modif-profile-label">Civilité</label>
                            <div class="modif-profile-radio-group">
                                <label class="modif-profile-radio-label">
                                    <input type="radio" name="gender" value="1" ${customer.gender === 'M.' ? 'checked' : ''}>
                                    <span>M.</span>
                                </label>
                                <label class="modif-profile-radio-label">
                                    <input type="radio" name="gender" value="2" ${customer.gender === 'Mme' ? 'checked' : ''}>
                                    <span>Mme</span>
                                </label>
                            </div>
                        </div>

                        <div class="modif-profile-field-group">
                            <label class="modif-profile-label" for="firstname">Prénom *</label>
                            <input 
                                type="text" 
                                id="firstname" 
                                name="firstname" 
                                class="modif-profile-input" 
                                value="${customer.firstname}" 
                                required
                            >
                        </div>

                        <div class="modif-profile-field-group">
                            <label class="modif-profile-label" for="lastname">Nom *</label>
                            <input 
                                type="text" 
                                id="lastname" 
                                name="lastname" 
                                class="modif-profile-input" 
                                value="${customer.lastname}" 
                                required
                            >
                        </div>

                        <div class="modif-profile-field-group">
                            <label class="modif-profile-label" for="email">Email *</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                class="modif-profile-input" 
                                value="${customer.email}" 
                                required
                            >
                        </div>

                        <div class="modif-profile-field-group">
                            <label class="modif-profile-label" for="birthday">Date de naissance</label>
                            <input 
                                type="date" 
                                id="birthday" 
                                name="birthday" 
                                class="modif-profile-input" 
                                value="${customer.birthday || ''}"
                            >
                        </div>
                    </div>

                    <!-- Préférences -->
                    <div class="modif-profile-card">
                        <h3 class="modif-profile-card-title">Préférences</h3>
                        
                        <div class="modif-profile-field-group">
                            <label class="modif-profile-checkbox-label">
                                <input type="checkbox" name="newsletter" ${customer.newsletter ? 'checked' : ''}>
                                <span class="modif-profile-checkbox-text">Recevoir la newsletter</span>
                            </label>
                        </div>

                        <div class="modif-profile-field-group">
                            <label class="modif-profile-checkbox-label">
                                <input type="checkbox" name="optin" ${customer.optin ? 'checked' : ''}>
                                <span class="modif-profile-checkbox-text">Recevoir les offres de nos partenaires</span>
                            </label>
                        </div>
                    </div>

                    <!-- Mot de passe -->
                    <div class="modif-profile-card">
                        <h3 class="modif-profile-card-title">Changer le mot de passe</h3>
                        
                        <div class="modif-profile-field-group">
                            <label class="modif-profile-label" for="current_password">Mot de passe actuel</label>
                            <input 
                                type="password" 
                                id="current_password" 
                                name="current_password" 
                                class="modif-profile-input"
                                placeholder="Laissez vide si vous ne voulez pas changer"
                            >
                        </div>

                        <div class="modif-profile-field-group">
                            <label class="modif-profile-label" for="new_password">Nouveau mot de passe</label>
                            <input 
                                type="password" 
                                id="new_password" 
                                name="new_password" 
                                class="modif-profile-input"
                                placeholder="Minimum 8 caractères"
                            >
                        </div>

                        <div class="modif-profile-field-group">
                            <label class="modif-profile-label" for="confirm_password">Confirmer le mot de passe</label>
                            <input 
                                type="password" 
                                id="confirm_password" 
                                name="confirm_password" 
                                class="modif-profile-input"
                            >
                        </div>
                    </div>
                </div>

                <div class="modif-profile-actions">
                    <button type="button" class="modif-profile-btn-cancel" onclick="dashboardManager.cancelProfileEdit()">
                        Annuler
                    </button>
                    <button type="submit" class="modif-profile-btn-save">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        Sauvegarder
                    </button>
                </div>
            </form>
        </div>
    `;

    profileSection.innerHTML = html;
}

/**
 * Affiche le formulaire de modification des adresses
 */
renderModifAddress(addresses) {
    const profileSection = document.getElementById('profile-section');
    if (!profileSection){
        console.log('pas de section de profile')
        return;
    }

    const html = `
        <h2 class="dashboard-title">Gérer mes adresses</h2>
        
        <div class="modif-address-container">
            <div class="modif-address-header">
                <button class="modif-address-btn-add" onclick="dashboardManager.addNewAddress()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Ajouter une adresse
                </button>
            </div>

            <div class="modif-address-list">
                ${addresses && addresses.length > 0 ? 
                    addresses.map(addr => this.renderAddressEditCard(addr)).join('') :
                    '<div class="modif-address-empty">Aucune adresse enregistrée</div>'
                }
            </div>

            <div class="modif-address-actions">
                <button type="button" class="modif-address-btn-cancel" onclick="dashboardManager.cancelAddressEdit()">
                    Retour au profil
                </button>
            </div>
        </div>
    `;

    profileSection.innerHTML = html;
}

/**
 * Affiche une carte d'adresse en mode édition
 */
renderAddressEditCard(address) {
    return `
        <div class="modif-address-card ${address.is_default ? 'modif-address-default' : ''}">
            <div class="modif-address-card-header">
                <h4 class="modif-address-alias">${address.alias}</h4>
                <div class="modif-address-card-badges">
                    ${address.is_default ? '<span class="modif-address-badge-default">Par défaut</span>' : ''}
                </div>
            </div>

            <div class="modif-address-content">
                <div class="modif-address-info">
                    ${address.company ? `<div class="modif-address-line"><strong>Société:</strong> ${address.company}</div>` : ''}
                    <div class="modif-address-line"><strong>Nom:</strong> ${address.firstname} ${address.lastname}</div>
                    <div class="modif-address-line"><strong>Adresse:</strong> ${address.address1}</div>
                    ${address.address2 ? `<div class="modif-address-line">${address.address2}</div>` : ''}
                    <div class="modif-address-line"><strong>Ville:</strong> ${address.postcode} ${address.city}</div>
                    <div class="modif-address-line"><strong>Pays:</strong> ${address.country}</div>
                    ${address.phone ? `<div class="modif-address-line"><strong>Téléphone:</strong> ${address.phone}</div>` : ''}
                    ${address.phone_mobile ? `<div class="modif-address-line"><strong>Mobile:</strong> ${address.phone_mobile}</div>` : ''}
                </div>

                <div class="modif-address-card-actions">
                    ${!address.is_default ? `
                        <button class="modif-address-btn-default" onclick="dashboardManager.setDefaultAddress(${address.id})" title="Définir par défaut">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            Par défaut
                        </button>
                    ` : ''}
                    <button class="modif-address-btn-edit" onclick="dashboardManager.editAddress(${address.id})" title="Modifier">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Modifier
                    </button>
                    <button class="modif-address-btn-delete" onclick="dashboardManager.deleteAddress(${address.id})" title="Supprimer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    `;
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
    renderOrders(orders, pagination = null, ordersPerPage = 10) {
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
                            <option value="5" ${ordersPerPage === 5 ? 'selected' : ''}>5</option>
                            <option value="10" ${ordersPerPage === 10 ? 'selected' : ''}>10</option>
                            <option value="20" ${ordersPerPage === 20 ? 'selected' : ''}>20</option>
                            <option value="50" ${ordersPerPage === 50 ? 'selected' : ''}>50</option>
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
                        <span class="order-total">${order.total_paid_value}</span>
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
     * Affiche les statistiques
     */
    renderStats(stats) {
        const statsSection = document.getElementById('stats-section');
        if (!statsSection || !stats) return;

        // À implémenter selon vos besoins
        const html = `
            <h2 class="dashboard-title">Statistiques</h2>
            <div class="stats-grid">
                <!-- Contenu des statistiques -->
            </div>
        `;

        statsSection.innerHTML = html;
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
}