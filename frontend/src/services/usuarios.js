import { apiGet, apiPost, apiPut, apiDelete } from "../api";

export const usuariosApi = {
    list: () => apiGet("/api/usuarios"),
    create: (body) => apiPost("/api/usuarios", body),
    update: (id, body) => apiPut(`/api/usuarios/${id}`, body),
    remove: (id) => apiDelete(`/api/usuarios/${id}`),
};