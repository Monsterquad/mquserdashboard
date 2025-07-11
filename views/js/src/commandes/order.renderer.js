import {formatDate} from "../utils/date.js";
import Pagination from "../utils/pagination.js";
import Order from "./order.js";
class OrderRenderer {
    constructor() {
    }

    /**
     * Affiche les commandes
     */
    static renderOrders(orders, pagination = null, ordersPerPage = 10) {
        const ordersSection = document.getElementById('orders-section');
        if (!ordersSection) return;

        if (!orders || orders.length === 0) {
            ordersSection.innerHTML = `
                <h2 class="dashboard-title">Mes commandes</h2>
                <div class="empty-state">
                    <p>Vous n'avez pas encore passé de commande</p>
                </div>
            `;
            return;
        }

        const html = `
            <h2 class="dashboard-title">Mes commandes ${pagination ? `(${pagination.total} au total)` : ''}</h2>
            
            ${pagination && pagination.total > pagination.limit ? `
                <div class="orders-filter-bar">
                    <div class="results-info">
                        Affichage de ${((pagination.page - 1) * pagination.limit) + 1} à ${Math.min(pagination.page * pagination.limit, pagination.total)} sur ${pagination.total} commandes
                    </div>
                    <div class="items-per-page">
                        <label>Commandes par page:</label>
                        <select onchange="dashboardManager.changeOrdersPerPage(this.value)">
                            <option value="5" ${ordersPerPage === 5 ? 'selected' : ''}>5</option>
                            <option value="10" ${ordersPerPage === 10 ? 'selected' : ''}>10</option>
                            <option value="20" ${ordersPerPage === 20 ? 'selected' : ''}>20</option>
                            <option value="50" ${ordersPerPage === 50 ? 'selected' : ''}>50</option>
                        </select>
                    </div>
                </div>
            ` : ''}
            
            <div class="orders-list">
                ${orders.map(order => this.renderOrderCard(order)).join('')}
            </div>
            
            ${pagination && pagination.pages > 1 ? Pagination.renderPagination(pagination) : ''}
        `;

        ordersSection.innerHTML = html;
    }

    /**
     * Affiche une carte de commande
     */
    static renderOrderCard(order) {
        return `
            <div class="order-card-detailed">
                <div class="order-header">
                    <div class="order-main-info">
                        <h4>Commande #${order.reference}</h4>
                        <span class="order-date">${formatDate(order.date_add)}</span>
                    </div>
                    <div class="order-status-badge" style="background-color: ${order.status.color}20; color: ${order.status.color}">
                        ${order.status.name}
                    </div>
                </div>
                
                <div class="order-details">
                    <div class="detail-item">
                        <span class="detail-label">Paiement :</span>
                        <span>${order.payment}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Transporteur :</span>
                        <span>${order.carrier.name}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Nombre d'articles :</span>
                        <span>${order.nb_products}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Total :</span>
                        <span class="order-total">${order.total_paid_value}</span>
                    </div>
                </div>

                ${order.tracking_number ? `
                    <div class="tracking-info">
                        <span>Numéro de suivi :</span>
                        <a href="${order.tracking_number.url}" target="_blank">${order.tracking_number.number}</a>
                    </div>
                ` : ''}

                <div class="order-actions">
                    <button class="btn-secondary" onclick="Order.viewOrderDetails(${order.id})">
                        Voir le détail
                    </button>
                    ${order.invoice_number ? `
                        <button class="btn-secondary" onclick="Order.downloadInvoice(${order.id})">
                            Télécharger la facture
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
}
export default OrderRenderer;