import { defineStore } from 'pinia'
import { ReportApi } from '../infrastructure/report-api.js'
import { ReportAssembler } from '../infrastructure/report.assembler.js'

const api = new ReportApi()

export const useReportStore = defineStore('report', {
  state: () => ({
    reports: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchReports() {
      this.loading = true
      try {
        const data = await api.getAll()
        this.reports = ReportAssembler.toDomainList(data)
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    }
  }
})
