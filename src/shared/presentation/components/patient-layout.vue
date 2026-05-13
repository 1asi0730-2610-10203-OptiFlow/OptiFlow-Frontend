<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from './language-switcher.vue'

const router = useRouter()
const route  = useRoute()
const { t }  = useI18n()
const isMobileOpen = ref(false)

const userProfile = ref({ firstName: 'John', lastName: 'Doe' })

function loadProfile() {
  const saved = localStorage.getItem('optiflow_patient_profile')
  if (saved) {
    userProfile.value = JSON.parse(saved)
  }
}

onMounted(() => {
  loadProfile()
  window.addEventListener('profileUpdated', loadProfile)
})

onUnmounted(() => {
  window.removeEventListener('profileUpdated', loadProfile)
})

const fullName = computed(() => `${userProfile.value.firstName} ${userProfile.value.lastName}`)
const initials = computed(() => {
  const f = userProfile.value.firstName ? userProfile.value.firstName.charAt(0).toUpperCase() : ''
  const l = userProfile.value.lastName ? userProfile.value.lastName.charAt(0).toUpperCase() : ''
  return f + l || 'JD'
})

const navItems = [
  { key: 'profile',       icon: 'pi pi-user',       to: '/patient/profile' },
  { key: 'myLenses',      icon: 'pi pi-search',     to: '/patient/my-lenses' },
  { key: 'tryOn',         icon: 'pi pi-camera',     to: '/patient/virtual-try-on' },
  { key: 'calculator',    icon: 'pi pi-percentage', to: '/patient/calculator' },
  { key: 'notifications', icon: 'pi pi-bell',       to: '/patient/notifications' },
]

const currentSectionLabel = computed(() => {
  const activeItem = navItems.find(item => isActive(item.to))
  return activeItem ? t(`nav.${activeItem.key}`) : ''
})

function navigate(to) { router.push(to); isMobileOpen.value = false }
function isActive(to)  { return route.path.startsWith(to) }
function logout()      { router.push('/login') }
</script>

<template>
  <div class="app-shell">

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

      <div v-if="isMobileOpen" class="sidebar-backdrop" @click="isMobileOpen = false" />

      <aside class="sidebar" :class="{ 'sidebar--mobile-open': isMobileOpen }">

        <div class="sidebar-brand">
          <span class="brand-logo">
            <i class="pi pi-eye brand-icon" aria-hidden="true" />
          </span>
          <div class="brand-text">
            <span class="brand-name">{{ $t('app.name') }}</span>
            <span class="brand-subtitle">{{ $t('app.patientSubtitle') }}</span>
          </div>
        </div>

        <nav class="sidebar-nav" :aria-label="$t('nav.patientSection')">
          <p class="nav-section-label">{{ $t('nav.patientSection') }}</p>
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

        <div class="sidebar-bottom">
          <div class="sidebar-user">
            <div class="user-avatar" aria-hidden="true">{{ initials }}</div>
            <div class="user-info">
              <span class="user-name">{{ fullName }}</span>
              <span class="user-role">{{ $t('user.patientRole') }}</span>
            </div>
          </div>
          <button class="btn-logout" @click="logout" :title="'Logout'">
            <i class="pi pi-sign-out" />
          </button>
        </div>

      </aside>
    </div>

    <main class="main-content">
      <div class="topbar">
        <div class="topbar-right">
          <LanguageSwitcher />
          <div class="topbar-user">
            <div class="topbar-user-info">
              <span class="user-name">{{ fullName }}</span>
              <span class="user-role">{{ $t('user.patientRole') }}</span>
            </div>
            <div class="avatar-sm">{{ initials }}</div>
          </div>
        </div>
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

.sidebar-wrapper { display: flex; }
.hamburger-btn { display: none; }
.sidebar-backdrop { display: none; }
.mobile-topbar { display: none; }

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
  font-size: 0.68rem; color: #00c1b0; line-height: 1.2;
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

.sidebar-bottom {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  border-top: 1px solid rgba(147,193,206,0.15);
  gap: 8px;
}

.sidebar-user { display: flex; align-items: center; gap: 10px; min-width: 0; }

.user-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(0,193,176,0.2); display: flex;
  align-items: center; justify-content: center;
  font-family: 'Josefin Sans', sans-serif;
  font-size: 0.78rem; font-weight: 700; color: #00c1b0; flex-shrink: 0;
}

.user-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.user-name { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-family: 'Montserrat', sans-serif; font-size: 0.7rem; color: #93c1ce; }

.btn-logout {
  background: transparent; border: none; cursor: pointer;
  color: #ef4444; padding: 6px; border-radius: 6px;
  flex-shrink: 0; font-size: 0.95rem;
  transition: color 0.15s, background 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.btn-logout:hover { color: #f87171; background: rgba(239, 68, 68, 0.1); }

.main-content { flex: 1; display: flex; flex-direction: column; background: #f9fafb; overflow: hidden; }

.topbar {
  display: flex; justify-content: flex-end; align-items: center;
  padding: 10px 28px; background: #fff;
  border-bottom: 1px solid #f3f4f6; flex-shrink: 0;
}
.topbar-right { display: flex; align-items: center; gap: 20px; }
.topbar-user { display: flex; align-items: center; gap: 12px; }
.topbar-user-info { display: flex; flex-direction: column; text-align: right; }
.topbar-user-info .user-name { font-family: 'Josefin Sans', sans-serif; font-size: 0.95rem; font-weight: 700; color: #111827; }
.topbar-user-info .user-role { font-family: 'Montserrat', sans-serif; font-size: 0.75rem; color: #9ca3af; }
.avatar-sm { width: 36px; height: 36px; border-radius: 50%; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-family: 'Josefin Sans', sans-serif; font-weight: 700; font-size: 1rem; }

.page-wrapper { flex: 1; overflow-y: auto; }

@media (max-width: 1023px) {
  .sidebar {
    display: flex;
    position: fixed;
    top: 0; left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sidebar--mobile-open {
    transform: translateX(0);
    box-shadow: 4px 0 15px rgba(0,0,0,0.5);
  }

  .main-content { padding-top: 70px; }

  .mobile-topbar {
    display: flex; position: fixed; top: 0; left: 0; width: 100%;
    align-items: center; justify-content: space-between;
    background: #03070a; padding: 16px 20px;
    border-bottom-left-radius: 28px; border-bottom-right-radius: 28px;
    z-index: 1100;
  }
  .mobile-topbar__left { display: flex; align-items: center; gap: 16px; }
  .mobile-brand { display: flex; align-items: center; gap: 10px; }
  .current-section { font-family: 'Montserrat', sans-serif; font-size: 0.9rem; font-weight: 500; color: #00c1b0; }

  .hamburger-btn {
    display: flex; align-items: center; justify-content: center;
    background: transparent; color: #00c1b0; border: none;
    font-size: 1.4rem; cursor: pointer; padding: 0; margin: 0;
  }

  .sidebar-backdrop {
    display: block;
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(2px);
    z-index: 999;
  }
}
</style>
