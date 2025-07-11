import {formatDate} from '../utils/date.js';


/**
 * return les information profile
 */
export function renderProfil(customer){
    const profileSection = document.getElementById('profile-section');
    if (!profileSection) return;

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
                        <span class="info-value">${formatDate(customer.birthday) || 'Non définie'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Inscrit le :</span>
                        <span class="info-value">${formatDate(customer.date_add)}</span>
                    </div>
                </div>
                <button class="btn-edit" onclick="">
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
                ${renderAddresses(customer.addresses)}
                <button class="btn-edit" 
                    data-customer='${JSON.stringify(customer).replace(/'/g, "&apos;")}' 
                    onclick="renderAddressModifViews(JSON.parse(this.dataset.customer).addresses)">
                >
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

window.renderProfil = renderProfil

