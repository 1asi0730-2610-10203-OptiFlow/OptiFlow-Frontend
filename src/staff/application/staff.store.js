import { defineStore } from 'pinia'
import { StaffApi } from '../infrastructure/staff-api.js'
import { StaffAssembler } from '../infrastructure/staff.assembler.js'

const staffApi = new StaffApi()

export const useStaffStore = defineStore('staff', {
  state: () => ({
    staff: [],
    loading: false,
    errors: []
  }),

  getters: {
    totalEmployees: (state) => state.staff.length,
    optometrists: (state) => state.staff.filter(s => s.role === 'Optometrista').length,
    supportStaff: (state) => state.staff.filter(s => s.role === 'Personal de Apoyo').length,
    activeTodayCount: (state) => state.staff.filter(s => s.activeToday).length
  },

  actions: {
    async fetchStaff() {
      this.loading = true
      this.errors = []
      try {
        const response = await staffApi.getStaff()
        this.staff = StaffAssembler.toEntitiesFromResponse(response)
      } catch (error) {
        this.errors.push('Error al cargar el personal')
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async createEmployee(employeeData) {
      this.loading = true
      try {
        const resource = StaffAssembler.toResourceFromEntity(employeeData)
        const response = await staffApi.createEmployee(resource)
        const newEmployee = StaffAssembler.toEntityFromResource(response)
        this.staff.push(newEmployee)
        return newEmployee
      } catch (error) {
        this.errors.push('Error al crear el empleado')
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
