<script setup>
/**
 * Layout component — shared presentation layer.
 *
 * App shell that composes the sidebar navigation and the main content area
 * with a <router-view>. Also mounts PrimeVue global services (Toast, ConfirmDialog).
 *
 * The navItems array is the single source of truth for sidebar navigation.
 * Each item's label is resolved through the nav.* i18n namespace so the
 * sidebar works in both Spanish and English without hardcoded strings.
 */

import { useRouter, useRoute } from 'vue-router'
import { useI18n }             from 'vue-i18n'
import LanguageSwitcher        from './language-switcher.vue'

const router  = useRouter()
const route   = useRoute()
const { t }   = useI18n()

/**
 * Sidebar navigation item definitions.
 * `key` maps to the nav.{key} i18n entry in locales/es.json and locales/en.json.
 *
 * @type {Array<{ key: string, icon: string, to: string }>}
 */
const navItems = [
  { key: 'panel',        icon: 'pi pi-home',         to: '/panel' },
  { key: 'patients',     icon: 'pi pi-users',         to: '/patients' },
  { key: 'sales',        icon: 'pi pi-shopping-cart', to: '/sales' },
  { key: 'labOrders',    icon: 'pi pi-wrench',        to: '/lab-orders' },
  { key: 'inventory',    icon: 'pi pi-box',           to: '/inventory' },
  { key: 'subscription', icon: 'pi pi-credit-card',   to: '/subscription/my-plan' },
  { key: 'staff',        icon: 'pi pi-id-card',       to: '/staff' },
  { key: 'reports',      icon: 'pi pi-chart-bar',     to: '/reports' },
  { key: 'settings',     icon: 'pi pi-cog',           to: '/settings' }
]

/**
 * Pushes the given path onto the router history.
 * @param {string} to - Route path.
 * @returns {void}
 */
function navigate(to) { router.push(to) }

/**
 * Returns true when the current route path starts with the given path.
 * Used to highlight the active sidebar item.
 *
 * @param {string} to - Route path to test.
 * @returns {boolean}
 */
function isActive(to) { return route.path.startsWith(to) }
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">

      <div class="sidebar-brand">
        <span class="brand-logo">
          <i class="pi pi-eye brand-icon" aria-hidden="true" />
        </span>
        <div class="brand-text">
          <span class="brand-name">{{ $t('app.name') }}</span>
          <span class="brand-subtitle">{{ $t('app.subtitle') }}</span>
        </div>
      </div>

      <nav class="sidebar-nav" :aria-label="$t('nav.section')">
        <p class="nav-section-label">{{ $t('nav.section') }}</p>
        <button
            v-for="item in navItems"
            :key="item.to"
            class="nav-item"
            :class="{ 'nav-item--active': isActive(item.to) }"
            @click="navigate(item.to)"
        >
          <i :class="item.icon" class="nav-item__icon" aria-hidden="true" />
          <span class="nav-item__label">{{ $t(`nav.${item.key}`) }}</span>
        </button>
      </nav>

      <div class="sidebar-user">
        <div class="user-avatar" aria-hidden="true">JD</div>
        <div class="user-info">
          <span class="user-name">John Doe</span>
          <span class="user-role">{{ $t('user.role') }}</span>
        </div>
      </div>

    </aside>

    <main class="main-content">
      <div class="topbar">
        <LanguageSwitcher />
      </div>
      <div class="page-wrapper">
        <router-view />
      </div>
    </main>

    <pv-toast />
    <pv-confirm-dialog />
  </div>
</template>

<style scoped>
.app-shell { display: flex; height: 100vh; overflow: hidden; background-color: #f9fafb; }

.sidebar {
  width: 240px; min-width: 240px; background: #03070a;
  border-right: 1px solid rgba(147,193,206,0.15);
  display: flex; flex-direction: column; overflow-y: auto;
}

.sidebar-brand {
  display: flex; align-items: center; gap: 12px;
  padding: 20px 16px 18px;
  border-bottom: 1px solid rgba(147,193,206,0.15);
}

.brand-logo {
  width: 38px; height: 38px; border-radius: 9px;
  background: #00c1b0; display: flex;
  align-items: center; justify-content: center; flex-shrink: 0;
}

.brand-icon { color: #fff; font-size: 1.1rem; }
.brand-text { display: flex; flex-direction: column; gap: 1px; }

.brand-name {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 1rem; font-weight: 700; color: #ffffff; line-height: 1.2;
}

.brand-subtitle {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.68rem; color: #93c1ce; line-height: 1.2;
}

.sidebar-nav {
  display: flex; flex-direction: column; gap: 1px;
  padding: 16px 10px; flex: 1;
}

.nav-section-label {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 0.68rem; font-weight: 600; color: #93c1ce;
  opacity: 0.6; letter-spacing: 0.08em; text-transform: uppercase;
  margin: 0 4px 8px;
}

.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border: none; background: transparent;
  border-radius: 8px; cursor: pointer; width: 100%; text-align: left;
  transition: background 0.15s, color 0.15s;
  color: #93c1ce; font-family: 'Montserrat', sans-serif;
  font-size: 0.845rem; font-weight: 500;
}

.nav-item:hover { background: rgba(255,255,255,0.08); color: #ffffff; }

.nav-item--active {
  background: rgba(0,193,176,0.15); color: #00c1b0;
  border-left: 3px solid #00c1b0; padding-left: 9px;
}

.nav-item__icon { font-size: 0.95rem; width: 17px; text-align: center; flex-shrink: 0; }

.sidebar-user {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px;
  border-top: 1px solid rgba(147,193,206,0.15);
}

.user-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(0,193,176,0.2); display: flex;
  align-items: center; justify-content: center;
  font-family: 'Josefin Sans', sans-serif;
  font-size: 0.78rem; font-weight: 700; color: #00c1b0; flex-shrink: 0;
}

.user-info { display: flex; flex-direction: column; gap: 1px; }
.user-name { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #ffffff; }
.user-role { font-family: 'Montserrat', sans-serif; font-size: 0.7rem; color: #93c1ce; }

.main-content { flex: 1; display: flex; flex-direction: column; background: #f9fafb; overflow: hidden; }

.topbar {
  display: flex; justify-content: flex-end; align-items: center;
  padding: 10px 28px; background: #fff;
  border-bottom: 1px solid #f3f4f6; flex-shrink: 0;
}

.page-wrapper { flex: 1; overflow-y: auto; }
</style>