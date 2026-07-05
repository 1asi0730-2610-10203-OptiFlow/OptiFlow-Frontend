import { BaseApi } from '../../shared/infrastructure/base-api.js';

export class RolesApi extends BaseApi {
    constructor() {
        super();
    }

    async getAll() {
        const response = await this.http.get('/roles');
        return response.data;
    }

    async getEmployees() {
        const response = await this.http.get('/employees');
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
