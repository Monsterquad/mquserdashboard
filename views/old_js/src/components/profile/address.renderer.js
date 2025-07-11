

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