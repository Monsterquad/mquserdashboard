import Fetcher from "../utils/fetcher.js";
import {renderAddressModifViews} from "./address.renderer.js";
class Profil {

    constructor() {
        this.profil = null;
    }

    async customerInfo(){
        try {
            const data = await Fetcher.fetchData('getCustomerInfo');
            if (data.success) {
                this.profil = data.data;
                return this.profil;
            }
            throw new Error('Impossible de récupérer les informations client');
        } catch (error) {
            console.error('Erreur lors du chargement des informations client:', error);
            throw error;
        }
    }

    static renderAdressModifView(addresses){
        return renderAddressModifViews(addresses);
    }
}


window.Profil = Profil
export default Profil;