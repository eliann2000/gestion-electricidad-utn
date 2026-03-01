import { apiGet, apiPost } from "../api";

export const ventasApi = {
  list: () => apiGet("/api/ventas"),
  get: (id) => apiGet(`/api/ventas/${id}`),
  create: (body) => apiPost("/api/ventas", body),
  anular: (id) => apiPost(`/api/ventas/${id}/anular`, {}), // si tu anular era PATCH, avisame y lo ajusto
};