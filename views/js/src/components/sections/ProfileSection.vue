<!-- ProfileSection.vue -->
<template>
  <div class="profile-section">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Chargement de votre profil...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <h3>❌ Erreur</h3>
      <p>{{ error }}</p>
      <button @click="loadCustomerData" class="btn-retry">Réessayer</button>
    </div>

    <!-- Profile content -->
    <div v-else-if="customerData" class="profile-content">
      <!-- Edit mode -->
      <div v-if="isEditingProfile" class="edit-mode">
        <h2 class="section-title">Modifier mon profil</h2>

        <form @submit.prevent="saveProfile" class="edit-form">
          <div class="form-grid">
            <!-- Informations personnelles -->
            <div class="form-card">
              <h3 class="card-title">Informations personnelles</h3>

              <div class="form-group">
                <label>Civilité *</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="editData.gender" value="M" required>
                    M.
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="editData.gender" value="F" required>
                    Mme
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  v-model="editData.firstname"
                  class="form-input"
                  required
                >
              </div>

              <div class="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  v-model="editData.lastname"
                  class="form-input"
                  required
                >
              </div>

              <div class="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  v-model="editData.email"
                  class="form-input"
                  required
                >
              </div>

              <div class="form-group">
                <label>Date de naissance</label>
                <input
                  type="date"
                  v-model="editData.birthday"
                  class="form-input"
                >
              </div>
            </div>

            <!-- Préférences -->
            <div class="form-card">
              <h3 class="card-title">Préférences</h3>

              <div class="form-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="editData.newsletter"
                  >
                  <span>Je souhaite recevoir la newsletter</span>
                </label>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="editData.optin"
                  >
                  <span>Je souhaite recevoir les offres de nos partenaires</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="btn-cancel"
              @click="cancelEdit"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="btn-save"
              :disabled="saving"
            >
              {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
            </button>
          </div>
        </form>
      </div>

      <!-- View mode -->
      <div v-else class="view-mode">
        <h2 class="section-title">Mon profil</h2>

        <div class="profile-grid">
          <!-- Informations personnelles -->
          <div class="profile-card">
            <h3 class="card-title">Informations personnelles</h3>
            <div class="info-list">
              <div class="info-row">
                <span class="info-label">Nom complet</span>
                <span class="info-value">{{ customerData.firstname }} {{ customerData.lastname }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">{{ customerData.email }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Civilité</span>
                <span class="info-value">{{ customerData.gender === 'M' ? 'Monsieur' : 'Madame' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date de naissance</span>
                <span class="info-value">{{ formatBirthday(customerData.birthday) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Client depuis</span>
                <span class="info-value">{{ formatDate(customerData.date_add) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Dernière connexion</span>
                <span class="info-value">{{ customerData.last_connection || 'Jamais' }}</span>
              </div>
            </div>
            <button @click="startEdit" class="btn-edit">
              ✏️ Modifier mes informations
            </button>
          </div>

          <!-- Préférences -->
          <div class="profile-card">
            <h3 class="card-title">Préférences</h3>
            <div class="preferences-list">
              <div class="preference-item">
                <span class="preference-label">Newsletter</span>
                <span :class="['preference-status', customerData.newsletter ? 'active' : 'inactive']">
                  {{ customerData.newsletter ? '✅ Activée' : '❌ Désactivée' }}
                </span>
              </div>
              <div class="preference-item">
                <span class="preference-label">Offres partenaires</span>
                <span :class="['preference-status', customerData.optin ? 'active' : 'inactive']">
                  {{ customerData.optin ? '✅ Activées' : '❌ Désactivées' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Statistiques -->
          <div class="profile-card">
            <h3 class="card-title">Statistiques</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{{ customerData.loyalty_points }}</span>
                <span class="stat-label">Points fidélité</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ customerData.wishlist_count }}</span>
                <span class="stat-label">Articles en favoris</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ customerData.groups[0]?.name || 'Aucun' }}</span>
                <span class="stat-label">Groupe client</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ customerData.addresses.length }}</span>
                <span class="stat-label">Adresses</span>
              </div>
            </div>
          </div>

          <!-- Adresses -->
          <div class="profile-card addresses-card">
            <div class="address-header-section">
              <h3 class="card-title">Mes adresses</h3>
              <button @click="startAddAddress" class="btn-add-address">
                ➕ Ajouter une adresse
              </button>
            </div>

            <!-- Formulaire d'ajout d'adresse -->
            <div v-if="isAddingAddress" class="address-form-container">
              <h4>Nouvelle adresse</h4>
              <form @submit.prevent="saveNewAddress" class="address-form">
                <div class="address-form-grid">
                  <div class="form-group">
                    <label>Alias *</label>
                    <input
                      type="text"
                      v-model="addressData.alias"
                      class="form-input"
                      placeholder="ex: Maison, Bureau..."
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>Prénom *</label>
                    <input
                      type="text"
                      v-model="addressData.firstname"
                      class="form-input"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>Nom *</label>
                    <input
                      type="text"
                      v-model="addressData.lastname"
                      class="form-input"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>Entreprise</label>
                    <input
                      type="text"
                      v-model="addressData.company"
                      class="form-input"
                    >
                  </div>

                  <div class="form-group">
                    <label>Adresse *</label>
                    <input
                      type="text"
                      v-model="addressData.address1"
                      class="form-input"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>Complément d'adresse</label>
                    <input
                      type="text"
                      v-model="addressData.address2"
                      class="form-input"
                    >
                  </div>

                  <div class="form-group">
                    <label>Code postal *</label>
                    <input
                      type="text"
                      v-model="addressData.postcode"
                      class="form-input"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>Ville *</label>
                    <input
                      type="text"
                      v-model="addressData.city"
                      class="form-input"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>Pays *</label>
                    <select v-model="addressData.country" class="form-input" required>
                      <option value="">Sélectionner un pays</option>
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Canada">Canada</option>
                      <option value="Australie">Australie</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Téléphone</label>
                    <input
                      type="tel"
                      v-model="addressData.phone"
                      class="form-input"
                    >
                  </div>

                  <div class="form-group">
                    <label>Téléphone mobile</label>
                    <input
                      type="tel"
                      v-model="addressData.phone_mobile"
                      class="form-input"
                    >
                  </div>

                  <!--<div class="form-group form-group-checkbox">
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        v-model="addressData.is_default"
                      >
                      <span>Définir comme adresse par défaut</span>
                    </label>
                  </div>!-->
                </div>

                <div class="form-actions">
                  <button type="button" @click="cancelAddAddress" class="btn-cancel">
                    Annuler
                  </button>
                  <button type="submit" class="btn-save" :disabled="saving">
                    {{ saving ? 'Sauvegarde...' : 'Ajouter l\'adresse' }}
                  </button>
                </div>
              </form>
            </div>

            <div v-if="customerData.addresses.length > 0" class="addresses-list">
              <div
                v-for="address in customerData.addresses"
                :key="address.id"
                class="address-item"
                :class="{ 'default-address': address.is_default }"
              >
                <!-- Mode édition d'adresse -->
                <div v-if="isEditingAddress && editingAddressId === address.id" class="address-edit-form">
                  <h4>Modifier l'adresse</h4>
                  <form @submit.prevent="saveAddressEdit" class="address-form">
                    <div class="address-form-grid">
                      <div class="form-group">
                        <label>Alias *</label>
                        <input
                          type="text"
                          v-model="addressData.alias"
                          class="form-input"
                          required
                        >
                      </div>

                      <div class="form-group">
                        <label>Prénom *</label>
                        <input
                          type="text"
                          v-model="addressData.firstname"
                          class="form-input"
                          required
                        >
                      </div>

                      <div class="form-group">
                        <label>Nom *</label>
                        <input
                          type="text"
                          v-model="addressData.lastname"
                          class="form-input"
                          required
                        >
                      </div>

                      <div class="form-group">
                        <label>Entreprise</label>
                        <input
                          type="text"
                          v-model="addressData.company"
                          class="form-input"
                        >
                      </div>

                      <div class="form-group">
                        <label>Adresse *</label>
                        <input
                          type="text"
                          v-model="addressData.address1"
                          class="form-input"
                          required
                        >
                      </div>

                      <div class="form-group">
                        <label>Complément d'adresse</label>
                        <input
                          type="text"
                          v-model="addressData.address2"
                          class="form-input"
                        >
                      </div>

                      <div class="form-group">
                        <label>Code postal *</label>
                        <input
                          type="text"
                          v-model="addressData.postcode"
                          class="form-input"
                          required
                        >
                      </div>

                      <div class="form-group">
                        <label>Ville *</label>
                        <input
                          type="text"
                          v-model="addressData.city"
                          class="form-input"
                          required
                        >
                      </div>

                      <div class="form-group">
                        <label>Pays *</label>
                        <select v-model="addressData.country" class="form-input" required>
                          <option value="">Sélectionner un pays</option>
                          <option value="France">France</option>
                          <option value="Belgique">Belgique</option>
                          <option value="Suisse">Suisse</option>
                          <option value="Canada">Canada</option>
                          <option value="Australie">Australie</option>
                        </select>
                      </div>

                      <div class="form-group">
                        <label>Téléphone</label>
                        <input
                          type="tel"
                          v-model="addressData.phone"
                          class="form-input"
                        >
                      </div>

                      <div class="form-group">
                        <label>Téléphone mobile</label>
                        <input
                          type="tel"
                          v-model="addressData.phone_mobile"
                          class="form-input"
                        >
                      </div>

                      <!--<div class="form-group form-group-checkbox">
                        <label class="checkbox-label">
                          <input
                            type="checkbox"
                            v-model="addressData.is_default"
                          >
                          <span>Définir comme adresse par défaut</span>
                        </label>
                      </div>!-->
                    </div>

                    <div class="form-actions">
                      <button type="button" @click="cancelAddressEdit" class="btn-cancel">
                        Annuler
                      </button>
                      <button type="submit" class="btn-save" :disabled="saving">
                        {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
                      </button>
                    </div>
                  </form>
                </div>

                <!-- Mode affichage d'adresse -->
                <div v-else>
                  <div class="address-header">
                    <span class="address-alias">{{ address.alias }}</span>
                    <div class="address-badges">
                      <span v-if="address.is_default" class="default-badge">Par défaut</span>
                    </div>
                  </div>
                  <div class="address-content">
                    <p><strong>{{ address.firstname }} {{ address.lastname }}</strong></p>
                    <p v-if="address.company">{{ address.company }}</p>
                    <p>{{ address.address1 }}</p>
                    <p v-if="address.address2">{{ address.address2 }}</p>
                    <p>{{ address.postcode }} {{ address.city }}</p>
                    <p>{{ address.country }}</p>
                    <p v-if="address.phone_mobile">📱 {{ address.phone_mobile }}</p>
                    <p v-if="address.phone">☎️ {{ address.phone }}</p>
                  </div>
                  <div class="address-actions">
                    <button
                      @click="setDefaultAddress(address.id)"
                      class="btn-default"
                      :disabled="address.is_default"
                      v-if="!address.is_default"
                    >
                      ⭐ Par défaut
                    </button>
                    <button @click="startEditAddress(address)" class="btn-edit-address">
                      ✏️ Modifier
                    </button>
                    <button
                      @click="deleteAddress(address.id)"
                      class="btn-delete"
                      :disabled="address.is_default"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-addresses">
              <p>Aucune adresse enregistrée</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchData } from "../../lib/fetcher";

export default {
  name: 'ProfileSection',

  data() {
    return {
      customerData: null,
      loading: false,
      error: null,
      isEditingProfile: false,
      saving: false,
      editData: {},
      // ✅ Gestion des adresses
      isEditingAddress: false,
      isAddingAddress: false,
      editingAddressId: null,
      addressData: {}
    }
  },

  async mounted() {
    await this.loadCustomerData()
  },

  methods: {
    async loadCustomerData() {
      this.loading = true
      this.error = null

      try {
        const data = await fetchData('getCustomerInfo')
        this.customerData = data.data
        console.log('✅ Données client chargées:', this.customerData)
      } catch (error) {
        this.error = error.message
        console.error('❌ Erreur chargement client:', error)
      } finally {
        this.loading = false
      }
    },

    startEdit() {
      this.editData = {
        firstname: this.customerData.firstname,
        lastname: this.customerData.lastname,
        email: this.customerData.email,
        gender: this.customerData.gender,
        birthday: this.formatBirthdayForInput(this.customerData.birthday),
        newsletter: this.customerData.newsletter,
        optin: this.customerData.optin
      }
      this.isEditingProfile = true
    },

    cancelEdit() {
      this.isEditingProfile = false
      this.editData = {}
    },

    async saveProfile() {
      this.saving = true

      try {
        const updatedData = await fetchData('updateCustomerInfo', this.editData)
        this.customerData = { ...this.customerData, ...updatedData }
        this.isEditingProfile = false
        this.$emit('show-alert', 'Profil mis à jour avec succès !', 'success')
      } catch (error) {
        this.$emit('show-alert', 'Erreur lors de la sauvegarde : ' + error.message, 'danger')
      } finally {
        this.saving = false
      }
    },

    formatDate(dateString) {
      if (!dateString || dateString === '0000-00-00 00:00:00') return 'Non disponible'
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR')
    },

    formatBirthday(birthday) {
      if (!birthday || birthday === '0000-00-00') return 'Non renseignée'
      const date = new Date(birthday)
      return date.toLocaleDateString('fr-FR')
    },

    formatBirthdayForInput(birthday) {
      if (!birthday || birthday === '0000-00-00') return ''
      return birthday
    },

    startAddAddress() {
      this.addressData = {
        alias: '',
        firstname: this.customerData.firstname,
        lastname: this.customerData.lastname,
        company: '',
        address1: '',
        address2: '',
        postcode: '',
        city: '',
        country: '',
        phone: '',
        phone_mobile: '',
        is_default: false
      }
      this.isAddingAddress = true
    },

    cancelAddAddress() {
      this.isAddingAddress = false
      this.addressData = {}
    },

    async saveNewAddress() {
      this.saving = true

      try {
        const newAddress = await fetchData('addCustomerAddress', this.addressData)

        // Ajouter la nouvelle adresse à la liste
        this.customerData.addresses.push(newAddress.data)

        this.isAddingAddress = false
        this.addressData = {}
        this.$emit('show-alert', 'Adresse ajoutée avec succès !', 'success')
      } catch (error) {
        this.$emit('show-alert', 'Erreur lors de l\'ajout : ' + error.message, 'danger')
      } finally {
        this.saving = false
      }
    },

    startEditAddress(address) {
      this.addressData = { ...address }
      this.editingAddressId = address.id
      this.isEditingAddress = true
    },

    cancelAddressEdit() {
      this.isEditingAddress = false
      this.editingAddressId = null
      this.addressData = {}
    },

    async saveAddressEdit() {
      this.saving = true

      try {
        const updatedAddress = await fetchData('updateCustomerAddress', {
          ...this.addressData,
          id: this.editingAddressId
        })

        // Mettre à jour l'adresse dans la liste
        const index = this.customerData.addresses.findIndex(addr => addr.id === this.editingAddressId)
        if (index !== -1) {
          this.customerData.addresses[index] = updatedAddress.data
        }

        this.isEditingAddress = false
        this.editingAddressId = null
        this.addressData = {}
        this.$emit('show-alert', 'Adresse modifiée avec succès !', 'success')
      } catch (error) {
        this.$emit('show-alert', 'Erreur lors de la modification : ' + error.message, 'danger')
      } finally {
        this.saving = false
      }
    },

    async setDefaultAddress(addressId) {
      try {
        await fetchData('setDefaultAddress', { id: addressId })

        // Mettre à jour les adresses localement
        this.customerData.addresses.forEach(addr => {
          addr.is_default = (addr.id === addressId)
        })

        this.$emit('show-alert', 'Adresse par défaut mise à jour !', 'success')
      } catch (error) {
        this.$emit('show-alert', 'Erreur lors de la mise à jour : ' + error.message, 'danger')
      }
    },

    async deleteAddress(addressId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
        return
      }

      try {
        await fetchData('deleteCustomerAddress', { id: addressId })

        // Supprimer l'adresse de la liste
        this.customerData.addresses = this.customerData.addresses.filter(addr => addr.id !== addressId)

        this.$emit('show-alert', 'Adresse supprimée avec succès !', 'success')
      } catch (error) {
        this.$emit('show-alert', 'Erreur lors de la suppression : ' + error.message, 'danger')
      }
    }
  }
}
</script>

<style scoped>
.profile-section {
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

/* Profile grid */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
}

.profile-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  transition: all 0.3s ease;
}

.profile-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  color: #212529;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

/* Info rows */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #212529;
  text-align: right;
}

/* Preferences */
.preferences-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
}

.preference-label {
  font-size: 14px;
  color: #495057;
}

.preference-status {
  font-size: 13px;
  font-weight: 500;
}

.preference-status.active {
  color: #155724;
}

.preference-status.inactive {
  color: #721c24;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 600;
  color: #3B82F6;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 13px;
  color: #6c757d;
}

/* Addresses */
.addresses-card {
  grid-column: 1 / -1;
}

.address-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.btn-add-address {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add-address:hover {
  background: #218838;
  transform: translateY(-1px);
}

.address-form-container {
  background: white;
  border: 2px solid #3B82F6;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 25px;
}

.address-form-container h4 {
  margin: 0 0 20px 0;
  color: #3B82F6;
  font-size: 18px;
}

.address-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group-checkbox {
  grid-column: 1 / -1;
}

.address-edit-form {
  width: 100%;
}

.address-edit-form h4 {
  margin: 0 0 20px 0;
  color: #3B82F6;
  font-size: 16px;
}

.addresses-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.address-item {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.address-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

.address-item.default-address {
  border-color: #3B82F6;
  background: #f8fbff;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
}

.address-alias {
  font-size: 16px;
  font-weight: 500;
  color: #212529;
}

.address-badges {
  display: flex;
  gap: 8px;
}

.default-badge {
  background: #3B82F6;
  color: white;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.address-content p {
  margin: 5px 0;
  font-size: 14px;
  color: #495057;
  line-height: 1.4;
}

.address-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.btn-default {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #ffc107;
  color: #212529;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-default:hover {
  background: #ffca2c;
}

.btn-default:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.btn-edit-address {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit-address:hover {
  background: #2563EB;
}

.btn-delete {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-delete:hover {
  background: #c82333;
}

.btn-delete:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.no-addresses {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  background: white;
  border-radius: 8px;
  border: 2px dashed #e9ecef;
}

/* Edit form */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.form-card {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.btn-cancel {
  padding: 12px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-save {
  padding: 12px 24px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save:hover {
  background: #2563EB;
}

.btn-save:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit:hover {
  background: #2563EB;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .addresses-list {
    grid-template-columns: 1fr;
  }

  .address-form-grid {
    grid-template-columns: 1fr;
  }

  .address-actions {
    flex-direction: column;
  }

  .address-header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .form-actions {
    flex-direction: column;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .info-value {
    text-align: left;
  }

  .preference-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>