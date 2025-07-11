import Api from "../services/api.js";
import { ProfilTemplate } from '../templates/profile.template.js';

class Profil {

    constructor() {
    }

    static async customerInfo(){
        try {
            const data = await Api.fetchData('getCustomerInfo');
            if (data.success) {
                console.log(data)
                return data.data;
            }
            throw new Error('Impossible de récupérer les informations client');
        } catch (error) {
            console.error('Erreur lors du chargement des informations client:', error);
            throw error;
        }
    }

    /**
     * return les information profile
     */
    static renderProfil(customer){
        const profileSection = document.getElementById('profile-section');
        if (!profileSection) return;
        profileSection.innerHTML = ProfilTemplate(customer);
    }
}
export default Profil;