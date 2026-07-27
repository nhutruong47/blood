import axios, { type AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = axios.create({
  baseURL: 'http://localhost:8080',
});

// Add a request interceptor
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Extended AxiosRequestConfig to support 'body' property used by Orval
type ExtendedAxiosRequestConfig = AxiosRequestConfig & {
  body?: unknown;
};

// This custom instance wraps axios so orval can use it
export const customInstance = <T>(
  config: ExtendedAxiosRequestConfig | string,
  options?: ExtendedAxiosRequestConfig
): Promise<T> => {
  const source = axios.CancelToken.source();

  // Normalize config - handle both string URL and config object
  let requestConfig: ExtendedAxiosRequestConfig;

  if (typeof config === 'string') {
    requestConfig = { url: config, ...options };
  } else {
    requestConfig = { ...config, ...options };
  }

  // Orval uses 'body' but axios uses 'data'
  if (requestConfig.body !== undefined && requestConfig.data === undefined) {
    requestConfig.data = requestConfig.body;
    delete requestConfig.body;
  }

  const promise = AXIOS_INSTANCE({
    ...requestConfig,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise as Promise<T>;
};
