<!-- CustomerVouchers.vue -->
<template>
  <div class="customer-vouchers">
    <h2 class="section-title">Mes bons de réduction</h2>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Chargement de vos bons...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <h3>Erreur</h3>
      <p>{{ error }}</p>
      <button @click="loadVouchers" class="btn-retry">Réessayer</button>
    </div>

    <!-- Vouchers List -->
    <div v-else>
      <div v-if="vouchers && vouchers.length > 0" class="vouchers-section">
        <!-- Stats summary -->
        <div class="vouchers-stats">
          <div class="stat-card">
            <span class="stat-number">{{ vouchers.length }}</span>
            <span class="stat-label">Bon{{ vouchers.length > 1 ? 's' : '' }} disponible{{ vouchers.length > 1 ? 's' : '' }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ highlightedCount }}</span>
            <span class="stat-label">En vedette</span>
          </div>
        </div>

        <!-- Vouchers Grid -->
        <div class="vouchers-grid">
          <div
            v-for="voucher in vouchers"
            :key="voucher.id_cart_rule"
            :class="['voucher-card', { 'highlighted': isHighlighted(voucher) }]"
          >
            <!-- Header with badges -->
            <div class="voucher-header">
              <div class="voucher-badges">
                <span v-if="isHighlighted(voucher)" class="badge highlight-badge">
                  En vedette
                </span>
                <span v-if="isPersonal(voucher)" class="badge personal-badge">
                  Personnel
                </span>
                <span v-if="hasGift(voucher)" class="badge gift-badge">
                  Cadeau inclus
                </span>
              </div>
              <span class="voucher-id">#{{ voucher.id_cart_rule }}</span>
            </div>

            <!-- Discount Display -->
            <div class="discount-display">
              <div class="discount-main">
                <span v-if="voucher.reduction_percent > 0" class="discount-value">
                  -{{ voucher.reduction_percent }}%
                </span>
                <span v-else-if="voucher.reduction_amount > 0" class="discount-value">
                  -{{ formatPrice(voucher.reduction_amount) }}
                </span>
                <span v-else class="discount-value">Gratuit</span>
              </div>

              <div class="discount-benefits">
                <span v-if="voucher.free_shipping == '1'" class="benefit-item">
                  Livraison gratuite
                </span>
                <span v-if="hasGift(voucher)" class="benefit-item">
                  Cadeau offert
                </span>
              </div>
            </div>

            <!-- Code Section -->
            <div class="voucher-code-section">
              <div class="code-container">
                <span class="code-label">Code promo</span>
                <div class="code-display">
                  <span class="code-text">{{ voucher.code }}</span>
                  <button @click="copyCode(voucher.code)" class="btn-copy" title="Copier le code">
                    Copier
                  </button>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div v-if="voucher.description" class="voucher-description">
              {{ voucher.description }}
            </div>

            <!-- Details -->
            <div class="voucher-details">
              <div class="detail-row">
                <span class="detail-label">Valide du</span>
                <span class="detail-value">{{ formatDate(voucher.date_from) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Valide jusqu'au</span>
                <span class="detail-value">{{ formatDate(voucher.date_to) }}</span>
              </div>
              <div v-if="voucher.minimum_amount > 0" class="detail-row">
                <span class="detail-label">Commande minimum</span>
                <span class="detail-value">{{ formatPrice(voucher.minimum_amount) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Utilisations restantes</span>
                <span class="detail-value">{{ getRemainingUses(voucher) }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="voucher-actions">
              <button @click="useVoucher(voucher)" class="btn-use-voucher">
                Utiliser ce bon
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <h3>Aucun bon de réduction disponible</h3>
        <p>Vous n'avez actuellement aucun bon de réduction à utiliser.</p>
      </div>
    </div>

    <!-- Toast notification for copy -->
    <div v-if="showCopyToast" class="copy-toast">
      Code copié dans le presse-papier
    </div>
  </div>
</template>

<script>
import { fetchData } from "../../lib/fetcher";

export default {
  name: "CustomerVouchers",

  data() {
    return {
      vouchers: null,
      loading: false,
      error: null,
      showCopyToast: false
    }
  },

  computed: {
    highlightedCount() {
      if (!this.vouchers) return 0;
      return this.vouchers.filter(v => this.isHighlighted(v)).length;
    }
  },

  async mounted() {
    await this.loadVouchers();
  },

  methods: {
    // Charger les bons de réduction
    async loadVouchers() {
      this.loading = true;
      this.error = null;

      try {
        const data = await fetchData('getCustomerCredits');
        this.vouchers = data.data || [];
        console.log('Bons chargés:', this.vouchers);
      } catch (error) {
        this.error = error.message;
        console.error('Erreur chargement bons:', error);
      } finally {
        this.loading = false;
      }
    },

    // Vérifier si le bon est mis en avant
    isHighlighted(voucher) {
      return voucher.highlight === '1';
    },

    // Vérifier si le bon est personnel
    isPersonal(voucher) {
      return voucher.id_customer !== '0';
    },

    // Vérifier si le bon a un cadeau
    hasGift(voucher) {
      return voucher.gift_product !== '0';
    },

    // Calculer les utilisations restantes
    getRemainingUses(voucher) {
      const perUser = parseInt(voucher.quantity_per_user);
      const total = parseInt(voucher.quantity);

      if (perUser > 0) {
        return `${perUser} fois`;
      }

      if (total > 0) {
        return total === 1 ? '1 fois' : `${total} fois`;
      }

      return 'Illimité';
    },

    // Copier le code dans le presse-papier
    async copyCode(code) {
      try {
        await navigator.clipboard.writeText(code);
        this.showCopyToast = true;
        setTimeout(() => {
          this.showCopyToast = false;
        }, 2000);
      } catch (error) {
        console.error('Erreur copie:', error);
        // Fallback pour anciens navigateurs
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showCopyToast = true;
        setTimeout(() => {
          this.showCopyToast = false;
        }, 2000);
      }
    },

    // Utiliser le bon
    useVoucher(voucher) {
      this.$emit('use-voucher', voucher);
    },

    // Formatage de prix
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(parseFloat(price));
    },

    // Formatage de date
    formatDate(dateString) {
      if (!dateString || dateString === '0000-00-00 00:00:00') return 'Pas de limite';

      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }
}
</script>

<style scoped>
.customer-vouchers {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.section-title {
  font-size: 32px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 32px;
  text-align: center;
}

/* Loading & Error */
.loading-container {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 40px 24px;
  background: #fef2f2;
  border-radius: 12px;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.btn-retry {
  margin-top: 16px;
  padding: 12px 24px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-retry:hover {
  background: #b91c1c;
}

/* Stats */
.vouchers-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  justify-content: center;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  min-width: 140px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #1a1a1a;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  text-align: center;
  font-weight: 500;
}

/* Vouchers Grid */
.vouchers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.voucher-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  position: relative;
}

.voucher-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.voucher-card.highlighted {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
}

/* Header */
.voucher-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.voucher-badges {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.highlight-badge {
  background: #fef3c7;
  color: #92400e;
}

.personal-badge {
  background: #dbeafe;
  color: #1e40af;
}

.gift-badge {
  background: #fce7f3;
  color: #be185d;
}

.voucher-id {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

/* Discount Display */
.discount-display {
  text-align: center;
  margin-bottom: 24px;
  padding: 24px;
  background: #f1f5f9;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.discount-main {
  margin-bottom: 8px;
}

.discount-value {
  font-size: 32px;
  font-weight: 700;
  color: #059669;
}

.discount-benefits {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #475569;
}

.benefit-item {
  font-weight: 500;
}

/* Code Section */
.voucher-code-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.code-container .code-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
  display: block;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.code-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.code-text {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  padding: 10px 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  flex: 1;
  text-align: center;
  letter-spacing: 0.5px;
}

.btn-copy {
  padding: 10px 16px;
  background: #374151;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 13px;
  font-weight: 500;
}

.btn-copy:hover {
  background: #1f2937;
}

/* Description */
.voucher-description {
  margin-bottom: 20px;
  color: #64748b;
  font-style: italic;
  text-align: center;
  font-size: 14px;
}

/* Details */
.voucher-details {
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-label {
  color: #64748b;
  font-weight: 500;
}

.detail-value {
  color: #1a1a1a;
  font-weight: 600;
}

/* Actions */
.voucher-actions {
  text-align: center;
}

.btn-use-voucher {
  width: 100%;
  padding: 14px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-use-voucher:hover {
  background: #0056b3;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
}

.empty-state h3 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 20px;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

/* Copy Toast */
.copy-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #059669;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  z-index: 1000;
  animation: slideInUp 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .customer-vouchers {
    padding: 16px;
  }

  .vouchers-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .vouchers-stats {
    flex-direction: column;
    align-items: center;
  }

  .stat-card {
    width: 100%;
    max-width: 200px;
  }

  .discount-value {
    font-size: 28px;
  }

  .code-display {
    flex-direction: column;
    gap: 8px;
  }

  .section-title {
    font-size: 28px;
  }
}
</style>