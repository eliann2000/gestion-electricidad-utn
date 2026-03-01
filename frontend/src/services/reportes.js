import { apiGet } from "../api";

export const reportesApi = {
  stockBajo: () => apiGet("/api/reportes/stock-bajo"),
};