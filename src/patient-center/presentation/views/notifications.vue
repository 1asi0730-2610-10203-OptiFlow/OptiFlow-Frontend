<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../../application/notification.store.js'

const router = useRouter()
const store = useNotificationStore()

const patientId = 1

onMounted(async () => {
    await store.fetchNotifications(patientId)
})

const notifications = computed(() => store.notifications.map(n => {
    const isReady = n.message.toLowerCase().includes('ready') || n.message.toLowerCase().includes('listo')
    let timeStr = 'Reciente'
    if (n.sentAt) {
        const date = new Date(n.sentAt)
        timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }
    return {
        id: n.id,
        title: isReady ? '¡Tu pedido está listo!' : 'Actualización de Orden',
        description: n.message,
        time: timeStr,
        type: isReady ? 'success' : 'warning',
        unread: n.status === 'PENDING'
    }
}))

const loading = computed(() => store.loading)
</script>

<template>
  <div class="page">
    <!-- Header con buen margen -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('patientCenter.notifications.title') }}</h1>
        <p class="page-subtitle">{{ $t('patientCenter.notifications.subtitle') }}</p>
      </div>
    </div>

    <!-- Contenedor Principal de Notificaciones -->
    <div class="card notifications-container">
      <div class="card-header">
        <div class="header-with-icon">
          <div class="avatar" style="background: rgba(0,193,176,0.1); color: #00c1b0;">
            <i class="pi pi-bell" />
          </div>
          <div>
            <h3 class="card-title">{{ $t('patientCenter.notifications.title') }}</h3>
            <p class="card-subtitle">{{ $t('patientCenter.notifications.unread', { count: notifications.filter(n => n.unread).length }) }}</p>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loading" style="text-align: center; padding: 30px; color: #9ca3af;">
          <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem;"></i>
        </div>
        <div v-else-if="notifications.length === 0" style="text-align: center; padding: 30px; color: #9ca3af;">
          <p>No tienes notificaciones por el momento.</p>
        </div>
        <div 
          v-for="note in notifications" 
          :key="note.id" 
          class="notification-item"
          :class="[`note--${note.type}`, { 'note--unread': note.unread }]"
        >
          <div class="note-icon-box">
             <i :class="note.type === 'success' ? 'pi pi-box' : 'pi pi-wallet'" />
          </div>
          
          <div class="note-content">
            <div class="note-header">
              <span class="note-title">{{ note.title }}</span>
              <span v-if="note.unread" class="unread-dot" />
            </div>
            <p class="note-description">{{ note.description }}</p>
            <span class="note-time">{{ note.time }}</span>
          </div>

          <button v-if="note.type === 'success'" class="btn-details" @click="router.push('/patient/my-lenses')">
            {{ $t('patientCenter.notifications.details') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Banner Informativo Inferior -->
    <div class="info-banner">
      <i class="pi pi-bell info-banner-icon" />
      <div>
        <p class="info-banner-title">{{ $t('patientCenter.notifications.bannerTitle') }}</p>
        <p class="info-banner-text">
          {{ $t('patientCenter.notifications.bannerText') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Base layout ── */
.page { padding: 24px 32px; display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
.page-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.5rem; font-weight: 700; color: #03070a; margin: 0; }
.page-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #6b7280; margin: 4px 0 0; }

.card { background: #fff; border-radius: 14px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f3f4f6; }
.card-title { font-family: 'Josefin Sans', sans-serif; font-size: 0.95rem; font-weight: 700; color: #111827; margin: 0; }
.card-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; margin: 2px 0 0; }
.avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }

/* ── Notifications ── */
.notifications-container { max-width: 800px; }
.card-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.header-with-icon { display: flex; align-items: center; gap: 12px; }

/* Estilo de cada notificación */
.notification-item {
  display: flex; align-items: center; gap: 16px;
  padding: 20px; border-radius: 12px; border: 1px solid #f3f4f6;
  position: relative; transition: transform 0.2s;
}

.note--unread { border-color: #00c1b0; background: rgba(0,193,176,0.02); }

/* Colores según tipo */
.note--success .note-icon-box { background: #dcfce7; color: #22c55e; }
.note--warning .note-icon-box { background: #ffedd5; color: #f97316; }

.note-icon-box {
  width: 42px; height: 42px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; flex-shrink: 0;
}

.note-content { flex: 1; }
.note-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.note-title { font-family: 'Josefin Sans', sans-serif; font-weight: 700; color: #111827; }
.unread-dot { width: 8px; height: 8px; background: #00c1b0; border-radius: 50%; }

.note-description { font-size: 0.85rem; color: #4b5563; margin: 0 0 6px; }
.note-time { font-size: 0.75rem; color: #9ca3af; }

.btn-details {
  background: #00c1b0; color: white; border: none;
  padding: 8px 16px; border-radius: 20px; font-size: 0.8rem;
  font-weight: 600; cursor: pointer;
}

/* Banner inferior azul */
.info-banner {
  margin-top: 32px; padding: 20px; border-radius: 12px;
  background: #eff6ff; border: 1px solid #dbeafe;
  display: flex; gap: 14px; max-width: 800px;
}
.info-banner-icon { color: #3b82f6; margin-top: 3px; }
.info-banner-title { font-family: 'Montserrat', sans-serif; font-weight: 700; color: #1e40af; margin: 0 0 4px; font-size: 0.9rem; }
.info-banner-text { font-size: 0.82rem; color: #3b82f6; margin: 0; line-height: 1.5; }
</style>
