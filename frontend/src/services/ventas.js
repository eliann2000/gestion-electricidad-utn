import { apiGet, apiPost } from "../api";

export const ventasApi = {
  list: () => apiGet("/ventas"),
  get: (id) => apiGet(`/ventas/${id}`),
  create: (body) => apiPost("/ventas", body),
  anular: (id) => apiPost(`/ventas/${id}/anular`, {}), // si tu anular era PATCH, avisame y lo ajusto
};