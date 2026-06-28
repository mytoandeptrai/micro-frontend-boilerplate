import { type AxiosRequestConfig, type CreateAxiosDefaults } from "axios"
declare class HttpInstance {
  private readonly instance
  constructor(config?: CreateAxiosDefaults)
  private isEmpty
  private cleanParams
  private readonly onRequest
  private readonly onResponse
  private readonly onResponseError
  private setupInterceptors
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T, D = unknown>(
    url: string,
    data: D,
    config?: AxiosRequestConfig,
  ): Promise<T>
  put<T, D = unknown>(
    url: string,
    data: D,
    config?: AxiosRequestConfig,
  ): Promise<T>
  patch<T, D = unknown>(
    url: string,
    data: D,
    config?: AxiosRequestConfig,
  ): Promise<T>
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>
}
declare const httpInstance: HttpInstance
export default httpInstance
