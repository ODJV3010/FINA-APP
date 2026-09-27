import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

/*
  Agregar el access token
  automáticamente a cada petición.
*/

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

/*
  Renovar el access token
  cuando Django responda 401.
*/

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    /*
      Si el error no es 401,
      simplemente lo devolvemos.
    */

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    /*
      Evitar intentar renovar
      la misma petición infinitamente.
    */

    if (originalRequest._retry) {
      localStorage.removeItem("accessToken");

      localStorage.removeItem("refreshToken");

      localStorage.removeItem("username");

      window.location.href = "/login";

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem("refreshToken");

    /*
      Si no existe refresh token,
      cerrar sesión.
    */

    if (!refreshToken) {
      localStorage.removeItem("accessToken");

      localStorage.removeItem("refreshToken");

      localStorage.removeItem("username");

      window.location.href = "/login";

      return Promise.reject(error);
    }

    try {
      /*
        Pedimos un nuevo access token
        directamente a Django.
      */

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh/`,
        { refresh: refreshToken },
      );
      const newAccessToken = response.data.access;

      /*
        Guardar el nuevo access token.
      */

      localStorage.setItem("accessToken", newAccessToken);

      /*
        Actualizar el header
        de la petición original.
      */

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      /*
        Repetir automáticamente
        la petición que había fallado.
      */

      return api(originalRequest);
    } catch (refreshError) {
      /*
        Si el refresh token también
        expiró o fue invalidado,
        eliminamos la sesión.
      */

      localStorage.removeItem("accessToken");

      localStorage.removeItem("refreshToken");

      localStorage.removeItem("username");

      window.location.href = "/login";

      return Promise.reject(refreshError);
    }
  },
);

export default api;
