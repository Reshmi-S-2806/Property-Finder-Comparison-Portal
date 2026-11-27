import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api.js";

const AppContext = createContext(null);
export const MAX_COMPARE = 3;

export function AppProvider({ children }) {
  const [shortlist, setShortlist] = useState([]); // property ids
  const [compare, setCompare] = useState([]); // property ids
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.getShortlist().then((list) => setShortlist(list.map((p) => p.id))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(t);
  }, [notice]);

  const toggleShortlist = useCallback(async (id) => {
    const has = shortlist.includes(id);
    setShortlist((s) => (has ? s.filter((x) => x !== id) : [...s, id])); // optimistic
    try {
      await (has ? api.removeShortlist(id) : api.addShortlist(id));
    } catch (e) {
      setShortlist((s) => (has ? [...s, id] : s.filter((x) => x !== id)));
      setNotice(e.message);
    }
  }, [shortlist]);

  const toggleCompare = useCallback((id) => {
    setCompare((c) => {
      if (c.includes(id)) return c.filter((x) => x !== id);
      if (c.length >= MAX_COMPARE) {
        setNotice(`You can compare up to ${MAX_COMPARE} properties.`);
        return c;
      }
      return [...c, id];
    });
  }, []);

  const clearCompare = () => setCompare([]);

  return (
    <AppContext.Provider value={{ shortlist, compare, toggleShortlist, toggleCompare, clearCompare, notice }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
