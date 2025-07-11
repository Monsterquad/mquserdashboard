/**
 * Affiche les adresses la section par defaut dans l'écran profil
 */

export const rendererAdressProfilView = (addresses) => {
    if (!addresses || addresses.length === 0) {
        Log.error("aucune adresse enregistrée");
        return;
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