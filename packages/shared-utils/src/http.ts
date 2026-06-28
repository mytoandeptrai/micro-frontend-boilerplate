import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from "axios"
import qs from "qs"

type NonNullableObject<T> = {
  [K in keyof T]: T[K] extends object
    ? NonNullableObject<T[K]>
    : NonNullable<T[K]>
}

class HttpInstance {
  private readonly instance: AxiosInstance

  constructor(config?: CreateAxiosDefaults) {
    this.instance = axios.create({
      ...config,
      baseURL: "",
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
      timeout: 10000,
      paramsSerializer: (params) => {
        return qs.stringify(this.cleanParams(params), { arrayFormat: "repeat" })
      },
    })
    this.setupInterceptors(this.instance)
  }

  private isEmpty<T>(value: T): boolean {
    return (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "object" &&
        value !== null &&
        Object.keys(value as object).length === 0)
    )
  }

  private cleanParams<T extends Record<string, unknown>>(
    obj: T,
  ): NonNullableObject<T> {
    const result: Partial<NonNullableObject<T>> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (this.isEmpty(value)) continue
      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        value !== null
      ) {
        const nested = this.cleanParams(value as Record<string, unknown>)
        if (Object.keys(nested).length > 0) {
          result[key as keyof T] = nested as NonNullableObject<T>[keyof T]
        }
      } else {
        result[key as keyof T] = value as NonNullableObject<T>[keyof T]
      }
    }
    return result as NonNullableObject<T>
  }

  private readonly onRequest = (
    config: InternalAxiosRequestConfig,
  ): InternalAxiosRequestConfig => {
    const locale = document?.documentElement?.lang
    if (locale) config.headers["Accept-Language"] = locale
    return config
  }

  private readonly onResponse = (response: AxiosResponse) => response.data

  private readonly onResponseError = (error: AxiosError) => {
    return Promise.reject(error.response?.data ?? error)
  }

  private setupInterceptors(instance: AxiosInstance): void {
    instance.interceptors.request.use(this.onRequest)
    instance.interceptors.response.use(this.onResponse, this.onResponseError)
  }

  public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config)
  }

  public post<T, D = unknown>(
    url: string,
    data: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.instance.post(url, data, config)
  }

  public put<T, D = unknown>(
    url: string,
    data: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.instance.put(url, data, config)
  }

  public patch<T, D = unknown>(
    url: string,
    data: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.instance.patch(url, data, config)
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config)
  }
}

const httpInstance = new HttpInstance()
export default httpInstance
