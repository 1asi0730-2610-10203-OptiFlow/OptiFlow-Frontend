import { defineStore } from 'pinia'
import { StaffApi } from '../infrastructure/staff-api.js'
import { StaffAssembler } from '../infrastructure/staff.assembler.js'
import { useRoles } from '../../settings/application/use-roles.js'

const staffApi = new StaffApi()

export const useStaffStore = defineStore('staff', {
  state: () => ({
    staff: [],
    loading: false,
    errors: []
  }),

  getters: {
    totalEmployees: (state) => state.staff.length,
    optometrists: (state) => {
      const { findRoleByName } = useRoles()
      return state.staff.filter(s => findRoleByName(s.role)?.internalName === 'OPTOMETRIST').length
    },
    supportStaff: (state) => {
      const { findRoleByName } = useRoles()
      return state.staff.filter(s => findRoleByName(s.role)?.internalName !== 'OPTOMETRIST').length
    },
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
    },

    async updateEmployee(id, employeeData) {
      this.loading = true
      try {
        const resource = StaffAssembler.toResourceFromEntity(employeeData)
        const response = await staffApi.updateEmployee(id, resource)
        const updated = StaffAssembler.toEntityFromResource(response)
        const index = this.staff.findIndex(s => s.id === id)
        if (index !== -1) this.staff[index] = updated
        return updated
      } catch (error) {
        this.errors.push('Error al actualizar el empleado')
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteEmployee(id) {
      this.loading = true
      try {
        await staffApi.deleteEmployee(id)
        this.staff = this.staff.filter(s => s.id !== id)
      } catch (error) {
        this.errors.push('Error al eliminar el empleado')
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
