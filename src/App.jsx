import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import PropertyDetail from "./pages/PropertyDetail.jsx";
import Shortlist from "./pages/Shortlist.jsx";
import CompareView from "./components/CompareView.jsx";
import { useApp } from "./context/AppContext.jsx";

export default function App() {
  const { shortlist, compare, clearCompare, notice } = useApp();
  const { pathname } = useLocation();

  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand">Property Finder</Link>
        <nav>
          <NavLink to="/" end>Search</NavLink>
          <NavLink to="/shortlist">Shortlist ({shortlist.length})</NavLink>
          <NavLink to="/compare">Compare ({compare.length})</NavLink>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/shortlist" element={<Shortlist />} />
          <Route path="/compare" element={<CompareView />} />
        </Routes>
      </main>

      {compare.length > 0 && pathname !== "/compare" && (
        <div className="tray">
          <span>{compare.length} selected for comparison</span>
          <div>
            <button className="btn ghost" onClick={clearCompare}>Clear</button>
            <Link className={`btn ${compare.length < 2 ? "disabled" : ""}`} to={compare.length < 2 ? "#" : "/compare"}>
              Compare now
            </Link>
          </div>
        </div>
      )}

      {notice && <div className="toast" role="status">{notice}</div>}
    </>
  );
}
