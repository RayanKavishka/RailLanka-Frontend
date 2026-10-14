import axios, { AxiosError } from "axios";
import { getNewAccessToken } from "./authService";

const api = axios.create({
  baseURL: "http://localhost:5001/api/v1",
});

const PUBLIC_APIS = ["/auth/register", "/auth/login", "/auth/access-token"];

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("ACCESS_TOKEN");

  const isPublicURL = PUBLIC_APIS.some((URL) => {
    return config?.url?.includes(URL);
  });

  if (!isPublicURL && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});



api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    const isPublic = PUBLIC_APIS.some((url) => {
      originalRequest.url?.includes(url);
    });

    if (
      error.response?.status === 401 &&
      !originalRequest._isRefresh &&
      !isPublic
    ) {
      originalRequest._isRefresh = true;

      try {
        const refreshToken = localStorage.getItem("REFRESH_TOKEN") as string;
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const refreshResponse = await getNewAccessToken(refreshToken);
        const newAccessToken = refreshResponse.data.body.accessToken;

        localStorage.setItem("ACCESS_TOKEN", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axios(originalRequest);

      } catch (err) {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
       
        window.location.href = "/login";

        console.error(err);
        return Promise.reject(error);
      }

    }
    return Promise.reject(error);
  },
);

export default api;
