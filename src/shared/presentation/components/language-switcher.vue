<script setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const languageOptions = ['en', 'es']
</script>

<template>
  <pv-select-button
      v-model="locale"
      :options="languageOptions"
  >
    <template #option="slotProps">
      <span>{{ slotProps.option.toUpperCase() }}</span>
    </template>
  </pv-select-button>
</template>

<style scoped>
</style>