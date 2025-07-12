<!-- ReviewsSection.vue -->
<template>
  <div class="reviews-section">
    <h2 class="section-title">Mes avis</h2>

    <!-- Navigation entre les deux sections -->
    <div class="tabs-navigation">
      <button
        :class="['tab-btn', { active: activeTab === 'my-reviews' }]"
        @click="activeTab = 'my-reviews'"
      >
        Mes avis déposés
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'write-review' }]"
        @click="activeTab = 'write-review'"
      >
        Déposer un avis
      </button>
    </div>

    <!-- Section 1: Mes avis déposés -->
    <div v-if="activeTab === 'my-reviews'" class="tab-content">
      <!-- Loading state -->
      <div v-if="loadingData" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement de vos avis...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="dataError" class="error-container">
        <h3>❌ Erreur</h3>
        <p>{{ dataError }}</p>
        <button @click="loadData" class="btn-retry">Réessayer</button>
      </div>

      <!-- Reviews List -->
      <div v-else>
        <div v-if="myReviews && myReviews.length > 0" class="reviews-list">
          <div
            v-for="review in myReviews"
            :key="review.id"
            class="review-card"
          >
            <div class="review-header">
              <div class="review-info">
                <h3 class="review-title">{{ review.title }}</h3>
                <p class="review-product">{{ review.product_name }}</p>
                <div class="review-rating">
                  <span
                    v-for="star in 5"
                    :key="star"
                    :class="['star', { filled: star <= review.stars }]"
                  >
                    ⭐
                  </span>
                  <span class="rating-text">{{ review.stars }}/5</span>
                </div>
              </div>
              <div class="review-meta">
                <span class="review-date">{{ formatDate(review.date) }}</span>
                <span :class="['review-status', review.active ? 'published' : 'pending']">
                  {{ review.active ? '✅ Publié' : '⏳ En attente' }}
                </span>
              </div>
            </div>

            <div class="review-content">
              <p>{{ review.comment }}</p>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <h3>Aucun avis déposé</h3>
          <p>Vous n'avez pas encore laissé d'avis sur vos achats.</p>
          <button @click="activeTab = 'write-review'" class="btn-write-review">
            ✍️ Déposer votre premier avis
          </button>
        </div>
      </div>
    </div>

    <!-- Section 2: Déposer un avis -->
    <div v-if="activeTab === 'write-review'" class="tab-content">
      <!-- Loading state -->
      <div v-if="loadingData" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement de vos commandes...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="dataError" class="error-container">
        <h3>❌ Erreur</h3>
        <p>{{ dataError }}</p>
        <button @click="loadData" class="btn-retry">Réessayer</button>
      </div>

      <!-- Orders List -->
      <div v-else>
        <p class="section-description">
          Sélectionnez une commande pour déposer un avis sur les produits achetés :
        </p>

        <div v-if="recentOrders && recentOrders.length > 0" class="orders-list">
          <div
            v-for="order in recentOrders"
            :key="order.id_order"
            class="order-card"
          >
            <div class="order-header">
              <div class="order-info">
                <h3 class="order-number">Commande #{{ order.reference }}</h3>
                <p class="order-date">{{ formatDate(order.date_add) }}</p>
              </div>
              <span class="order-status">{{ order.order_state?.name || 'En cours' }}</span>
            </div>

            <div class="products-grid">
              <div
                v-for="product in order.products"
                :key="product.product_id"
                class="product-card"
              >
                <div class="product-image">
                  <img
                    v-if="product.image_url"
                    :src="product.image_url"
                    :alt="product.product_name"
                    @error="$event.target.style.display='none'"
                  >
                  <div v-else class="no-image">📦</div>
                </div>

                <div class="product-info">
                  <h4 class="product-name">{{ product.product_name }}</h4>
                  <p class="product-reference">Réf: {{ product.product_reference }}</p>
                  <p class="product-quantity">Quantité: {{ product.product_quantity }}</p>
                </div>

                <div class="product-actions">
                  <button
                    @click="openReviewForm(product, order)"
                    class="btn-review"
                  >
                    Donner mon avis
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>Aucune commande récente</h3>
          <p>Vous n'avez pas de commandes récentes pour lesquelles déposer un avis.</p>
        </div>
      </div>
    </div>

    <!-- Modal de création d'avis -->
    <div v-if="showReviewModal" class="modal-overlay" @click="closeReviewModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Donner votre avis</h3>
          <button @click="closeReviewModal" class="btn-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="product-review-info">
            <h4>{{ selectedProduct?.product_name }}</h4>
            <p>Commande #{{ selectedOrder?.reference }}</p>
          </div>

          <form @submit.prevent="submitReview" class="review-form">
            <div class="form-group">
              <label>Note *</label>
              <div class="rating-input">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  :class="['star-btn', { active: star <= reviewForm.stars }]"
                  @click="reviewForm.stars = star"
                >
                  ⭐
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Titre de votre avis *</label>
              <input
                type="text"
                v-model="reviewForm.title"
                class="form-input"
                placeholder="Résumez votre avis en quelques mots"
                required
                maxlength="64"
              >
            </div>

            <div class="form-group">
              <label>Votre commentaire *</label>
              <textarea
                v-model="reviewForm.comment"
                class="form-textarea"
                placeholder="Décrivez votre expérience avec ce produit..."
                required
                rows="5"
                maxlength="500"
              ></textarea>
              <span class="char-count">{{ reviewForm.comment.length }}/500</span>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeReviewModal" class="btn-cancel">
                Annuler
              </button>
              <button type="submit" class="btn-submit" :disabled="submittingReview">
                {{ submittingReview ? 'Envoi...' : 'Publier mon avis' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchData } from "../../lib/fetcher";

export default {
  name: "ReviewsSection",

  data() {
    return {
      activeTab: 'my-reviews',

      // Données unifiées
      myReviews: null,
      recentOrders: null,
      loadingData: false,
      dataError: null,

      // Modal d'avis
      showReviewModal: false,
      selectedProduct: null,
      selectedOrder: null,
      submittingReview: false,

      reviewForm: {
        stars: 0,
        title: '',
        comment: ''
      }
    }
  },

  async mounted() {
    await this.loadData()
  },

  methods: {
    // Charger toutes les données (avis + commandes)
    async loadData() {
      this.loadingData = true
      this.dataError = null

      try {
        const data = await fetchData('getCustomerReviews')

        // Récupérer les avis
        this.myReviews = data.data.reviews || []

        // Récupérer les commandes récentes depuis orders_data
        this.recentOrders = data.data.orders_data || []

        console.log('✅ Avis chargés:', this.myReviews)
        console.log('✅ Commandes récentes chargées:', this.recentOrders)
      } catch (error) {
        this.dataError = error.message
        console.error('❌ Erreur chargement données:', error)
      } finally {
        this.loadingData = false
      }
    },

    // Ouvrir le formulaire d'avis
    openReviewForm(product, order) {
      this.selectedProduct = product
      this.selectedOrder = order
      this.reviewForm = {
        stars: 0,
        title: '',
        comment: ''
      }
      this.showReviewModal = true
    },

    // Fermer le modal
    closeReviewModal() {
      this.showReviewModal = false
      this.selectedProduct = null
      this.selectedOrder = null
    },

    // Soumettre l'avis
    async submitReview() {
      if (!this.reviewForm.stars || !this.reviewForm.title.trim() || !this.reviewForm.comment.trim()) {
        this.$emit('show-alert', 'Veuillez remplir tous les champs obligatoires', 'danger')
        return
      }

      this.submittingReview = true

      try {
        await fetchData('addCustomerReview', {
          id_product: this.selectedProduct.product_id,
          title: this.reviewForm.title.trim(),
          comment: this.reviewForm.comment.trim(),
          stars: this.reviewForm.stars
        })

        this.$emit('show-alert', 'Votre avis a été enregistré et sera publié après modération', 'success')
        this.closeReviewModal()

        // Recharger toutes les données
        await this.loadData()

      } catch (error) {
        this.$emit('show-alert', 'Erreur lors de l\'envoi de l\'avis: ' + error.message, 'danger')
      } finally {
        this.submittingReview = false
      }
    },

    // Formatage de date
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.reviews-section {
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

/* Tabs Navigation */
.tabs-navigation {
  display: flex;
  margin-bottom: 30px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6c757d;
}

.tab-btn.active {
  background: white;
  color: #3B82F6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tab-btn:hover:not(.active) {
  color: #495057;
  background: rgba(255,255,255,0.5);
}

/* Loading & Error */
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

/* Section Description */
.section-description {
  margin-bottom: 25px;
  color: #6c757d;
  font-size: 16px;
}

/* Reviews List */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
}

.review-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.review-title {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 5px 0;
}

.review-product {
  color: #6c757d;
  font-size: 14px;
  margin: 0 0 10px 0;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

.star {
  font-size: 16px;
}

.star.filled {
  opacity: 1;
}

.star:not(.filled) {
  opacity: 0.3;
}

.rating-text {
  font-size: 14px;
  color: #6c757d;
  margin-left: 5px;
}

.review-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.review-date {
  font-size: 14px;
  color: #6c757d;
}

.review-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.review-status.published {
  background: #d4edda;
  color: #155724;
}

.review-status.pending {
  background: #fff3cd;
  color: #856404;
}

.review-content {
  color: #495057;
  line-height: 1.6;
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.order-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  color: #6c757d;
  font-size: 14px;
  margin: 0;
}

.order-status {
  padding: 6px 12px;
  background: #e9ecef;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.product-card {
  display: flex;
  gap: 15px;
  padding: 15px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.product-image {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  font-size: 24px;
  opacity: 0.5;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #212529;
  margin: 0 0 5px 0;
  line-height: 1.3;
}

.product-reference,
.product-quantity {
  font-size: 12px;
  color: #6c757d;
  margin: 2px 0;
}

.product-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.btn-review {
  padding: 8px 12px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-review:hover {
  background: #2563EB;
}

/* Empty State */
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

.btn-write-review {
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-write-review:hover {
  background: #218838;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  width: 100%;
}

.modal-header h3 {
  margin: 0;
  color: #212529;
  flex: 1;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-close:hover {
  background: #f8f9fa;
  color: #495057;
}

.modal-body {
  padding: 24px;
}

.product-review-info {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.product-review-info h4 {
  margin: 0 0 5px 0;
  color: #212529;
}

.product-review-info p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.review-form .form-group {
  margin-bottom: 20px;
}

.review-form label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
}

.rating-input {
  display: flex;
  gap: 5px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.3;
  transition: all 0.2s ease;
}

.star-btn.active,
.star-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.char-count {
  font-size: 12px;
  color: #6c757d;
  text-align: right;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.btn-cancel {
  padding: 12px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-submit {
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-submit:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .tabs-navigation {
    flex-direction: column;
  }

  .review-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .review-meta {
    align-items: flex-start;
  }

  .order-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-card {
    flex-direction: column;
    text-align: center;
  }

  .modal-content {
    width: 95%;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>