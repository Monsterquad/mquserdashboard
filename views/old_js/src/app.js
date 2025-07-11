import Routeur from "./router.js";
import Log from './utils/log.js';
import Order from "./components/order.js";

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    setupGlobalFunctions()
    window.Log = new Log();
    window.dashboardManager = new Routeur();
}

function setupGlobalFunctions() {
    window.viewOrderDetails = (orderId) => {
        Order.viewOrderDetails(orderId);
    };

    window.downloadInvoice = (orderId) => {
        Order.downloadInvoice(orderId);
    };
}