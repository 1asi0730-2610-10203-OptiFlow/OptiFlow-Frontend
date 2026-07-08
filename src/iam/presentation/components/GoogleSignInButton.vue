<script setup>
import { ref, onMounted } from 'vue'

// Renders the official Google Identity Services button and emits the returned credential so the
// parent decides what to do with it (sign in, then route / start checkout). The GSI script is loaded
// async from index.html, so we retry briefly until it is ready.
const emit = defineEmits(['credential'])
const container = ref(null)

function render() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId || !window.google?.accounts?.id || !container.value) return false
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: ({ credential }) => emit('credential', credential),
  })
  window.google.accounts.id.renderButton(container.value, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'pill',
    logo_alignment: 'center',
    width: 331,
  })
  return true
}

onMounted(() => {
  if (!render()) {
    let tries = 0
    const timer = setInterval(() => {
      if (render() || ++tries >= 25) clearInterval(timer)
    }, 200)
  }
})
</script>

<template>
  <div ref="container" class="google-signin-btn"></div>
</template>

<style scoped>
.google-signin-btn { display: flex; justify-content: center; }
</style>
