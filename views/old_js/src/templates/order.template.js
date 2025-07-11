import {renderOrderCard} from './order.card.template.js';
import { paginationTemplate } from "./pagination.template.js";


/**
 * template de la view principal des commandes
 */

export const orderTemplate = (orders, pagination = null, ordersPerPage = 10) => {
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
                ${orders.map(order => renderOrderCard(order)).join('')}
            </div>
            
            ${pagination && pagination.pages > 1 ? paginationTemplate(pagination) : ''}
        `;

        ordersSection.innerHTML = html;
}