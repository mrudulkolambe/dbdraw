// src/services/base.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuth } from '@clerk/nextjs';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  status: number;
}

export class BaseApiService {
  private axiosInstance: AxiosInstance;
  private getTokenFn: (() => Promise<string | null>) | null = null;
  
  constructor(getTokenFn?: () => Promise<string | null>) {
    this.getTokenFn = getTokenFn || null;
    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setTokenFunction(getTokenFn: () => Promise<string | null>) {
    this.getTokenFn = getTokenFn;
  }

  private transformResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      data: response.data.data || response.data,
      message: response.data.message,
      success: response.status >= 200 && response.status < 300,
      status: response.status,
    };
  }

  protected async request<T = any>(
    url: string,
    config: AxiosRequestConfig = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    // Get fresh token before every request
    const token = await this.getToken();
    try {
      const response = await this.axiosInstance.request<T>({
        url,
        ...config,
        headers: {
          ...config.headers,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      return this.transformResponse<T>(response);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle 401/403 status code - retry once with fresh token
        if ((error.response.status === 401 || error.response.status === 403) && retryCount === 0) {
          console.log("Retrying request with fresh token for status:", error.response.status);
          return this.request<T>(url, config, retryCount + 1);
        }
        
        return {
          data: error.response.data,
          message: error.response.data?.message || error.message,
          success: false,
          status: error.response.status,
        };
      }
      throw error;
    }
  }

  private async getToken(): Promise<string | null> {
    if (this.getTokenFn) {
      try {
        return await this.getTokenFn();
      } catch (error) {
        console.error('Failed to get token:', error);
        return null;
      }
    }
    return null;
  }

  protected async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' }, 0);
  }

  protected async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { 
      ...config, 
      method: 'POST', 
      data 
    }, 0);
  }

  protected async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { 
      ...config, 
      method: 'PUT', 
      data 
    }, 0);
  }

  protected async delete<T = any>(url: string,   data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' , data}, 0);
  }

  protected async patch<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { 
      ...config, 
      method: 'PATCH', 
      data 
    }, 0);
  }
}
