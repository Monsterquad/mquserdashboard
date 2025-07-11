class Success {
    constructor() {
    }

    /**
     * Affiche un message de succès
     * met un message de succès dans le container principal du dashboard
     */
    showSuccess(message) {
        const alertHtml = `
            <div class="alert alert-success alert-dismissible" role="alert">
                ${message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;

        const container = document.querySelector('.main-dashboard');
        if (container) {
            container.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }
}