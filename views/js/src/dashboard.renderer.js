
import {ProfileRenderer} from "./profile/profile.renderer.js";
import {renderAddressModifViews} from "./profile/address.renderer.js";

class DashboardRenderer {
    constructor() {
    }

    /**
     * Affiche les informations du profil
     */
    renderProfile(customer) {
        renderProfil(customer)
    }

    /**
     * Affiche le formulaire de modification des adresses
     */
    renderModifAddress(addresses) {
        renderAddressModifViews(addresses)
    }
}

export default DashboardRenderer;