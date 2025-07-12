<!-- DashboardContent.vue -->
<template>
  <div class="dashboard-content">
    <component
      :is="currentComponent"
    />
  </div>
</template>

<script>
// ✅ Importer tous les composants de sections
import ProfileSection from './sections/ProfileSection.vue'
import OrdersSection from './sections/OrdersSection.vue'
import CreditSection from './sections/CreditSection.vue'
import AlertsSection from './sections/AlertsSection.vue'
import ReviewsSection from './sections/ReviewsSection.vue'

export default {
  name: 'DashboardContent',

  components: {
    ProfileSection,
    OrdersSection,
    CreditSection,
    AlertsSection,
    ReviewsSection
  },

  props: {
    sectionActive: {
      type: String,
      required: true
    }
  },

  computed: {
    currentComponent() {
      const componentMap = {
        'profile': 'ProfileSection',
        'orders': 'OrdersSection',
        'credit': 'CreditSection',
        'alerts': 'AlertsSection',
        'reviews': 'ReviewsSection'
      }

      return componentMap[this.sectionActive] || 'ProfileSection'
    },

    /*currentComponentProps() {
      switch (this.sectionActive) {
        case 'profile':
          return { userId: 123 }
        case 'orders':
          return { limit: 10 }
        default:
          return {}
      }
    }*/
  }
}
</script>

<style scoped>
.dashboard-content {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  flex: 1;
}
</style>