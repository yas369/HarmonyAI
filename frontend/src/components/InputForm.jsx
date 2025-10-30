import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

import { useComposition } from "../context/CompositionContext.jsx";

const emotionOptions = ["Love", "Devotion", "Celebration", "Sadness", "Calm"];
const genreOptions = ["Carnatic", "Hindustani", "Sufi", "Bollywood Fusion"];

const InputForm = ({ onSubmit, initialTempo, initialGenre, initialEmotion }) => {
  const textareaRef = useRef(null);
  const { isGenerating } = useComposition();
  const [lyrics, setLyrics] = useState("");
  const [emotion, setEmotion] = useState(initialEmotion);
  const [genre, setGenre] = useState(initialGenre);
  const [tempo, setTempo] = useState(initialTempo);
  const [error, setError] = useState(null);

  useEffect(() => {
    setEmotion(initialEmotion);
  }, [initialEmotion]);

  useEffect(() => {
    setGenre(initialGenre);
  }, [initialGenre]);

  useEffect(() => {
    setTempo(initialTempo);
  }, [initialTempo]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [lyrics]);

  const lyricWordCount = useMemo(() => lyrics.trim().split(/\s+/).filter(Boolean).length, [lyrics]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!lyrics.trim()) {
      setError("Please enter lyrics or poetic lines.");
      return;
    }
    if (lyricWordCount > 200) {
      setError("Lyrics must be within 200 words.");
      return;
    }
    setError(null);
    onSubmit({ lyrics: lyrics.trim(), emotion, genre, tempo: Number(tempo) });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="glass-card px-6 sm:px-10 py-8 flex flex-col gap-6 w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-3">
        <label htmlFor="lyrics" className="font-heading text-lg">
          Lyrics or Poetic Lines
        </label>
        <textarea
          id="lyrics"
          ref={textareaRef}
          value={lyrics}
          onChange={(event) => setLyrics(event.target.value)}
          placeholder="Enter your lyrics or a few poetic lines…"
          className="input-field min-h-[140px] resize-none text-base leading-relaxed"
          maxLength={1600}
          disabled={isGenerating}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/50 dark:text-black/50">
          <span>{lyricWordCount} / 200 words</span>
          {error ? <span className="text-red-400">{error}</span> : null}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="emotion" className="font-medium text-sm uppercase tracking-wide text-white/60 dark:text-black/60">
            Emotion
          </label>
          <select
            id="emotion"
            value={emotion}
            onChange={(event) => setEmotion(event.target.value)}
            className="input-field bg-[#181818]/60 dark:bg-white/40 text-base"
            disabled={isGenerating}
          >
            {emotionOptions.map((option) => (
              <option key={option} value={option} className="text-[#111111]">
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="genre" className="font-medium text-sm uppercase tracking-wide text-white/60 dark:text-black/60">
            Genre
          </label>
          <select
            id="genre"
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            className="input-field bg-[#181818]/60 dark:bg-white/40 text-base"
            disabled={isGenerating}
          >
            {genreOptions.map((option) => (
              <option key={option} value={option} className="text-[#111111]">
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="tempo" className="font-medium text-sm uppercase tracking-wide text-white/60 dark:text-black/60">
            Tempo: {tempo} BPM
          </label>
          <input
            id="tempo"
            type="range"
            min="60"
            max="180"
            step="1"
            value={tempo}
            onChange={(event) => setTempo(event.target.value)}
            className="w-full accent-brand-purple"
            disabled={isGenerating}
          />
        </div>
      </div>
      <motion.button
        type="submit"
        className="gradient-button self-start"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        disabled={isGenerating}
      >
        🎼 Generate My Track
      </motion.button>
    </motion.form>
  );
};

InputForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialTempo: PropTypes.number.isRequired,
  initialGenre: PropTypes.string.isRequired,
  initialEmotion: PropTypes.string.isRequired
};

export default InputForm;
