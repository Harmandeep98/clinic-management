import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

class HttpClient {
  private client: AxiosInstance;

  constructor(config?: AxiosRequestConfig) {
    this.client = axios.create({
      timeout: 8000,
      ...config,
    });

    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        throw this.normalizeError(error);
      },
    );
  }

  private normalizeError(error: any) {
    return {
      message: error?.response?.data?.message || error.message,
      status: error?.response?.status,
      data: error?.response?.data,
    };
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

export const httpClient = new HttpClient();
