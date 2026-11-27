import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useApp } from "../context/AppContext.jsx";
import PropertyCard from "../components/PropertyCard.jsx";

export default function Shortlist() {
  const { shortlist } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getShortlist().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  // Hide items the user removed while on this page
  const visible = items.filter((p) => shortlist.includes(p.id));

  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <p className="error">{error}</p>;
  if (visible.length === 0)
    return (
      <div className="empty">
        <h2>Your shortlist is empty</h2>
        <p>Tap Shortlist on a property to save it here.</p>
        <Link className="btn" to="/">Browse properties</Link>
      </div>
    );

  return (
    <>
      <h2>Your shortlist ({visible.length})</h2>
      <div className="grid">{visible.map((p) => <PropertyCard key={p.id} property={p} />)}</div>
    </>
  );
}
