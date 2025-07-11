import {prestashopConfig} from "../prestashop.config.js";

class Order {
    constructor() {
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

window.Order = Order;

export default Order;