<template>
  <div class="left-link">
    <ul>
      <li
        v-for="menu in menuItems"
        :key="menu.id"
        :class="{ active: activeSection === menu.id }"
        @click="selectSection(menu.id)"
      >
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" v-html="menu.icon"></svg>
        {{ menu.label }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'SidebarNavigation',

  props: {
    menuItems: {
      type: Array,
      required: true
    },
    activeSection: {
      type: String,
      required: true
    }
  },

  emits: ['section-changed'],

  methods: {
    selectSection(sectionId) {
      this.$emit('section-changed', sectionId)
    }
  }
}
</script>

<style scoped>
/* Navigation latérale */
.left-link {
  flex: 0 0 250px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 0;
  height: fit-content;
}

.left-link ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.left-link li {
  padding: 16px 24px;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 12px;
}

.left-link li:first-child {
  border-radius: 12px 12px 0 0;
}

.left-link li:last-child {
  border-bottom: none;
  border-radius: 0 0 12px 12px;
}

.left-link li:hover {
  background: #e9ecef;
  color: #212529;
}

.left-link li.active {
  background: #fff;
  color: #212529;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* Icônes SVG */
.menu-icon {
  width: 24px;
  height: 24px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.left-link li:hover .menu-icon {
  transform: scale(1.1);
}

.left-link li.active .menu-icon {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

/* Responsive */
@media (max-width: 768px) {
  .left-link {
    flex: 1;
    width: 100%;
  }

  .left-link ul {
    display: flex;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .left-link ul::-webkit-scrollbar {
    display: none;
  }

  .left-link li {
    flex: 0 0 auto;
    white-space: nowrap;
    border-bottom: none;
    border-right: 1px solid #e9ecef;
  }

  .left-link li:first-child {
    border-radius: 12px 0 0 12px;
  }

  .left-link li:last-child {
    border-radius: 0 12px 12px 0;
    border-right: none;
  }
}
</style>