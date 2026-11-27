const FIELDS = [
  { key: "min_size", label: "Min size (sq ft)" },
  { key: "max_size", label: "Max size (sq ft)" },
  { key: "min_rent", label: "Min rent (₹/month)" },
  { key: "max_rent", label: "Max rent (₹/month)" },
  { key: "max_deposit", label: "Max deposit (₹)" },
  { key: "budget", label: "Monthly budget (₹)" },
];

export default function FilterBar({ filters, onChange, onReset }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <section className="filters" aria-label="Filters">
      <label>
        City or area
        <input value={filters.city} onChange={set("city")} placeholder="Chennai" />
      </label>
      <label>
        Property type
        <select value={filters.property_type} onChange={set("property_type")}>
          <option value="">All types</option>
          <option value="office">Office</option>
          <option value="shop">Shop</option>
          <option value="warehouse">Warehouse</option>
        </select>
      </label>
      {FIELDS.map((f) => (
        <label key={f.key}>
          {f.label}
          <input type="number" min="0" value={filters[f.key]} onChange={set(f.key)} />
        </label>
      ))}
      <label>
        Sort by
        <select value={filters.sort} onChange={set("sort")}>
          <option value="rent_asc">Rent: low to high</option>
          <option value="rent_desc">Rent: high to low</option>
          <option value="size_desc">Size: large to small</option>
          <option value="size_asc">Size: small to large</option>
          <option value="newest">Newest first</option>
        </select>
      </label>
      <button className="btn ghost" onClick={onReset}>Reset filters</button>
      <p className="hint">Budget shows places where rent is within budget and the deposit is within 6 months of it.</p>
    </section>
  );
}
