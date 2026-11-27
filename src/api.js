const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function sessionId() {
  let id = localStorage.getItem("pf_session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("pf_session", id);
  }
  return id;
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "X-Session-Id": sessionId(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") msg = body.detail;
    } catch {}
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

export const imageUrl = (url) => (!url ? "" : url.startsWith("/") ? `${BASE}${url}` : url);

export const api = {
  searchProperties(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== "" && v != null) params.set(k, v);
    });
    return request(`/properties?${params}`);
  },
  getProperty: (id) => request(`/properties/${id}`),
  compare: (ids) => request(`/properties/compare?ids=${ids.join(",")}`),
  getShortlist: () => request("/shortlist"),
  addShortlist: (id) => request(`/shortlist/${id}`, { method: "POST" }),
  removeShortlist: (id) => request(`/shortlist/${id}`, { method: "DELETE" }),
};

export const inr = (n) => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
