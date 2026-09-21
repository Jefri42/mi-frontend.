/**
 * ============================================================
 * CONFIGURACIÓN DE AXIOS — src/api/axios.js
 * ============================================================
 * Axios es la librería que usamos para hacer peticiones HTTP
 * al backend de Django.
 *
 * Este archivo crea una instancia configurada de Axios con:
 *   - La URL base del backend
 *   - Interceptores para agregar el token JWT automáticamente
 *   - Manejo automático de refresh token cuando expira
 * ============================================================
 */

import axios from 'axios';

// ============================================================
// INSTANCIA BASE DE AXIOS
// Todas las peticiones usarán esta baseURL
// La palabra 'proxy' en package.json redirige /api al puerto 8000
// ============================================================
// La URL del backend se puede sobreescribir con REACT_APP_API_URL
// (por ejemplo http://localhost:8000 al desarrollar en local).
// Si no se define, se usa el backend de producción en Render.
export const API_URL =
  process.env.REACT_APP_API_URL || 'https://ideas-social-backend.onrender.com';

const api = axios.create({
  baseURL: API_URL,  // URL del backend Django
  headers: {
    'Content-Type': 'application/json',
  },
});


// ============================================================
// INTERCEPTOR DE REQUEST
// Se ejecuta ANTES de cada petición.
// Agrega automáticamente el token JWT al header Authorization.
// Sin esto, tendríamos que agregar el token manualmente en cada llamada.
// ============================================================
api.interceptors.request.use(
  (config) => {
    // Obtiene el token del localStorage (donde lo guardamos al hacer login)
    const token = localStorage.getItem('access_token');

    if (token) {
      // Agrega el token en el formato que espera Django: "Bearer <token>"
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// ============================================================
// INTERCEPTOR DE RESPONSE
// Se ejecuta DESPUÉS de cada respuesta.
// Si el servidor responde 401 (token expirado), intenta renovar el token.
// ============================================================
api.interceptors.response.use(
  // Si la respuesta es exitosa, simplemente la retorna
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ¿El error es 401 (no autorizado) y no hemos intentado renovar ya?
    // _retry es una bandera que ponemos nosotros para evitar loops infinitos
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;  // Marca para no reintentar infinitamente

      try {
        const refreshToken = localStorage.getItem('refresh_token');

        // Llama al endpoint de refresh de Django para obtener un nuevo access token
        // Sin refresh token no hay nada que renovar: se cierra sesión directamente.
        if (!refreshToken) throw new Error('No hay refresh token');

        // Se usa axios "pelado" (no la instancia `api`) para que este POST
        // no vuelva a pasar por el interceptor y provoque un bucle.
        // OJO: debe apuntar a API_URL, no a localhost, o en producción falla.
        const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;

        // Guarda el nuevo token
        localStorage.setItem('access_token', newAccessToken);

        // El backend usa ROTATE_REFRESH_TOKENS, así que cada refresh devuelve
        // TAMBIÉN un refresh nuevo. Si no lo guardamos, seguiríamos usando el
        // viejo y la sesión se cortaría al caducar.
        if (response.data.refresh) {
          localStorage.setItem('refresh_token', response.data.refresh);
        }

        // Reintenta la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // El refresh token también expiró → cerrar sesión
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
