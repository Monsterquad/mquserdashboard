<template>
  <div class="mq-dashboard">
    <SidebarNavigation
      :menu-items="menuItems"
      :active-section="activeSection"
      @section-changed="setActiveSection"
    />

    <DashboardContent
      :section-active="activeSection"
    />

  </div>
</template>

<script>
import SidebarNavigation from './SidebarNavigation.vue'
import DashboardContent from './DashboardContent.vue'

export default {
  name: 'UserDashboard',

  components: {
    SidebarNavigation,
    DashboardContent
  },

  data() {
    return {
      activeSection: 'profile',
      menuItems: [
        {
          id: 'profile',
          label: 'Mon profil',
          icon: `<circle cx="12" cy="8" r="3" stroke="#6366F1" stroke-width="1.5" fill="#E0E7FF"/>
                 <path d="M6 20c0-3 2.5-5 6-5s6 2 6 5" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" fill="#EDE9FE"/>`
        },
        {
          id: 'orders',
          label: 'Mes commandes',
          icon: `<rect x="3" y="7" width="18" height="12" rx="2" stroke="#3B82F6" stroke-width="1.5" fill="#EBF4FF"/>
                 <path d="M15 7V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2" stroke="#3B82F6" stroke-width="1.5"/>
                 <circle cx="8" cy="13" r="0.5" fill="#3B82F6"/>
                 <circle cx="16" cy="13" r="0.5" fill="#3B82F6"/>
                 <path d="M8 13h8" stroke="#3B82F6" stroke-width="1.5" stroke-linecap="round"/>`
        },
        {
          id: 'credit',
          label: 'Mes Avoirs',
          icon: `<rect x="3" y="6" width="18" height="12" rx="2" stroke="#10B981" stroke-width="1.5" fill="#D1FAE5"/>
                 <circle cx="12" cy="12" r="3" stroke="#10B981" stroke-width="1.5" fill="#ECFDF5"/>
                 <path d="M12 10.5v3M10.5 12h3" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/>`
        },
        {
          id: 'alerts',
          label: 'Mes Alertes',
          icon: `<path d="M12 3C10 3 8 5 8 7v2c0 2-2 4-2 4h12s-2-2-2-4V7c0-2-2-4-4-4z" stroke="#F59E0B" stroke-width="1.5" fill="#FEF3C7"/>
                 <circle cx="12" cy="18" r="2" stroke="#F59E0B" stroke-width="1.5" fill="#FDE68A"/>
                 <circle cx="17" cy="6" r="1.5" fill="#F59E0B"/>`
        },
        {
          id: 'reviews',
          label: 'Mes avis',
          icon: `<path d="M12 3l2.5 5.5 6 .5-4.5 4 1.5 6-5.5-3-5.5 3 1.5-6-4.5-4 6-.5z" stroke="#FBBF24" stroke-width="1.5" fill="#FEF3C7"/>
                 <path d="M12 6l1.5 3 3.5 .5-2.5 2.5.5 3.5-3-2-3 2 .5-3.5L7 9.5l3.5-.5z" fill="#F59E0B"/>`
        }
      ]
    }
  },

  methods: {
    setActiveSection(section) {
      this.activeSection = section
      console.log(this.activeSection)
    }
  }
}
</script>

<style scoped>
.mq-dashboard {
  width: 98%;
  display: flex;
  gap: 30px;
  min-height: 500px;
  margin: 20px auto;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .mq-dashboard {
    flex-direction: column;
    gap: 20px;
  }
}
</style>