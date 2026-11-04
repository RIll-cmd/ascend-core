import { API_BASE_URL } from "@/constants";

// The session token as a Bearer header, for when the API is on another site and the cookie is not sent.
export function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("ascend_session") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetcher<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const customHeaders = (options?.headers || {}) as Record<string, string>;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...customHeaders,
      },
    });

    if (!res.ok) {
      console.warn(`API error for ${endpoint}: ${res.statusText}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn(`Failed to connect to API endpoint ${endpoint}:`, err);
    return null;
  }
}
