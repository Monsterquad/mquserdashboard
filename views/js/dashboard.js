/**
 * JavaScript Dashboard Utilisateur
 * Path: modules/mqdashboard/views/js/dashboard.js
 */

document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

function initDashboard() {
    // Animation d'entrée progressive
    animateOnLoad();

    // Gestion des interactions
    setupInteractions();

    // Mise à jour automatique des données
    setupAutoRefresh();

    // Gestion responsive
    setupResponsive();
}

/**
 * Animation d'entrée progressive des éléments
 */
function animateOnLoad() {
    const sections = document.querySelectorAll('.dashboard-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(section);
    });
}

/**
 * Configuration des interactions utilisateur
 */
function setupInteractions() {
    // Tooltip pour les statuts de commande
    setupTooltips();

    // Copie rapide des codes de réduction
    setupVoucherCopy();

    // Confirmation pour la déconnexion
    setupLogoutConfirmation();

    // Gestion des cartes cliquables
    setupClickableCards();
}

/**
 * Tooltips pour les statuts
 */
function setupTooltips() {
    const statusBadges = document.querySelectorAll('.status-badge');
    statusBadges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            showTooltip(this, getStatusDescription(this.textContent));
        });

        badge.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
}

function getStatusDescription(status) {
    const descriptions = {
        'En préparation': 'Votre commande est en cours de préparation dans nos entrepôts',
        'Expédiée': 'Votre commande a été expédiée et est en route',
        'Livrée': 'Votre commande a été livrée avec succès',
        'Annulée': 'Cette commande a été annulée',
        'En attente': 'Votre commande est en attente de traitement'
    };
    return descriptions[status] || 'Statut de la commande';
}

function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'dashboard-tooltip';
    tooltip.textContent = text;

    tooltip.style.cssText = `
        position: absolute;
        background: #1a202c;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.875rem;
        z-index: 1000;
        max-width: 200px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        pointer-events: none;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.2s ease;
    `;

    document.body.appendChild(tooltip);

    const rect = element.getBoundingClientRect();
    tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';

    requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0)';
    });
}

function hideTooltip() {
    const tooltip = document.querySelector('.dashboard-tooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(-10px)';
        setTimeout(() => tooltip.remove(), 200);
    }
}

/**
 * Copie rapide des codes de réduction
 */
function setupVoucherCopy() {
    const voucherCodes = document.querySelectorAll('.voucher-code strong');
    voucherCodes.forEach(code => {
        code.style.cursor = 'pointer';
        code.title = 'Cliquer pour copier le code';

        code.addEventListener('click', function() {
            copyToClipboard(this.textContent);
            showCopyNotification(this);
        });
    });
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback pour les navigateurs plus anciens
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function showCopyNotification(element) {
    const notification = document.createElement('div');
    notification.textContent = '✓ Code copié !';
    notification.style.cssText = `
        position: absolute;
        background: #48bb78;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.2s ease;
    `;

    document.body.appendChild(notification);

    const rect = element.getBoundingClientRect();
    notification.style.left = (rect.left + rect.width / 2 - notification.offsetWidth / 2) + 'px';
    notification.style.top = (rect.top - notification.offsetHeight - 8) + 'px';

    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 200);
    }, 2000);
}

/**
 * Confirmation pour la déconnexion
 */
function setupLogoutConfirmation() {
    const logoutLink = document.querySelector('.quick-action-card.logout');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            showLogoutModal(this.href);
        });
    }
}

function showLogoutModal(logoutUrl) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            padding: 32px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            transform: translateY(-20px);
            transition: transform 0.3s ease;
        ">
            <div style="font-size: 3rem; margin-bottom: 16px;">👋</div>
            <h3 style="margin: 0 0 16px 0; color: #1a202c;">Confirmer la déconnexion</h3>
            <p style="margin: 0 0 24px 0; color: #718096;">Êtes-vous sûr de vouloir vous déconnecter ?</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button class="cancel-logout" style="
                    padding: 12px 24px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #4a5568;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s ease;
                ">Annuler</button>
                <button class="confirm-logout" style="
                    padding: 12px 24px;
                    border: none;
                    background: #f56565;
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s ease;
                ">Se déconnecter</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.querySelector('div').style.transform = 'translateY(0)';
    });

    modal.querySelector('.cancel-logout').addEventListener('click', () => {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    });

    modal.querySelector('.confirm-logout').addEventListener('click', () => {
        window.location.href = logoutUrl;
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        }
    });
}

/**
 * Cartes cliquables
 */
function setupClickableCards() {
    const orderCards = document.querySelectorAll('.order-card');
    orderCards.forEach(card => {
        const detailLink = card.querySelector('.btn-action');
        if (detailLink) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', function(e) {
                if (e.target.classList.contains('btn-action')) return;
                detailLink.click();
            });
        }
    });
}

/**
 * Mise à jour automatique
 */
function setupAutoRefresh() {
    // Mise à jour des données toutes les 5 minutes
    setInterval(refreshDashboardData, 5 * 60 * 1000);
}

function refreshDashboardData() {
    // Ici vous pouvez ajouter une requête AJAX pour mettre à jour les données
    // sans recharger la page complète

    const statsCards = document.querySelectorAll('.stat-card');
    statsCards.forEach(card => {
        card.style.opacity = '0.7';
        setTimeout(() => {
            card.style.opacity = '1';
        }, 500);
    });
}

/**
 * Gestion responsive
 */
function setupResponsive() {
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 250);
    });
}

function handleResize() {
    // Réajuster la disposition sur mobile
    const dashboard = document.querySelector('.mq-dashboard');
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        dashboard.classList.add('mobile-layout');
    } else {
        dashboard.classList.remove('mobile-layout');
    }
}

/**
 * Utilitaires
 */
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// Export pour utilisation externe si nécessaire
window.MqDashboard = {
    refresh: refreshDashboardData,
    formatPrice: formatPrice,
    formatDate: formatDate
};