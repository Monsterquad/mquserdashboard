class Log {
    constructor() {
        this.container = document.querySelector('.main-dashboard');
    }

    /**
     * Affiche un message d'erreur
     * affiche une erreur dans le container princpal du dashboard
     */
    error(message) {
        const alertHtml = `
            <div class="alert alert-danger alert-dismissible" role="alert">
                ${message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;

        if (this.container) {
            this.container.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }

    /**
     * Affiche un message de succès
     * met un message de succès dans le container principal du dashboard
     */
    success(message) {
        const alertHtml = `
            <div class="alert alert-success alert-dismissible" role="alert">
                ${message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;

        if (this.container) {
            this.container.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }
}

export default Log;