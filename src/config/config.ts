export const CONFIG = {
    API_HOST: 'http://localhost:8080',
    API_VERSION: 'v1',
    DEFAULT_PAGE_SIZE: 10,
} as const;

export const getApiUrl = (endpoint: string) =>
    `${CONFIG.API_HOST}/api/${CONFIG.API_VERSION}${endpoint}`;
