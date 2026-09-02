/**
 * Universal client-side API path resolver
 * Automatically handles subpath hosting (NEXT_PUBLIC_BASE_PATH) in production and localhost
 */
export function apiPath(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (typeof window !== "undefined" && basePath) {
    if (window.location.pathname.startsWith(basePath) && !cleanEndpoint.startsWith(basePath)) {
      return `${basePath}${cleanEndpoint}`;
    }
  }

  if (basePath && !cleanEndpoint.startsWith(basePath)) {
    return `${basePath}${cleanEndpoint}`;
  }

  return cleanEndpoint;
}

export async function apiFetch(endpoint: string, init?: RequestInit): Promise<Response> {
  const url = apiPath(endpoint);
  return fetch(url, init);
}

