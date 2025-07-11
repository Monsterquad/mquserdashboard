import {prestashopConfig} from "../prestashop.config.js";
import Api from "../services/api.js";
import Log from "../utils/log.js";
import { orderTemplate } from "../templates/order.template.js";

class Order {
    constructor() {
    }

    /**
     * avoir les commandes d'un utilisateur
     */
    static async getOrders(){
         try{
            const data = await Api.fetchData('getOrders');
            if (data.success){
                return [data.data.orders, data.data.pagination]
            }
        }catch (e) {
             log.error(" pas de données pour les commandes");
             throw Error("pas de commandes")
         }
    }

    /**
     * return les information des commandes
     */
    static renderOrders(orders, pagination){
        try {
            orderTemplate(orders, pagination);
        }catch (e) {
            console.error(e)
            log.error(e)
        }
    }

    /**
     * Voir les détails d'une commande
     */
    static viewOrderDetails(orderId) {
        console.log("view order appelé")
        window.location.href = prestashopConfig.baseUrl + 'index.php?controller=order-detail&id_order=' + orderId;
    }

    /**
     * Télécharger une facture
     */
    static downloadInvoice(orderId) {
        console.log("download appelé")
        window.location.href = prestashopConfig.baseUrl + 'index.php?controller=pdf-invoice&id_order=' + orderId;
    }

}
export default Order;