import {prestashopConfig} from "../prestashop.config.js";
import Api from "../services/api.js";
import { orderTemplate } from "../templates/order.template.js";

class Order {
    constructor() {
    }

    /**
     * avoir les commandes d'un utilisateur
     */
    static async getOrders(page = 1, limit = 10){
        try{
            // Passer les paramètres à l'API
            const data = await Api.fetchData('getOrders', {
                page: page,
                limit: limit
            });

            if (data.success){
                return [data.data.orders, data.data.pagination];
            }
        }catch (e) {
            Log.error(" pas de données pour les commandes");
            throw Error("pas de commandes");
        }
    }

    /**
     * return les information des commandes
     */
    static renderOrders(orders, pagination, ordersPerPage = 10){
        try {
            orderTemplate(orders, pagination, ordersPerPage);
        }catch (e) {
            console.error(e);
            Log.error(e);
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