import { apiGet, apiPost, apiPut, apiDelete } from "../api";

export const productosApi = {
  list: () => apiGet("/productos"),
  get: (id) => apiGet(`/productos/${id}`),
  create: (body) => apiPost("/productos", body),
  update: (id, body) => apiPut(`/productos/${id}`, body),
  remove: (id) => apiDelete(`/productos/${id}`),
};

// agrupa las llamadas http del modulo productos