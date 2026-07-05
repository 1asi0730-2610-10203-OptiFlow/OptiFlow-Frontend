import { BaseApi } from '../../shared/infrastructure/base-api.js';

export class IamApi extends BaseApi {
  constructor() {
    super();
  }

  async signIn(email, password) {
    const response = await this.http.post('/api/v1/authentication/sign-in', { email, password });
    return response.data;
  }

  async signUp(email, password, userType) {
    const response = await this.http.post('/api/v1/authentication/sign-up', { email, password, userType });
    return response.data;
  }

  async googleSignIn(idToken) {
    const response = await this.http.post('/api/v1/authentication/sign-in/google', { idToken });
    return response.data;
  }

  async forgotPassword(email) {
    const response = await this.http.post('/api/v1/authentication/password-recoveries', { email });
    return response.data;
  }

  async resetPassword(token, newPassword) {
    const response = await this.http.post('/api/v1/authentication/password-resets', { token, newPassword });
    return response.data;
  }

  async getUserById(id) {
    const response = await this.http.get(`/api/v1/users/${id}`);
    return response.data;
  }

  async updateUserEmail(id, newEmail) {
    const response = await this.http.put(`/api/v1/users/${id}/email`, { newEmail });
    return response.data;
  }

  async updateUserPassword(id, currentPassword, newPassword) {
    const response = await this.http.put(`/api/v1/users/${id}/password`, { currentPassword, newPassword });
    return response.data;
  }
}
