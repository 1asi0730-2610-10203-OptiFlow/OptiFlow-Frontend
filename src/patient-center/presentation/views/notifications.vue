<script setup>
import { ref } from 'vue'

const notifications = ref([
  {
    id: 1,
    title: '¡Tu pedido está listo!',
    description: 'Tu orden LAB-2851 ya está lista para recoger en nuestra sucursal.',
    time: 'Hace 2 horas',
    type: 'success', // Para el color verde
    unread: true
  },
  {
    id: 2,
    title: 'Recordatorio de pago pendiente',
    description: 'Tienes un saldo pendiente de S/ 200.00 en tu orden LAB-2850.',
    time: 'Hace 5 horas',
    type: 'warning', // Para el color naranja
    unread: false
  }
])
</script>

<template>
  <div class="page">
    <!-- Header con buen margen -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Notificaciones</h1>
        <p class="page-subtitle">Bienvenido/a a tu portal OptiFlow</p>
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
            <h3 class="card-title">Notificaciones</h3>
            <p class="card-subtitle">1 sin leer</p>
          </div>
        </div>
      </div>

      <div class="card-body">
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

          <button v-if="note.type === 'success'" class="btn-details">
            Ver detalles
          </button>
        </div>
      </div>
    </div>

    <!-- Banner Informativo Inferior -->
    <div class="info-banner">
      <i class="pi pi-bell info-banner-icon" />
      <div>
        <p class="info-banner-title">Mantente informado</p>
        <p class="info-banner-text">
          Te notificaremos cuando tu pedido esté listo para recoger, cuando haya cambios en el estado de tu orden y cuando tengamos promociones especiales para ti.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-container { max-width: 800px; margin-top: 24px; }
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
