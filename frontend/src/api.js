//la URL base

//cómo mandar token

//cómo mandar JSON

//cómo manejar errores

import { getToken } from "./auth";

const API_URL = "http://localhost:3001/api";

function headers(extra) { // arma el header que va a tener la request
  const token = getToken(); // busca el token actual
  return {
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}), // si hay token, agrega el header Authorization con el valor Bearer <token>, sino no agrega nada
  };
}

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: headers(body ? { "Content-Type": "application/json" } : null), // llama a la funcion headers
    body: body ? JSON.stringify(body) : undefined, // si hay body, lo convierte a JSON, sino no incluye el campo body en la request
  });

  // en el await se manda el request y lo que trae el backend es el res


  if (res.status === 204) return true; // 204 No Content -> devuelve true para indicar que la operación fue exitosa pero no hay datos que devolver

  const data = await res.json().catch(async () => ({ message: await res.text().catch(() => "") })); // intenta convertir la respuesta a JSON, pero si no se puede (por ejemplo, si la respuesta es un mensaje de error en texto plano), devuelve un objeto con el campo message que contiene el texto de la respuesta. Esto permite manejar errores que no vienen en formato JSON y mostrar el mensaje de error al usuario.
  if (!res.ok) throw new Error(data?.message || `${method} ${path} -> ${res.status}`);

  return data;
}

export const apiGet = (path) => api(path);
export const apiPost = (path, body) => api(path, { method: "POST", body });
export const apiPut = (path, body) => api(path, { method: "PUT", body });
export const apiDelete = (path) => api(path, { method: "DELETE" });