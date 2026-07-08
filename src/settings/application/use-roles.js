import { ref, computed } from 'vue'
import { RolesApi } from '../infrastructure/roles-api.js'
import { RoleAssembler } from '../infrastructure/role.assembler.js'

// Module-level singleton: every screen (Settings role management, staff add/edit/list/detail,
// clinical doctor picker) shares this same cache, so creating/editing/deleting a role in one
// place is immediately visible everywhere else without a full page reload.
const rolesApi = new RolesApi()

const roles = ref([])
const loading = ref(false)
let loaded = false

async function fetchRoles(force = false) {
  if (loaded && !force) return
  loading.value = true
  try {
    const [rolesData, employees] = await Promise.all([
      rolesApi.getAll().catch(() => []),
      rolesApi.getEmployees().catch(() => [])
    ])
    const entities = RoleAssembler.toEntities(rolesData || [], employees || [])
    roles.value = entities.length ? entities : RoleAssembler.defaultRoles()
    loaded = true
  } finally {
    loading.value = false
  }
}

const roleOptions = computed(() =>
  roles.value.map(r => ({ label: r.name, value: r.name, color: r.color, internalName: r.internalName }))
)

// Background/foreground pair derived from the role's own color so every screen (list, detail, filters) renders the same tag.
function getRoleTagStyle(roleName) {
  const role = roles.value.find(r => r.name === roleName)
  const color = role?.color || '#64748b'
  return { backgroundColor: color + '1a', color }
}

function findRoleByName(roleName) {
  return roles.value.find(r => r.name === roleName) || null
}

export function useRoles() {
  return { roles, roleOptions, loading, fetchRoles, getRoleTagStyle, findRoleByName }
}
