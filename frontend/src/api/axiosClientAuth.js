import axios from 'axios';

const axiosClientAuth = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_Auth,
  headers: {
    'Content-Type': 'application/json',
  },
});



export default axiosClientAuth;
