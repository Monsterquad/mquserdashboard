<!-- SupportTicketsManager.vue -->
<template>
  <div class="support-tickets-manager">
    <h2 class="section-title">Service client</h2>

    <!-- Navigation -->
    <div class="tabs-navigation">
      <button
        :class="['tab-btn', { active: activeTab === 'list' }]"
        @click="activeTab = 'list'"
      >
        Mes tickets ({{ tickets ? tickets.length : 0 }})
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'create' }]"
        @click="activeTab = 'create'"
      >
        Nouveau ticket
      </button>
    </div>

    <!-- Liste des tickets -->
    <div v-if="activeTab === 'list'" class="tab-content">
      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement de vos tickets...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="error-container">
        <h3>Erreur</h3>
        <p>{{ error }}</p>
        <button @click="loadTickets" class="btn-retry">Réessayer</button>
      </div>

      <!-- Tickets -->
      <div v-else>
        <div v-if="groupedTickets && groupedTickets.length > 0" class="tickets-list">
          <div
            v-for="thread in groupedTickets"
            :key="thread.id"
            class="ticket-thread"
          >
            <!-- En-tête du thread -->
            <div class="thread-header" @click="toggleThread(thread.id)">
              <div class="thread-info">
                <h3 class="thread-subject">{{ thread.subject || 'Sans sujet' }}</h3>
                <div class="thread-meta">
                  <span class="thread-id">Ticket #{{ thread.id }}</span>
                  <span v-if="thread.order_reference" class="thread-order">
                    Commande: {{ thread.order_reference }}
                  </span>
                  <span class="thread-date">{{ formatDate(thread.created_date) }}</span>
                </div>
              </div>
              <div class="thread-controls">
                <span :class="['status-badge', thread.status]">
                  {{ getStatusLabel(thread.status) }}
                </span>
                <span class="message-count">{{ thread.messages.length }} message{{ thread.messages.length > 1 ? 's' : '' }}</span>
                <button class="expand-btn">
                  {{ expandedThreads.includes(thread.id) ? '▼' : '▶' }}
                </button>
              </div>
            </div>

            <!-- Messages du thread (collapsible) -->
            <div v-if="expandedThreads.includes(thread.id)" class="thread-messages">
              <div
                v-for="message in thread.messages"
                :key="message.id"
                :class="['message-item', { 'employee-message': message.is_employee }]"
              >
                <div class="message-header">
                  <span class="message-author">
                    {{ message.is_employee ? (message.employee_name || 'Support') : 'Vous' }}
                  </span>
                  <span class="message-date">{{ formatDate(message.date) }}</span>
                </div>
                <div class="message-content">
                  <h4 v-if="message.subject" class="message-subject">{{ message.subject }}</h4>
                  <p class="message-text">{{ message.content }}</p>
                </div>
              </div>

              <!-- Formulaire de réponse -->
              <div v-if="thread.status !== 'closed'" class="reply-form">
                <h4>Ajouter une réponse</h4>
                <textarea
                  v-model="replyMessages[thread.id]"
                  rows="3"
                  placeholder="Votre réponse..."
                  maxlength="1000"
                  class="reply-textarea"
                ></textarea>
                <div class="reply-actions">
                  <button
                    @click="addReply(thread.id)"
                    :disabled="!replyMessages[thread.id] || submittingReply === thread.id"
                    class="btn-reply"
                  >
                    {{ submittingReply === thread.id ? 'Envoi...' : 'Envoyer' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <h3>Aucun ticket trouvé</h3>
          <p>Vous n'avez pas encore de demande de support.</p>
          <button @click="activeTab = 'create'" class="btn-create">
            Créer votre premier ticket
          </button>
        </div>
      </div>
    </div>

    <!-- Création de ticket -->
    <div v-if="activeTab === 'create'" class="tab-content">
      <div class="create-ticket-form">
        <h3>Créer un nouveau ticket</h3>

        <form @submit.prevent="createTicket">
          <div class="form-group">
            <label>Sujet *</label>
            <input
              type="text"
              v-model="newTicket.subject"
              required
              maxlength="100"
              placeholder="Décrivez brièvement votre demande"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label>Commande concernée (optionnel)</label>
            <select v-model="newTicket.order_id" class="form-select">
              <option value="">Aucune commande spécifique</option>
              <option
                v-for="order in orders"
                :key="order.id"
                :value="order.id"
              >
                {{ order.reference }} - {{ order.date_add }} ({{ order.total_paid_value }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Message *</label>
            <textarea
              v-model="newTicket.message"
              required
              rows="6"
              maxlength="1000"
              placeholder="Décrivez votre demande en détail..."
              class="form-textarea"
            ></textarea>
            <span class="char-count">{{ newTicket.message.length }}/1000</span>
          </div>

          <div class="form-actions">
            <button type="submit" :disabled="submittingNew" class="btn-submit">
              {{ submittingNew ? 'Création...' : 'Créer le ticket' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchData } from "../../lib/fetcher";

export default {
  name: "SupportTicketsManager",

  data() {
    return {
      activeTab: 'list',
      tickets: null,
      orders: [],
      loading: false,
      error: null,
      submittingNew: false,
      submittingReply: null,
      expandedThreads: [],
      replyMessages: {},

      // Nouveau ticket
      newTicket: {
        subject: '',
        message: '',
        order_id: ''
      }
    }
  },

  computed: {
    // Grouper les messages par thread
    groupedTickets() {
      if (!this.tickets || !Array.isArray(this.tickets)) return [];

      const threadsMap = new Map();

      // Grouper par id_customer_thread
      this.tickets.forEach(ticket => {
        const threadId = ticket.id_customer_thread;

        if (!threadsMap.has(threadId)) {
          threadsMap.set(threadId, {
            id: threadId,
            subject: null,
            status: ticket.status,
            order_reference: ticket.id_order ? `#${ticket.id_order}` : null,
            created_date: ticket.date_add,
            updated_date: ticket.date_upd,
            messages: []
          });
        }

        const thread = threadsMap.get(threadId);

        // Le premier message contient souvent le sujet
        if (!thread.subject && ticket.message) {
          // Prendre les premiers mots comme sujet si pas de sujet défini
          thread.subject = ticket.message.substring(0, 50) + (ticket.message.length > 50 ? '...' : '');
        }

        thread.messages.push({
          id: ticket.id_customer_message,
          subject: ticket.subject || null,
          content: ticket.message,
          date: ticket.date_add,
          is_employee: ticket.id_employee !== '0',
          employee_name: ticket.employee_name || null
        });
      });

      // Convertir en array et trier par date
      return Array.from(threadsMap.values()).sort((a, b) => {
        return new Date(a.created_date) - new Date(b.created_date);
      });
    }
  },

  async mounted() {
    await this.loadTickets();
    await this.loadOrders();
  },

  methods: {
    // Charger les tickets
    async loadTickets() {
      this.loading = true;
      this.error = null;

      try {
        const data = await fetchData('getCustomerThreads');
        console.log(data)
        this.tickets = data.data || [];
        console.log('Tickets chargés:', this.tickets);
      } catch (error) {
        this.error = error.message;
        console.error('Erreur tickets:', error);
      } finally {
        this.loading = false;
      }
    },

    // Charger les commandes
    async loadOrders() {
      try {
        const data = await fetchData('getOrders');
        console.log(data)
        this.orders = data.data.orders || [];
      } catch (error) {
        console.error('Erreur commandes:', error);
      }
    },

    // Toggle l'expansion d'un thread
    toggleThread(threadId) {
      const index = this.expandedThreads.indexOf(threadId);
      if (index > -1) {
        this.expandedThreads.splice(index, 1);
      } else {
        this.expandedThreads.push(threadId);
      }
    },

    // Ajouter une réponse
    async addReply(threadId) {
      const message = this.replyMessages[threadId];
      if (!message || !message.trim()) {
        this.$emit('show-alert', 'Veuillez saisir votre réponse', 'danger');
        return;
      }

      this.submittingReply = threadId;

      try {
        await fetchData('addMessageToThread', {
          thread_id: threadId,
          message: message.trim()
        });

        this.$emit('show-alert', 'Votre réponse a été envoyée', 'success');

        // Reset du message
        this.$set(this.replyMessages, threadId, '');

        // Recharger les tickets
        await this.loadTickets();

      } catch (error) {
        this.$emit('show-alert', 'Erreur: ' + error.message, 'danger');
      } finally {
        this.submittingReply = null;
      }
    },

    // Créer un nouveau ticket
    async createTicket() {
      if (!this.newTicket.subject.trim() || !this.newTicket.message.trim()) {
        this.$emit('show-alert', 'Veuillez remplir tous les champs obligatoires', 'danger');
        return;
      }

      this.submittingNew = true;

      try {
        await fetchData('createNewThread', {
          subject: this.newTicket.subject.trim(),
          message: this.newTicket.message.trim(),
          order_id: this.newTicket.order_id || 0
        });

        this.$emit('show-alert', 'Votre ticket a été créé avec succès', 'success');

        // Reset form
        this.newTicket = {
          subject: '',
          message: '',
          order_id: ''
        };

        // Retour à la liste et rechargement
        this.activeTab = 'list';
        await this.loadTickets();

      } catch (error) {
        this.$emit('show-alert', 'Erreur: ' + error.message, 'danger');
      } finally {
        this.submittingNew = false;
      }
    },

    // Utilitaires
    getStatusLabel(status) {
      const labels = {
        'open': 'Ouvert',
        'closed': 'Fermé',
        'pending1': 'En attente',
        'pending2': 'En cours'
      };
      return labels[status] || status;
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}
</script>

<style scoped>
.support-tickets-manager {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 24px;
  text-align: center;
}

/* Tabs */
.tabs-navigation {
  display: flex;
  margin-bottom: 32px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.tab-btn.active {
  background: white;
  color: #007bff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Loading & Error */
.loading-container {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
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
}

/* Tickets List */
.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ticket-thread {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.thread-header {
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.thread-header:hover {
  background: #f8fafc;
}

.thread-info {
  flex: 1;
}

.thread-subject {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.thread-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 14px;
  color: #64748b;
}

.thread-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.open {
  background: #dcfce7;
  color: #166534;
}

.status-badge.closed {
  background: #f3f4f6;
  color: #374151;
}

.status-badge.pending1,
.status-badge.pending2 {
  background: #fef3c7;
  color: #92400e;
}

.message-count {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.expand-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
}

/* Messages */
.thread-messages {
  border-top: 1px solid #e2e8f0;
  padding: 16px 20px;
  background: #f8fafc;
}

.message-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.message-item.employee-message {
  background: #eff6ff;
  border-color: #dbeafe;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-author {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
}

.message-date {
  font-size: 12px;
  color: #64748b;
}

.message-subject {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.message-text {
  color: #374151;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

/* Reply Form */
.reply-form {
  margin-top: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.reply-form h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #1a1a1a;
}

.reply-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}

.reply-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.reply-actions {
  margin-top: 12px;
  text-align: right;
}

.btn-reply {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
}

.btn-reply:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Create Form */
.create-ticket-form {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
}

.create-ticket-form h3 {
  margin: 0 0 24px 0;
  font-size: 20px;
  color: #1a1a1a;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-textarea {
  resize: vertical;
}

.char-count {
  font-size: 12px;
  color: #64748b;
  text-align: right;
  margin-top: 4px;
}

.form-actions {
  text-align: right;
}

.btn-submit {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit:disabled {
  background: #6c757d;
  cursor: not-allowed;
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
}

.empty-state p {
  margin: 0 0 24px 0;
  font-size: 16px;
}

.btn-create {
  padding: 12px 24px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .support-tickets-manager {
    padding: 16px;
  }

  .thread-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .thread-controls {
    justify-content: space-between;
  }

  .thread-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>