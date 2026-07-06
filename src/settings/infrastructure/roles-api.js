import { BaseApi } from '../../shared/infrastructure/base-api.js';

export class RolesApi extends BaseApi {
    constructor() {
        super();
    }

    // Roles defined for the current optic.
    async getAll() {
        const response = await this.http.get('/roles');
        return response.data;
    }

    // Real staff of the current optic (used to count members per role).
    async getEmployees() {
        const response = await this.http.get('/staff');
        return response.data;
    }

    // The optic (business) of the current account.
    async getBusiness() {
        const response = await this.http.get('/api/v1/accounts/me');
        return response.data;
    }

    async create(role) {
        const response = await this.http.post('/roles', role);
        return response.data;
    }

    async update(id, role) {
        const response = await this.http.put(`/roles/${id}`, role);
        return response.data;
    }

    async delete(id) {
        await this.http.delete(`/roles/${id}`);
    }
}
