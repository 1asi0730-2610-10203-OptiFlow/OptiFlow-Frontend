<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useI18n }             from 'vue-i18n'
import { ref, computed } from "vue";

const router = useRouter()
const route  = useRoute()
const { t }  = useI18n()

  const isMobileOpen = ref(false)
  isMobileOpen.value = false

const navItems = [
  { key: 'panel',     icon: 'pi pi-home',         to: '/panel' },
  { key: 'patients',  icon: 'pi pi-users',         to: '/patients' },
  { key: 'sales',     icon: 'pi pi-shopping-cart', to: '/sales' },
  { key: 'labOrders', icon: 'pi pi-wrench',        to: '/lab-orders' },
  { key: 'inventory', icon: 'pi pi-box',           to: '/inventory' },
  { key: 'staff',     icon: 'pi pi-id-card',       to: '/staff' },
  { key: 'reports',   icon: 'pi pi-chart-bar',     to: '/reports' },
  { key: 'settings',  icon: 'pi pi-cog',           to: '/settings' },
]

function navigate(to) { router.push(to) }
function isActive(to)  { return route.path.startsWith(to) }

const currentSectionLabel = computed(() => {
  const activeItem = navItems.find(item => isActive(item.to))
  return activeItem ? t(`nav.${activeItem.key}`) : ''
})

</script>

<template>

  <div class="sidebar-wrapper">
    <div class="mobile-topbar">
      <div class="mobile-topbar__left">
        <button class="hamburger-btn" @click="isMobileOpen = true" aria-label="Open menu">
          <i class="pi pi-bars"></i>
        </button>
        <div class="mobile-brand">
          <span class="brand-logo">
            <i class="pi pi-eye brand-icon" aria-hidden="true" />
          </span>
          <span class="brand-name">OptiFlow</span>
        </div>
      </div>
      <div class="mobile-topbar__right">
        <span class="current-section">{{ currentSectionLabel }}</span>
      </div>
    </div>

    <transition name="fade">
      <div
          v-if="isMobileOpen"
          class="sidebar-backdrop"
          @click="isMobileOpen = false"
      ></div>
    </transition>

    <aside class="sidebar" :class="{ 'sidebar--mobile-open': isMobileOpen }">

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
        <button class="btn-logout" @click="navigate('/')" :title="$t('common.close')" aria-label="Cerrar sesión">
          <i class="pi pi-sign-out"></i>
        </button>
      </div>

    </aside>
  </div>

</template>

<style scoped>
.sidebar-wrapper {
  display: flex;
}
.hamburger-btn {
  display: none;
}
.mobile-topbar {
  display: none;
}
.sidebar-backdrop {
  display: none;
}

/* Backdrop Fade Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sidebar {
  display: flex;
  width: 240px;
  min-width: 240px;
  background: #03070a;
  border-right: 1px solid rgba(147,193,206,0.15);
  flex-direction: column;
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

.btn-logout {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-logout i {
  font-size: 1.1rem;
}
.btn-logout:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

@media (max-width: 1023px) {
  .sidebar {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    /* The engine that makes the movement smooth */
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .mobile-topbar {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    background: #03070a;
    padding: 16px 20px;
    border-bottom-left-radius: 28px;
    border-bottom-right-radius: 28px;
    z-index: 1100;
  }

  .mobile-topbar__left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .mobile-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .current-section {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    color: #00c1b0;
  }

  .hamburger-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: #00c1b0;
    border: none;
    font-size: 1.4rem;
    cursor: pointer;
    padding: 0;
    margin: 0;
  }

  /* 2. The Pull: Bring it back to coordinates 0,0 */
  .sidebar--mobile-open {
    transform: translateX(0);
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.5);
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
    z-index: 999;
  }

}
</style>
