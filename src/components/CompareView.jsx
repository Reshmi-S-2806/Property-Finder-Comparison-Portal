import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, imageUrl, inr } from "../api.js";
import { useApp } from "../context/AppContext.jsx";

// For each row: which value is "best" (lowest or highest)
const ROWS = [
  { label: "Monthly rent", get: (p) => p.monthly_rent, fmt: inr, best: "min" },
  { label: "Deposit", get: (p) => p.deposit, fmt: inr, best: "min" },
  { label: "Size", get: (p) => p.size_sqft, fmt: (v) => `${v.toLocaleString("en-IN")} sq ft`, best: "max" },
  { label: "Rent per sq ft", get: (p) => p.monthly_rent / p.size_sqft, fmt: (v) => `${inr(v)} / sq ft`, best: "min" },
  { label: "First-month cost (rent + deposit)", get: (p) => p.monthly_rent + p.deposit, fmt: inr, best: "min" },
  { label: "Type", get: (p) => p.property_type, fmt: (v) => v },
  { label: "Location", get: (p) => `${p.locality}, ${p.city}`, fmt: (v) => v },
  { label: "Available from", get: (p) => p.available_from || "Now", fmt: (v) => v },
];

export default function CompareView() {
  const { compare, toggleCompare, clearCompare } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (compare.length < 2) { setItems([]); return; }
    setLoading(true);
    setError("");
    api.compare(compare).then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [compare]);

  if (compare.length < 2) {
    return (
      <div className="empty">
        <h2>Pick at least two properties to compare</h2>
        <p>Use the Compare button on any listing. You can compare up to 3.</p>
        <Link className="btn" to="/">Browse properties</Link>
      </div>
    );
  }
  if (loading) return <p className="muted">Loading comparison…</p>;
  if (error) return <p className="error">{error}</p>;

  const bestIndexes = (row) => {
    if (!row.best) return [];
    const vals = items.map(row.get);
    const target = row.best === "min" ? Math.min(...vals) : Math.max(...vals);
    return vals.map((v, i) => (v === target ? i : -1)).filter((i) => i >= 0);
  };

  return (
    <>
      <div className="row-between">
        <h2>Compare properties</h2>
        <button className="btn ghost" onClick={clearCompare}>Clear all</button>
      </div>
      <div className="table-wrap">
        <table className="compare">
          <thead>
            <tr>
              <th></th>
              {items.map((p) => {
                const photo = p.photos.find((x) => x.is_primary) || p.photos[0];
                return (
                  <th key={p.id}>
                    {photo && <img src={imageUrl(photo.url)} alt="" />}
                    <Link to={`/property/${p.id}`}>{p.title}</Link>
                    <br />
                    <button className="link" onClick={() => toggleCompare(p.id)}>Remove</button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const best = bestIndexes(row);
              return (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {items.map((p, i) => (
                    <td key={p.id} className={best.includes(i) ? "best" : ""}>
                      {row.fmt(row.get(p))}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr>
              <th scope="row">Contact</th>
              {items.map((p) => (
                <td key={p.id}>
                  {p.contacts.map((c) => (
                    <div key={c.id}>
                      <strong>{c.name}</strong> ({c.role})<br />
                      {c.phone}
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="hint">Highlighted cells show the best value in each row.</p>
    </>
  );
}
