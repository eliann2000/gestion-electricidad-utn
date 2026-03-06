import { apiGet, apiPost, apiPut, apiDelete } from "../api";

export const marcasApi = {
    listar: () => apiGet("/marcas"),
    obtener: (id) => apiGet(`/marcas/${id}`),
    crear: (data) => apiPost("/marcas", data),
    actualizar: (id, data) => apiPut(`/marcas/${id}`, data),
    eliminar: (id) => apiDelete(`/marcas/${id}`),
};