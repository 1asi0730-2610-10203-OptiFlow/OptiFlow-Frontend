<script setup>
defineProps({
  role: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit']);
</script>

<template>
  <div class="role-item flex align-items-center justify-content-between p-4 mb-3 surface-card border-bottom-1 border-100">
    <div class="flex align-items-center gap-4">
      <div class="icon-container flex align-items-center justify-content-center border-round-md" 
           :style="{ color: role.color, width: '40px', height: '40px', border: '1px solid ' + role.color + '40' }">
        <i class="pi pi-shield"></i>
      </div>
      <div class="flex flex-column">
        <div class="flex align-items-center gap-2">
          <span class="text-900 font-bold font-josefin text-lg">{{ role.name }}</span>
        </div>
        <span class="text-500 text-xs mt-1">{{ $t('settings.roles.listItem.usersAssigned', { count: role.userCount }) }}</span>
        <span class="text-600 text-sm mt-2">{{ role.description }}</span>
      </div>
    </div>
    <pv-button :label="$t('settings.roles.listItem.edit')" variant="text" class="p-button-link text-primary font-medium text-sm" @click="emit('edit', role)" />
  </div>
</template>

<style scoped>
.role-item {
  transition: background-color 0.2s;
}
.role-item:hover {
  background-color: var(--surface-50);
}
.icon-container {
  background-color: transparent;
}
</style>
