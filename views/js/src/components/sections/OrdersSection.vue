<!-- OrdersSection.vue -->
<template>
  <div class="orders-section">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Chargement de vos commandes...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <h3>❌ Erreur</h3>
      <p>{{ error }}</p>
      <button @click="loadOrders" class="btn-retry">Réessayer</button>
    </div>

    <!-- Orders content -->
    <div v-else>
      <h2 class="section-title">Mes commandes</h2>

      <!-- Filtres -->
      <div class="orders-filters" v-if="ordersData && ordersData.orders.length > 0">
        <div class="filter-group">
          <label>Commandes par page :</label>
          <select v-model="itemsPerPage" @change="changePageSize" class="filter-select">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <span>Nombre total de commandes : {{ordersData.pagination.total}}</span>
      </div>

      <!-- Liste des commandes -->
      <div v-if="ordersData && ordersData.orders.length > 0" class="orders-container">
        <div class="orders-list">
          <div
            v-for="order in ordersData.orders"
            :key="order.id"
            class="order-card"
          >
            <div class="order-header">
              <div class="order-main-info">
                <h3 class="order-number">Commande #{{ order.reference }}</h3>
                <p class="order-date">{{ formatDate(order.date_add) }}</p>
              </div>
              <div class="order-status">
                <span
                  :class="['status-badge']"
                  :style="{ backgroundColor: order.status?.color || '#6c757d' }"
                >
                  {{ order.status?.name || 'En cours' }}
                </span>
              </div>
            </div>

            <div class="order-details">
              <div class="detail-row">
                <span class="detail-label">Mode de paiement :</span>
                <span class="detail-value">{{ order.payment || 'Non spécifié' }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Nb de Produits :</span>
                <span class="detail-value">{{ order.nb_products || 'Non spécifié' }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Total :</span>
                <span class="detail-euro">{{order.total_paid_value || 'Non spécifié'}}</span>
                <span class="detail-value order-total">
                  {{ order.total_paid ? order.total_paid + '€' : 'Gratuit' }}
                </span>
              </div>

              <div class="detail-row" v-if="order.carrier_name">
                <span class="detail-label">Transporteur :</span>
                <span class="detail-value">{{ order.carrier_name || order.carrier?.name || 'Non spécifié' }}</span>
              </div>

              <div class="detail-row" v-if="order.tracking_number">
                <span class="detail-label">Suivi :</span>
                <span class="detail-value">
                  <a :href="order.tracking_url" target="_blank" class="tracking-link">
                    {{ order.tracking_number }}
                  </a>
                </span>
              </div>
            </div>

            <div class="order-actions">
              <button @click="viewOrderDetails(order.id)" class="btn-details">
                Voir détails
              </button>

              <button @click="downloadInvoice(order.id)" class="btn-invoice">
                Télécharger facture
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="ordersData.pagination && ordersData.pagination.pages > 1" class="pagination-container">
          <div class="pagination-info">
            Affichage de {{ getStartItem() }} à {{ getEndItem() }} sur {{ ordersData.pagination.total }} commandes
          </div>

          <nav class="pagination">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage <= 1"
              class="pagination-btn"
            >
              ‹ Précédent
            </button>

            <button
              v-for="page in getVisiblePages()"
              :key="page"
              @click="goToPage(page)"
              :class="['pagination-btn', { active: currentPage === page }]"
            >
              {{ page }}
            </button>

            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage >= ordersData.pagination.pages"
              class="pagination-btn"
            >
              Suivant ›
            </button>
          </nav>
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>Aucune commande trouvée</h3>
        <p>{{ statusFilter ? 'Aucune commande ne correspond à ce filtre.' : 'Vous n\'avez pas encore passé de commande.' }}</p>

        <button v-if="statusFilter" @click="clearFilters" class="btn-clear-filters">
          Effacer les filtres
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchData } from "../../lib/fetcher";

export default {
  name: "OrdersSection",

  data() {
    return {
      ordersData: null,
      loading: false,
      error: null,
      currentPage: 1,
      itemsPerPage: 10,
      statusFilter: ''
    }
  },

  async mounted() {
    await this.loadOrders()
  },

  methods: {
    async loadOrders() {
      this.loading = true
      this.error = null

      try {
        const params = {
          page: this.currentPage,
          limit: this.itemsPerPage
        }

        if (this.statusFilter) {
          params.status = this.statusFilter
        }

        const data = await fetchData("getOrders", params)
        this.ordersData = data.data
        console.log('✅ Commandes chargées:', this.ordersData)
      } catch (error) {
        this.error = error.message
        console.error('❌ Erreur chargement commandes:', error)
      } finally {
        this.loading = false
      }
    },

    async goToPage(page) {
      if (page >= 1 && page <= this.ordersData.pagination.pages) {
        this.currentPage = page
        await this.loadOrders()
      }
    },

    async changePageSize() {
      this.currentPage = 1
      await this.loadOrders()
    },

    async clearFilters() {
      this.statusFilter = ''
      this.currentPage = 1
      await this.loadOrders()
    },

    // Utilitaires de pagination
    getVisiblePages() {
      const totalPages = this.ordersData.pagination.pages
      const current = this.currentPage
      const pages = []

      // Afficher jusqu'à 5 pages autour de la page courante
      const start = Math.max(1, current - 2)
      const end = Math.min(totalPages, current + 2)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    },

    getStartItem() {
      return ((this.currentPage - 1) * this.itemsPerPage) + 1
    },

    getEndItem() {
      const end = this.currentPage * this.itemsPerPage
      return Math.min(end, this.ordersData.pagination.total)
    },

    // Formatage et statuts
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getStatusClass(status) {
      // Cette méthode n'est plus utilisée car on utilise directement la couleur du statut
      return 'pending'
    },

    canReorder(status) {
      // Méthode conservée pour compatibilité future
      return ['5', '6'].includes(status)
    },

    canDownloadInvoice(status) {
      // Méthode conservée pour compatibilité future
      return ['2', '3', '4', '5'].includes(status)
    },

    // Actions
    viewOrderDetails(orderId) {
      console.log("view order appelé")
      if (window.prestashopData?.baseUrl) {
        window.location.href = window.prestashopData.baseUrl + 'index.php?controller=order-detail&id_order=' + orderId
      } else {
        // Fallback si baseUrl n'est pas disponible
        window.location.href = '/index.php?controller=order-detail&id_order=' + orderId
      }
    },

    downloadInvoice(orderId) {
      console.log("download appelé")
      if (window.prestashopData?.baseUrl) {
        window.location.href = window.prestashopData.baseUrl + 'index.php?controller=pdf-invoice&id_order=' + orderId
      } else {
        // Fallback si baseUrl n'est pas disponible
        window.location.href = '/index.php?controller=pdf-invoice&id_order=' + orderId
      }
    }
  }
}
</script>

<style scoped>
.orders-section {
  width: 100%;
}

.section-title {
  font-size: 24px;
  font-weight: 500;
  color: #212529;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

/* Loading */
.loading-container {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3B82F6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error */
.error-container {
  text-align: center;
  padding: 40px 20px;
  background: #f8d7da;
  border-radius: 8px;
  color: #721c24;
}

.btn-retry {
  margin-top: 15px;
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Filtres */
.orders-filters {
  display: flex;
  gap: 20px;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: row;
  gap: 8px;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
  align-items: center;
}

.filter-group label {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  min-width: 150px;
}

/* Liste des commandes */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.order-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.order-number {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 5px 0;
}

.order-date {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  gap: 10px;
}

.detail-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #212529;
  font-weight: bold;
  text-align: right;
}

.order-total {
  font-weight: 600;
  font-size: 16px;
  color: #28a745;
}

.tracking-link {
  color: #3B82F6;
  text-decoration: none;
}

.tracking-link:hover {
  text-decoration: underline;
}

.order-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-details,
.btn-invoice {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-details {
  background: #3B82F6;
  color: white;
}

.btn-details:hover {
  background: #2563EB;
}

.btn-invoice {
  background: #28a745;
  color: white;
}

.btn-invoice:hover {
  background: #218838;
}

/* Pagination */
.pagination-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
}

.pagination {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.pagination-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.pagination-btn.active {
  background: #3B82F6;
  color: white;
  border-color: #3B82F6;
}

.pagination-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  border-color: #dee2e6;
}

/* État vide */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #495057;
}

.empty-state p {
  margin: 0 0 20px 0;
  font-size: 16px;
}

.btn-clear-filters {
  padding: 10px 20px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-clear-filters:hover {
  background: #2563EB;
}

/* Responsive */
@media (max-width: 768px) {
  .orders-filters {
    flex-direction: column;
    gap: 15px;
  }

  .order-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .detail-value {
    text-align: left;
  }

  .order-actions {
    flex-direction: column;
  }

  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination-container {
    gap: 15px;
  }
}
</style>