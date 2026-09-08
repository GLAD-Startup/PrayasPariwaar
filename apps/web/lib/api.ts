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
  const res = await fetch(url, init);

  if (res.status === 401 && typeof window !== "undefined") {
    const isInsideAdmin = window.location.pathname.includes("/admin");
    const isLoginPage = window.location.pathname.includes("/admin/login");
    if (isInsideAdmin && !isLoginPage) {
      window.location.href = apiPath("/admin/login?error=session_expired");
    }
  }

  return res;
}

/**
 * Universal static asset path resolver
 * Automatically prepends NEXT_PUBLIC_BASE_PATH when configured so that Next.js
 * Image optimization API and static tags can locate local assets without 404 errors.
 */
export function assetPath(path?: string | null): string {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
  if (!rawBasePath) {
    return cleanPath;
  }

  const basePath = rawBasePath.startsWith("/") ? rawBasePath : `/${rawBasePath}`;
  if (cleanPath === basePath || cleanPath.startsWith(`${basePath}/`)) {
    return cleanPath;
  }

  return `${basePath}${cleanPath}`;
}

