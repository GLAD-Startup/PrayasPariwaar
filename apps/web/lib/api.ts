/**
 * Universal client-side API path resolver
 * Automatically handles subpath hosting (/prayas) in production and localhost
 */
export function apiPath(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/prayas") && !cleanEndpoint.startsWith("/prayas")) {
      return `/prayas${cleanEndpoint}`;
    }
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/prayas";
  if (basePath && !cleanEndpoint.startsWith(basePath)) {
    return `${basePath}${cleanEndpoint}`;
  }

  return cleanEndpoint;
}

export async function apiFetch(endpoint: string, init?: RequestInit): Promise<Response> {
  const url = apiPath(endpoint);
  return fetch(url, init);
}
