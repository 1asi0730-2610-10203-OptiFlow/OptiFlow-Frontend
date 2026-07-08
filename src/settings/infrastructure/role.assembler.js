import { Role } from '../domain/model/role.entity.js';

// Single source of truth for the 4 roles every optic starts with. Used both as a fallback
// for DB records that don't carry their own displayName/color/permissions, and to seed the
// role catalog for a tenant that hasn't created any roles yet (see defaultRoles()).
const ROLE_MAP = {
    'ADMIN': {
        displayName: 'Administrador',
        description: 'Acceso total al sistema',
        color: '#ef4444',
        permissions: ["settings", "reports", "users", "full_access"]
    },
    'OPTOMETRIST': {
        displayName: 'Optometrista',
        description: 'Historias clínicas, recetas, datos clínicos',
        color: '#8b5cf6',
        permissions: ["dashboard", "clinical", "prescriptions", "appointments"]
    },
    'SALES_ADVISOR': {
        displayName: 'Óptico / Asesor de Ventas',
        description: 'Ventas, inventario, registros de pacientes',
        color: '#3b82f6',
        permissions: ["sales", "inventory", "lab_orders"]
    },
    'RECEPTIONIST': {
        displayName: 'Recepcionista',
        description: 'Citas, registros de pacientes (solo lectura)',
        color: '#10b981',
        permissions: ["appointments"]
    }
};

export class RoleAssembler {
    static toEntity(data, userCount = 0) {
        // Prioritize data from DB, fallback to map
        const metadata = ROLE_MAP[data.name] || {
            displayName: data.displayName || data.name,
            description: data.description || 'Rol del sistema',
            color: data.color || '#64748b',
            permissions: data.permissions || []
        };

        return new Role(
            data.role_id || data.id,
            data.displayName || metadata.displayName,
            data.description || metadata.description,
            userCount,
            data.color || metadata.color,
            data.permissions || metadata.permissions,
            data.name
        );
    }

    static toEntities(roles, employees = []) {
        return roles.map(role => {
            const roleId = role.role_id || role.id;
            const entity = this.toEntity(role, 0);
            let count = employees.filter(emp => emp.role_id === roleId).length;
            if (count === 0) {
                count = employees.filter(emp => emp.role === entity.name).length;
            }
            entity.userCount = count;
            return entity;
        });
    }

    // Baseline roles (Optometrista, Óptico, Administrador, Recepcionista) for a tenant that
    // hasn't configured any roles in the backend yet, so role pickers are never empty.
    static defaultRoles() {
        return Object.entries(ROLE_MAP).map(([internalName, meta], index) =>
            new Role(-(index + 1), meta.displayName, meta.description, 0, meta.color, meta.permissions, internalName)
        );
    }
}
