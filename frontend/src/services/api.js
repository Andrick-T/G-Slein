const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const TOKEN_KEY = "g_slein_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message: "Invalid response from server.",
    };
  }

  if (!response.ok) {
    const error = new Error(
      data.message || "Something went wrong with the request.",
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

export const api = {
  get: (endpoint, options = {}) =>
    request(endpoint, {
      ...options,
      method: "GET",
    }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (endpoint, options = {}) =>
    request(endpoint, {
      ...options,
      method: "DELETE",
    }),
};

export default api;
