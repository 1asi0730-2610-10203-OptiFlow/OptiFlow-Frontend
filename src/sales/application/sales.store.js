import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SalesApi } from '../infrastructure/sales-api.js'
import { PaymentApi } from '../infrastructure/payment-api.js'
import { FeedbackApi } from '../infrastructure/feedback-api.js'
import { SaleAssembler } from '../infrastructure/sale.assembler.js'
import { SaleDetailAssembler } from '../infrastructure/sale-detail.assembler.js'
import { PaymentAssembler } from '../infrastructure/payment.assembler.js'
import { FeedbackAssembler } from '../infrastructure/feedback.assembler.js'

const salesApi = new SalesApi()
const paymentApi = new PaymentApi()
const feedbackApi = new FeedbackApi()

export const useSalesStore = defineStore('sales', () => {
  const sales = ref([])
  const payments = ref([])
  const currentSale = ref(null)
  const loading = ref(false)
  const errors = ref([])

  const salesCount = computed(() => sales.value.length)

  const openSalesCount = computed(() =>
    sales.value.filter(s => s.status === 'PENDING' || s.status === 'PARTIAL').length
  )

  const completedSalesCount = computed(() =>
    sales.value.filter(s => s.status === 'DELIVERED' || s.status === 'PAID').length
  )

  const totalIngresos = computed(() =>
    sales.value.reduce((sum, s) => sum + s.totalAmount, 0)
  )

  const totalAdelantos = computed(() =>
    sales.value.reduce((sum, s) => sum + s.adelanto, 0)
  )

  const totalSaldo = computed(() =>
    sales.value.reduce((sum, s) => sum + s.pendingBalance, 0)
  )

  const ticketPromedio = computed(() =>
    sales.value.length > 0 ? totalIngresos.value / sales.value.length : 0
  )

  async function fetchSales() {
    loading.value = true
    try {
      const resources = await salesApi.getSales()
      sales.value = SaleAssembler.toEntitiesFromResponse(resources)
    } catch (e) {
      errors.value.push(e.message)
    } finally {
      loading.value = false
    }
  }

  async function createSale(sale) {
    loading.value = true
    try {
      const resource = SaleAssembler.toResourceFromEntity(sale)
      const created = await salesApi.createSale(resource)
      sales.value.unshift(SaleAssembler.toEntityFromResource(created))
    } catch (e) {
      errors.value.push(e.message)
    } finally {
      loading.value = false
    }
  }

  async function updateSale(id, sale) {
    loading.value = true
    try {
      const resource = SaleAssembler.toResourceFromEntity(sale)
      const updated = await salesApi.updateSale(id, resource)
      const entity = SaleAssembler.toEntityFromResource(updated)
      const index = sales.value.findIndex(s => s.id === id)
      if (index !== -1) sales.value[index] = entity
    } catch (e) {
      errors.value.push(e.message)
    } finally {
      loading.value = false
    }
  }

  async function markAsReturned(id) {
    const sale = sales.value.find(s => s.id === id)
    if (!sale) return
    await updateSale(id, { ...sale, status: 'RETURNED', pendingBalance: 0 })
  }

  async function cancelSale(id) {
    const sale = sales.value.find(s => s.id === id)
    if (!sale) return
    await updateSale(id, { ...sale, status: 'RETURNED' })
  }

  async function fetchPaymentsBySale(saleId) {
    loading.value = true
    try {
      const resources = await paymentApi.getPaymentsBySaleId(saleId)
      payments.value = PaymentAssembler.toEntitiesFromResponse(resources)
    } catch (e) {
      errors.value.push(e.message)
    } finally {
      loading.value = false
    }
  }

  async function registerPayment(payment) {
    loading.value = true
    try {
      const resource = PaymentAssembler.toResourceFromEntity(payment)
      const created = await paymentApi.registerPayment(resource)
      payments.value.push(PaymentAssembler.toEntityFromResource(created))

      const sale = sales.value.find(s => s.id === payment.saleId)
      if (sale) {
        const newBalance = Math.max(0, sale.pendingBalance - payment.amountPaid)
        const newStatus = newBalance === 0 ? 'PAID' : 'PARTIAL'
        await updateSale(sale.id, { ...sale, pendingBalance: newBalance, status: newStatus })
      }
    } catch (e) {
      errors.value.push(e.message)
    } finally {
      loading.value = false
    }
  }

  async function submitFeedback(feedback) {
    loading.value = true
    try {
      const resource = FeedbackAssembler.toResourceFromEntity(feedback)
      await feedbackApi.createFeedback(resource)
    } catch (e) {
      errors.value.push(e.message)
    } finally {
      loading.value = false
    }
  }

  return {
    sales, payments, currentSale, loading, errors,
    salesCount, openSalesCount, completedSalesCount,
    totalIngresos, totalAdelantos, totalSaldo, ticketPromedio,
    fetchSales, createSale, updateSale,
    markAsReturned, cancelSale,
    fetchPaymentsBySale, registerPayment, submitFeedback
  }
})
