import { Link } from "react-router-dom";
import { imageUrl, inr } from "../api.js";
import { useApp } from "../context/AppContext.jsx";

export default function PropertyCard({ property: p }) {
  const { shortlist, compare, toggleShortlist, toggleCompare } = useApp();
  const photo = p.photos.find((x) => x.is_primary) || p.photos[0];
  const saved = shortlist.includes(p.id);
  const comparing = compare.includes(p.id);

  return (
    <article className="card">
      <Link to={`/property/${p.id}`} className="card-img">
        {photo ? <img src={imageUrl(photo.url)} alt={p.title} loading="lazy" /> : <div className="no-img">No photo</div>}
        <span className="tag">{p.property_type}</span>
      </Link>
      <div className="card-body">
        <h3><Link to={`/property/${p.id}`}>{p.title}</Link></h3>
        <p className="muted">{p.locality}, {p.city}</p>
        <p className="price">{inr(p.monthly_rent)}<small> / month</small></p>
        <p className="muted">{p.size_sqft.toLocaleString("en-IN")} sq ft · Deposit {inr(p.deposit)}</p>
        <div className="actions">
          <button className={`btn ${saved ? "on" : "ghost"}`} onClick={() => toggleShortlist(p.id)} aria-pressed={saved}>
            {saved ? "Shortlisted" : "Shortlist"}
          </button>
          <button className={`btn ${comparing ? "on" : "ghost"}`} onClick={() => toggleCompare(p.id)} aria-pressed={comparing}>
            {comparing ? "Added" : "Compare"}
          </button>
        </div>
      </div>
    </article>
  );
}
