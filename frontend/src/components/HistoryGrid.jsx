import PropTypes from "prop-types";
import { Heart, Play, Download } from "lucide-react";

const HistoryGrid = ({ compositions, onFavorite }) => (
  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
    {compositions.map((composition) => (
      <div key={composition.id} className="glass-card px-5 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-xl">{composition.genre} Emotionscape</h3>
            <p className="text-sm text-white/60 dark:text-black/60">
              {composition.emotion} • {composition.tempo} BPM • {new Date(composition.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onFavorite(composition.id)}
            className={`rounded-full border p-2 transition ${
              composition.favorite
                ? "border-brand-highlight bg-brand-highlight/20 text-brand-highlight"
                : "border-white/20 text-white/60 dark:text-black/60 hover:border-brand-purple/60"
            }`}
            aria-label={composition.favorite ? "Unfavorite composition" : "Favorite composition"}
          >
            <Heart className={`size-5 ${composition.favorite ? "fill-current" : ""}`} />
          </button>
        </div>
        {composition.audio ? (
          <audio
            controls
            src={composition.audio}
            className="w-full rounded-2xl"
            preload="none"
          />
        ) : (
          <p className="text-sm text-white/60 dark:text-black/60">
            Audio preview unavailable for this entry.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <a
            href={composition.audio ?? "#"}
            className={`gradient-button flex items-center gap-2 ${
              composition.audio ? "" : "pointer-events-none opacity-60"
            }`}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!composition.audio}
          >
            <Play className="size-4" />
            Play Full Track
          </a>
          <a
            href={composition.audio ?? "#"}
            className={`rounded-2xl border border-white/20 px-4 py-2 flex items-center gap-2 hover:border-brand-purple/50 ${
              composition.audio ? "" : "pointer-events-none opacity-60"
            }`}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!composition.audio}
          >
            <Download className="size-4" />
            Download WAV
          </a>
        </div>
      </div>
    ))}
  </div>
);

HistoryGrid.propTypes = {
  compositions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      emotion: PropTypes.string.isRequired,
      genre: PropTypes.string.isRequired,
      tempo: PropTypes.number.isRequired,
      createdAt: PropTypes.string.isRequired,
      audio: PropTypes.string,
      favorite: PropTypes.bool
    })
  ).isRequired,
  onFavorite: PropTypes.func.isRequired
};

export default HistoryGrid;
