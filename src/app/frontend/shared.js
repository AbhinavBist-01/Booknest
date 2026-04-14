export function setToken(token) {
  localStorage.setItem("accessToken", token);
}

export function getToken() {
  return localStorage.getItem("accessToken") || "";
}

export function clearToken() {
  localStorage.removeItem("accessToken");
}

export async function api(path, options = {}) {
  const headers = options.headers || {};
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(path, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export function print(node, payload) {
  node.textContent =
    typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
}
