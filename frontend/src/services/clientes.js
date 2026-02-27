import { apiGet, apiPost, apiPut, apiDelete } from "../api";

export const clientesApi = {
  list: () => apiGet("/api/clientes"),
  get: (id) => apiGet(`/api/clientes/${id}`),
  create: (body) => apiPost("/api/clientes", body),
  update: (id, body) => apiPut(`/api/clientes/${id}`, body),
  remove: (id) => apiDelete(`/api/clientes/${id}`),
};