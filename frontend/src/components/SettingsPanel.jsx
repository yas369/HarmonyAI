import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useState } from "react";

import { useTheme } from "../context/ThemeContext.jsx";

const SettingsPanel = ({ settings, onChange }) => {
  const { theme, toggleTheme } = useTheme();
  const [tempo, setTempo] = useState(settings.defaultTempo);
  const [genre, setGenre] = useState(settings.defaultGenre);
  const [emotion, setEmotion] = useState(settings.defaultEmotion);

  const handleSubmit = (event) => {
    event.preventDefault();
    onChange({ defaultTempo: Number(tempo), defaultGenre: genre, defaultEmotion: emotion });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="glass-card px-6 py-8 flex flex-col gap-6 w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div>
        <h2 className="section-title">Personalize Your Studio</h2>
        <p className="text-white/70 dark:text-black/70">
          Adjust your go-to tempo, preferred genre, and theme to craft a familiar creative space.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <p className="font-medium">Theme</p>
          <button
            type="button"
            className="gradient-button"
            onClick={toggleTheme}
          >
            Switch to {theme === "dark" ? "Light" : "Dark"} Mode
          </button>
        </div>
        <div className="space-y-3">
          <label htmlFor="default-tempo" className="font-medium">
            Default Tempo: {tempo} BPM
          </label>
          <input
            id="default-tempo"
            type="range"
            min="60"
            max="180"
            value={tempo}
            onChange={(event) => setTempo(event.target.value)}
            className="w-full accent-brand-purple"
          />
        </div>
        <div className="space-y-3">
          <label htmlFor="default-genre" className="font-medium">
            Default Genre
          </label>
          <select
            id="default-genre"
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            className="input-field bg-[#181818]/60 dark:bg-white/40"
          >
            {["Carnatic", "Hindustani", "Sufi", "Bollywood Fusion"].map((option) => (
              <option key={option} value={option} className="text-[#111111]">
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          <label htmlFor="default-emotion" className="font-medium">
            Default Emotion
          </label>
          <select
            id="default-emotion"
            value={emotion}
            onChange={(event) => setEmotion(event.target.value)}
            className="input-field bg-[#181818]/60 dark:bg-white/40"
          >
            {["Love", "Devotion", "Celebration", "Sadness", "Calm"].map((option) => (
              <option key={option} value={option} className="text-[#111111]">
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          <p className="font-medium">Export Location</p>
          <div className="glass-card px-4 py-4 text-sm text-white/70 dark:text-black/70">
            Firebase Storage bucket
            <span className="block font-mono text-xs mt-1">harmonyai-e665d.firebasestorage.app</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <motion.button type="submit" className="gradient-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          Save Preferences
        </motion.button>
        <a
          href="#"
          className="rounded-2xl border border-white/20 px-4 py-2 text-sm text-white/70 dark:text-black/70"
          aria-disabled
        >
          📤 Export Data (coming soon)
        </a>
      </div>
    </motion.form>
  );
};

SettingsPanel.propTypes = {
  settings: PropTypes.shape({
    defaultTempo: PropTypes.number.isRequired,
    defaultGenre: PropTypes.string.isRequired,
    defaultEmotion: PropTypes.string.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default SettingsPanel;
