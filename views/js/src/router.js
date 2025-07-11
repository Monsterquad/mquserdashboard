import Profil from "./components/profile.js";
import Order from "./components/order.js";

class Routeur {
    constructor() {
        this.currentSection = 'profile';
        this.currentOrderPage = 1;
        this.ordersPerPage = 10;
        this.customerData = null;

        this.init();
    }

    init() {
        this.removeExistingHandlers();
        this.bindNavigation();
        this.showSection(this.currentSection);
    }
    removeExistingHandlers() {
        const menuItems = document.querySelectorAll('.left-link li');
        menuItems.forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
        });
    }

    bindNavigation() {
        const menuItems = document.querySelectorAll('.left-link li');

        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                // Update active state
                menuItems.forEach(mi => mi.classList.remove('active'));
                item.classList.add('active');

                // Switch section
                const section = item.getAttribute('data-section');
                this.showSection(section);
            });
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.display = 'none';
        });

        const targetSection = document.getElementById(sectionName + '-section');
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionName;
            this.loadSection(sectionName);
        }
    }

    async loadSection(section) {
        try {
            /*
            * profile / orders / credit / alert / reviews
            */
            switch (section) {
                case 'profile':
                    await this.loadProfile();
                    break;
                case 'orders':
                    await this.loadOrders();
                    break;
            }
        } catch (error) {
            Log.error(`Impossible de charger ${section}`);
        }
    }

    async loadProfile() {
        const data = await Profil.customerInfo();
        if (data) {
            this.customerData = data;
            Profil.renderProfil(this.customerData);
        }
    }

    async loadOrders(){
        try {
            const [orders, pagination] = await Order.getOrders(
                this.currentOrderPage,
                this.ordersPerPage
            );

            if (orders && pagination){
                Order.renderOrders(orders, pagination, this.ordersPerPage);
            }
        } catch (error) {
            Log.error('Erreur lors du chargement des commandes:', error);
        }
    }

    async changeOrdersPerPage(newPerPage) {
        try {
            this.ordersPerPage = parseInt(newPerPage);
            this.currentOrderPage = 1;
            await this.loadOrders();
        } catch (error) {
            Log.error('Erreur lors du changement du nombre de commandes par page:', error);
        }
    }
}

export default Routeur;