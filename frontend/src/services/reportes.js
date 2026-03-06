import { apiGet } from "../api";

export const reportesApi = {
  stockBajo: () => apiGet("/reportes/stock-bajo"),
};