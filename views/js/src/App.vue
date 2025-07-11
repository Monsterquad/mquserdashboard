<template>
  <div class="prestashop-dashboard">
    <h1>{{ title }}</h1>
    <Dashboard />
  </div>
</template>

<script>
import Dashboard from './components/Dashboard.vue'

export default {
  name: 'App',
  components: {
    Dashboard
  },
  data() {
    return {
      title: 'Mon Dashboard'
    }
  }
}
</script>

<style scoped>
.prestashop-dashboard {
  padding: 20px;
  font-family: Arial, sans-serif;
}
</style>