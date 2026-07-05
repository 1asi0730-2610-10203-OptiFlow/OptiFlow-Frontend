import { Role } from '../domain/model/role.entity.js';

const ROLE_MAP = {
    'ADMIN': {
        displayName: 'Administrador',
        description: 'Acceso total al sistema',
        color: '#ef4444'
    },
    'OPTOMETRIST': {
        displayName: 'Optometrista',
        description: 'Historias clínicas, recetas, datos clínicos',
        color: '#8b5cf6'
    },
    'SALES_ADVISOR': {
        displayName: 'Óptico / Asesor de Ventas',
        description: 'Ventas, inventario, registros de pacientes',
        color: '#3b82f6'
    },
    'RECEPTIONIST': {
        displayName: 'Recepcionista',
        description: 'Citas, registros de pacientes (solo lectura)',
        color: '#10b981'
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

        let permissions = data.permissions;
        if (!permissions) {
            if (data.name === 'ADMIN') {
                permissions = ["settings", "reports", "users", "full_access"];
            } else if (data.name === 'OPTOMETRIST') {
                permissions = ["dashboard", "clinical", "prescriptions", "appointments"];
            } else if (data.name === 'SALES_ADVISOR') {
                permissions = ["sales", "inventory", "lab_orders"];
            } else if (data.name === 'RECEPTIONIST') {
                permissions = ["appointments"];
            } else {
                permissions = [];
            }
        }

        return new Role(
            data.role_id || data.id,
            data.displayName || metadata.displayName,
            data.description || metadata.description,
            userCount,
            data.color || metadata.color,
            permissions,
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
}
