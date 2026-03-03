import { getToken } from "./auth";

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGet(path) {
  const res = await fetch(path, { headers: authHeaders() });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} -> ${res.status}: ${text}`);
  }
  return res.json();
}

export async function apiPut(path, body) {
  const res = await fetch(path, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PUT ${path} -> ${res.status}: ${text}`);
  }
  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(path, { method: "DELETE", headers: authHeaders() });

  // si tu backend devuelve 204, esto es OK
  if (res.status === 204) return true;

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DELETE ${path} -> ${res.status}: ${text}`);
  }

  return true;
}