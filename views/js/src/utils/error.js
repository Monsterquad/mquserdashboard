class Error {
    constructor() {
    }

    /**
     * Affiche un message d'erreur
     * affiche une erreur dans le container princpal du dashboard
     */
    static showError(message) {
        const alertHtml = `
            <div class="alert alert-danger alert-dismissible" role="alert">
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

export default Error;