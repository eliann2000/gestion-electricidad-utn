import { apiGet, apiPost } from "../api";

export const ventasApi = {
  list: () => apiGet("/ventas"),
  get: (id) => apiGet(`/ventas/${id}`),
  create: (body) => apiPost("/ventas", body),
  enviarCorreo: (id, body = {}) => apiPost(`/ventas/${id}/enviar-correo`, body),
  anular: (id) => apiPost(`/ventas/${id}/anular`, {}),
};