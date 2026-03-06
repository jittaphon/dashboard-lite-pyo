import axiosClientAuth from './axiosClientAuth';

const AuthApi = {
  /**
   * Fetch auth URL for a project
   * @param {string} project - Project identifier
   * @returns {Promise} Axios GET promise
   */


  /**
   * ✅ Exchange authorization code for access token
   * @param {Object} data - Token exchange data
   * @returns {Promise} Axios POST promise
   */
  exchangeToken(data) {
    // Point to Domain 2's API
    return axiosClientAuth.post(`/api/v1/oauth2/token`, data);
  },

  /**
   * ✅ Get user information using access token
   * @param {string} token - Access token
   * @returns {Promise} Axios POST promise
   */
  me(token) {
    // Point to Domain 2's API
    return axiosClientAuth.post(`/api/v1/auth/me`, {}, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }
};

export default AuthApi;