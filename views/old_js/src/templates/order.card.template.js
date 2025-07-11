/**
 * rendu des card template orders
 */
import {formatDate} from "../utils/date.js";

export const renderOrderCard = (order) => {
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
                    <button class="btn-secondary" onclick="viewOrderDetails(${order.id})">
                        Voir le détail
                    </button>
                    ${order.invoice_number ? `
                        <button class="btn-secondary" onclick="downloadInvoice(${order.id})">
                            Télécharger la facture
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
}