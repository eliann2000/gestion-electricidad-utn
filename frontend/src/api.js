import { getToken } from "./auth";

function headers(extra) {
  const token = getToken();
  return {
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: headers(body ? { "Content-Type": "application/json" } : null),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return true; // DELETE sin body

  const data = await res.json().catch(async () => ({ message: await res.text().catch(() => "") }));
  if (!res.ok) throw new Error(data?.message || `${method} ${path} -> ${res.status}`);

  return data;
}

export const apiGet = (path) => api(path);
export const apiPost = (path, body) => api(path, { method: "POST", body });
export const apiPut = (path, body) => api(path, { method: "PUT", body });
export const apiDelete = (path) => api(path, { method: "DELETE" });