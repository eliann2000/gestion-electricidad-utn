import { apiGet, apiPost, apiPut, apiDelete } from "../api";

export const clientesApi = {
  list: () => apiGet("/clientes"),
  get: (id) => apiGet(`/clientes/${id}`),
  create: (body) => apiPost("/clientes", body),
  update: (id, body) => apiPut(`/clientes/${id}`, body),
  remove: (id) => apiDelete(`/lientes/${id}`),
};