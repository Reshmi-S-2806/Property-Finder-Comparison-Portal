import { useEffect, useState } from "react";
import { api } from "../api.js";
import FilterBar from "../components/FilterBar.jsx";
import PropertyCard from "../components/PropertyCard.jsx";

const EMPTY = {
  city: "", property_type: "", min_size: "", max_size: "",
  min_rent: "", max_rent: "", max_deposit: "", budget: "", sort: "rent_asc",
};

function useDebounce(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function Home() {
  const [filters, setFilters] = useState(EMPTY);
  const debounced = useDebounce(filters, 400);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => setPage(1), [debounced]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api.searchProperties({ ...debounced, page, limit: 12 })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [debounced, page]);

  const pages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <div className="layout">
      <FilterBar filters={filters} onChange={setFilters} onReset={() => setFilters(EMPTY)} />
      <section>
        <p className="muted">{loading ? "Searching…" : `${data.total} properties found`}</p>
        {error && <p className="error">Could not load properties: {error}</p>}
        {!loading && !error && data.items.length === 0 && (
          <div className="empty"><h2>No properties match</h2><p>Try widening the rent or size range.</p></div>
        )}
        <div className="grid">
          {data.items.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
        {pages > 1 && (
          <div className="pager">
            <button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page} of {pages}</span>
            <button className="btn ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </section>
    </div>
  );
}
