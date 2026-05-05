<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navItems = [
  { label: 'Panel',        icon: 'pi pi-home',        to: '/' },
  { label: 'Pacientes',    icon: 'pi pi-users',        to: '/patients' },
  { label: 'Ventas',       icon: 'pi pi-shopping-cart', to: '/sales' },
  { label: 'Inventario',   icon: 'pi pi-box',          to: '/inventory' },
  { label: 'Reportes',     icon: 'pi pi-chart-bar',    to: '/reports' },
  { label: 'Configuración',icon: 'pi pi-cog',          to: '/settings' }
]

function navigate(to) {
  router.push(to)
}

function isActive(to) {
  return route.path.startsWith(to) && to !== '/'
    || (to === '/' && route.path === '/')
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-logo">
          <i class="pi pi-eye brand-icon" />
        </span>
        <div class="brand-text">
          <span class="brand-name">OptiFlow</span>
          <span class="brand-subtitle">ERP / CRM Óptico</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.to"
          class="nav-item"
          :class="{ 'nav-item--active': isActive(item.to) }"
          @click="navigate(item.to)"
        >
          <i :class="item.icon" class="nav-item__icon" />
          <span class="nav-item__label">{{ item.label }}</span>
        </button>
      </nav>
    </aside>

    <main class="main-content">
      <router-view />
    </main>

    <pv-toast />
    <pv-confirm-dialog />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #f8f9fa;
}

.sidebar {
  width: 256px;
  min-width: 256px;
  background: #03070A;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #e9ecef;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #00C1B0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-icon {
  color: #fff;
  font-size: 1.2rem;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.7rem;
  line-height: 1.2;
  color: white;

}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 12px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.15s, color 0.15s;
  color: #93C1CE;
  font-size: 0.875rem;
  font-weight: 500;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #111827;
}

.nav-item--active {
  background: #00C1B0;
  color: #ffffff;
}

.nav-item--active .nav-item__icon {
  color: #ffffff;
}

.nav-item__icon {
  font-size: 1rem;
  width: 18px;
  text-align: center;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
</style>
