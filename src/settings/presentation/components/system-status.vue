<script setup>
import { ref, onMounted } from 'vue';
import { SubscriptionApi } from '../../../subscription/infrastructure/subscription-api.js';

const subscriptionApi = new SubscriptionApi();
const planName = ref(null);

const statusItems = [
  { labelKey: 'settings.systemStatus.server', valueKey: 'settings.systemStatus.online', status: 'success', literalValue: false },
  { labelKey: 'settings.systemStatus.database', valueKey: 'settings.systemStatus.connected', status: 'success', literalValue: false },
  { labelKey: 'settings.systemStatus.lastUpdate', valueKey: '15/04/2026', status: 'info', literalValue: true },
  { labelKey: 'settings.systemStatus.version', valueKey: 'v3.0.0', status: 'info', literalValue: true }
];

// Show the account's current plan. Prefer the friendly plan name, falling back to the tier.
async function loadPlan() {
  try {
    const [status, plans] = await Promise.all([
      subscriptionApi.getMySubscription(),
      subscriptionApi.getPlans()
    ]);
    const sub = status?.subscription;
    if (sub) {
      const plan = plans.find((p) => p.id === sub.planId);
      planName.value = plan?.name || sub.tier;
    }
  } catch (error) {
    console.error('Error loading subscription plan:', error);
  }
}

onMounted(loadPlan);
</script>

<template>
  <pv-card class="system-status-card shadow-1 border-none">
    <template #title>
      <h3 class="text-900 font-bold text-xl m-0 font-josefin">{{ $t('settings.systemStatus.title') }}</h3>
    </template>
    <template #content>
      <div class="flex align-items-center justify-content-between mb-3">
        <span class="text-700 font-medium">{{ $t('settings.systemStatus.plan') }}</span>
        <span class="font-bold" style="color: #00c1b0">{{ planName || $t('settings.systemStatus.noPlan') }}</span>
      </div>
      <div v-for="item in statusItems" :key="item.labelKey" class="flex align-items-center justify-content-between mb-3 last:mb-0">
        <span class="text-700 font-medium">{{ $t(item.labelKey) }}</span>
        <div class="flex align-items-center gap-2">
          <div v-if="item.status === 'success'" class="w-2 h-2 border-circle bg-green-500"></div>
          <span class="font-medium" :class="item.status === 'success' ? 'text-green-600' : 'text-600'">
            {{ item.literalValue ? item.valueKey : $t(item.valueKey) }}
          </span>
        </div>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.w-2 { width: 0.5rem; }
.h-2 { height: 0.5rem; }
:deep(.p-card-body) {
  padding: 1.5rem;
}
:deep(.p-card-title) {
  margin-bottom: 1.5rem;
}
</style>
