import { apiGet, apiPost, apiPut, apiDelete } from "../api";

export const productosApi = {
  list: () => apiGet("/api/productos"),
  get: (id) => apiGet(`/api/productos/${id}`),
  create: (body) => apiPost("/api/productos", body),
  update: (id, body) => apiPut(`/api/productos/${id}`, body),
  remove: (id) => apiDelete(`/api/productos/${id}`),
}; // Para qué: tu UI ya no piensa en rutas, solo llama productosApi.create(...).