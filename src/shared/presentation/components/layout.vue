<script setup>
import AppSidebar      from './app-sidebar.vue'
import LanguageSwitcher from './language-switcher.vue'
import GlobalSearch    from './global-search.vue'
</script>

<template>
  <div class="app-shell">
    <AppSidebar />

    <main class="main-content">
      <div class="topbar">
        <GlobalSearch />
        <LanguageSwitcher />
      </div>
      <div class="page-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="page">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <pv-toast />
    <pv-confirm-dialog />
  </div>
</template>

<style scoped>
.app-shell { display: flex; height: 100vh; overflow: hidden; background-color: #f9fafb; }

.main-content { flex: 1; display: flex; flex-direction: column; background: #f9fafb; overflow: hidden; }

@media (max-width: 1023px) {
  .main-content {
    padding-top: 70px; /* Offset for fixed mobile topbar */
  }
}

.topbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 28px; background: #fff;
  border-bottom: 1px solid #f3f4f6; flex-shrink: 0;
}

.page-wrapper { flex: 1; overflow-y: auto; position: relative; }
</style>
