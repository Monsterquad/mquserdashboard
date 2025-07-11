export default class Api {

    constructor() {

    }

    /**
     * Effectue une requête AJAX sur le controller back
     */
    static async fetchData(action, params = {}) {
        const formData = new FormData();
        formData.append('action', action);
        formData.append('ajax', '1');

        Object.keys(params).forEach(key => {
            formData.append(key, params[key]);
        });

        const ok = "ok"


        try {
            const response = await fetch(prestashop.urls.base_url + 'module/mquserdashboard/ajax', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur AJAX:', error);
            throw error;
        }
    }
}