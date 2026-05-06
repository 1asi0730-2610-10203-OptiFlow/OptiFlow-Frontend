import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import SelectButton from 'primevue/selectbutton'

import { pinia } from './pinia.js'
import router from './router.js'
import App from './App.vue'
import './style.css'
import { i18n } from './i18n.js'

// PrimeVue components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Steps from 'primevue/steps'
import Textarea from 'primevue/textarea'
import Rating from 'primevue/rating'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import ProgressSpinner from 'primevue/progressspinner'

const app = createApp(App)
app.use(i18n)
app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: { darkModeSelector: false }
  },
  ripple: true
})
app.use(ConfirmationService)
app.use(ToastService)

app.component('pv-button', Button)
app.component('pv-input-text', InputText)
app.component('pv-input-number', InputNumber)
app.component('pv-select', Select)
app.component('pv-data-table', DataTable)
app.component('pv-column', Column)
app.component('pv-dialog', Dialog)
app.component('pv-tag', Tag)
app.component('pv-steps', Steps)
app.component('pv-textarea', Textarea)
app.component('pv-rating', Rating)
app.component('pv-message', Message)
app.component('pv-toast', Toast)
app.component('pv-confirm-dialog', ConfirmDialog)
app.component('pv-progress-spinner', ProgressSpinner)
app.component('pv-select-button', SelectButton)

app.mount('#app')
