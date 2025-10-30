import { useMemo, useState } from "react";

import HistoryGrid from "../components/HistoryGrid.jsx";
import { useComposition } from "../context/CompositionContext.jsx";

const HistoryPage = () => {
  const { history, toggleFavorite } = useComposition();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return history;
    }
    const normalized = query.trim().toLowerCase();
    return history.filter(
      (item) =>
        item.emotion.toLowerCase().includes(normalized) ||
        item.genre.toLowerCase().includes(normalized)
    );
  }, [history, query]);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-heading font-bold">My Compositions</h1>
        <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl">
          Revisit every melody you've generated. Filter by emotion or genre, replay the magic, and favorite the ones that move you.
        </p>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by emotion or genre..."
          className="input-field max-w-md"
        />
      </header>
      {filtered.length ? (
        <HistoryGrid compositions={filtered} onFavorite={toggleFavorite} />
      ) : (
        <div className="glass-card px-6 py-10 text-center text-zinc-600 dark:text-zinc-300">
          No compositions yet. Generate a track to see it here!
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
