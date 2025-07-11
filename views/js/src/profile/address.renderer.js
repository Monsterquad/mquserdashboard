

export function renderAddressModifViews(addresses){
    const profileSection = document.getElementById('profile-section');
    if (!profileSection){
        console.log('pas de section de profile')
        return;
    }

    const html = `
        <h2 class="dashboard-title">Gérer mes adresses</h2>
        
        <div class="modif-address-container">
            <div class="modif-address-header">
                <button class="modif-address-btn-add" onclick="">
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
                    addresses.map(addr => renderAddressEditCard(addr)).join('') :
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
export function renderAddressEditCard(address) {
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
 * Affiche les adresses la section par defaut dans l'écran profil
 */
export function renderAddresses(addresses) {
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
            <!--<div class="address-actions">
                <button class="btn-icon" title="Modifier">✏️</button>
                <button class="btn-icon" title="Supprimer">🗑️</button>
            </div>!-->
        </div>
    `).join('');
}

window.renderAddressModifViews = renderAddressModifViews;

window.renderAddresses = renderAddresses;