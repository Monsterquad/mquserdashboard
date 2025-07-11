import Routeur from "./router.js";
import Log from './utils/log.js';

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    window.dashboardManager = new Routeur();
    window.log = new Log();
}