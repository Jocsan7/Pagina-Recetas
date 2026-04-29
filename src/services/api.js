const API_BASE = "/api";

async function request(path, options = {}) {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    ...rest
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Ocurrio un error en la solicitud.");
  }

  return data;
}

export const api = {
  health: () => request("/health"),
  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getCategories: () => request("/categories"),
  getRecipes: (categoryId = "all") =>
    request(`/recipes${categoryId === "all" ? "" : `?categoryId=${categoryId}`}`),
  getCart: (token) => request("/cart", { token }),
  addToCart: (payload, token) =>
    request("/cart/items", {
      method: "POST",
      body: JSON.stringify(payload),
      token
    }),
  updateCartItem: (id, payload, token) =>
    request(`/cart/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      token
    }),
  removeCartItem: (id, token) =>
    request(`/cart/items/${id}`, {
      method: "DELETE",
      token
    }),
  checkout: (token) =>
    request("/orders/checkout", {
      method: "POST",
      token
    }),
  admin: {
    getUsers: (token) => request("/admin/users", { token }),
    createUser: (payload, token) =>
      request("/admin/users", {
        method: "POST",
        body: JSON.stringify(payload),
        token
      }),
    updateUser: (id, payload, token) =>
      request(`/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        token
      }),
    deleteUser: (id, token) =>
      request(`/admin/users/${id}`, {
        method: "DELETE",
        token
      }),
    createCategory: (payload, token) =>
      request("/admin/categories", {
        method: "POST",
        body: JSON.stringify(payload),
        token
      }),
    updateCategory: (id, payload, token) =>
      request(`/admin/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        token
      }),
    deleteCategory: (id, token) =>
      request(`/admin/categories/${id}`, {
        method: "DELETE",
        token
      }),
    createRecipe: (payload, token) =>
      request("/admin/recipes", {
        method: "POST",
        body: JSON.stringify(payload),
        token
      }),
    updateRecipe: (id, payload, token) =>
      request(`/admin/recipes/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        token
      }),
    deleteRecipe: (id, token) =>
      request(`/admin/recipes/${id}`, {
        method: "DELETE",
        token
      })
  }
};
