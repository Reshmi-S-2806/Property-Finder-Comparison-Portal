import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, imageUrl, inr } from "../api.js";
import { useApp } from "../context/AppContext.jsx";

export default function PropertyDetail() {
  const { id } = useParams();
  const { shortlist, compare, toggleShortlist, toggleCompare } = useApp();
  const [p, setP] = useState(null);
  const [active, setActive] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    setP(null);
    setActive(0);
    api.getProperty(id).then(setP).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!p) return <p className="muted">Loading…</p>;

  const pid = p.id;
  return (
    <>
      <Link to="/" className="link">Back to search</Link>
      <div className="detail">
        <div>
          {p.photos.length > 0 && (
            <>
              <img className="hero" src={imageUrl(p.photos[active].url)} alt={p.title} />
              <div className="thumbs">
                {p.photos.map((ph, i) => (
                  <button key={ph.id} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`} className={i === active ? "sel" : ""}>
                    <img src={imageUrl(ph.url)} alt="" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div>
          <h1>{p.title}</h1>
          <p className="muted">{p.address}</p>
          <p className="price">{inr(p.monthly_rent)}<small> / month</small></p>
          <dl className="facts">
            <dt>Size</dt><dd>{p.size_sqft.toLocaleString("en-IN")} sq ft</dd>
            <dt>Rent per sq ft</dt><dd>{inr(p.monthly_rent / p.size_sqft)}</dd>
            <dt>Deposit</dt><dd>{inr(p.deposit)}</dd>
            <dt>Type</dt><dd>{p.property_type}</dd>
            <dt>Available from</dt><dd>{p.available_from || "Now"}</dd>
          </dl>
          <p>{p.description}</p>
          <div className="actions">
            <button className={`btn ${shortlist.includes(pid) ? "on" : "ghost"}`} onClick={() => toggleShortlist(pid)}>
              {shortlist.includes(pid) ? "Shortlisted" : "Shortlist"}
            </button>
            <button className={`btn ${compare.includes(pid) ? "on" : "ghost"}`} onClick={() => toggleCompare(pid)}>
              {compare.includes(pid) ? "Added to compare" : "Compare"}
            </button>
          </div>
          <h2>Contact</h2>
          {p.contacts.length === 0 && <p className="muted">No contact details added.</p>}
          {p.contacts.map((c) => (
            <p key={c.id}>
              <strong>{c.name}</strong> ({c.role})<br />
              {c.phone && <a href={`tel:${c.phone}`}>{c.phone}</a>}
              {c.email && <> · <a href={`mailto:${c.email}`}>{c.email}</a></>}
            </p>
          ))}
        </div>
      </div>
    </>
  );
}
