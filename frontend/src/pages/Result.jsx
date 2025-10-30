import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DownloadPanel from "../components/DownloadPanel.jsx";
import FeedbackForm from "../components/FeedbackForm.jsx";
import WaveformPlayer from "../components/WaveformPlayer.jsx";
import { useComposition } from "../context/CompositionContext.jsx";

const ResultPage = () => {
  const { currentResult, emotionThemes } = useComposition();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentResult) {
      navigate("/");
    }
  }, [currentResult, navigate]);

  if (!currentResult) {
    return null;
  }

  const theme = emotionThemes[currentResult.emotion] ?? emotionThemes.Love;

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className={`rounded-[2.5rem] p-10 bg-gradient-to-br ${theme.gradient} shadow-2xl space-y-10`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card px-8 py-10 text-center space-y-4"
        >
          <motion.h2
            className="text-3xl sm:text-4xl font-heading font-bold"
            animate={{ scale: [0.98, 1.02, 0.98] }}
            transition={{ repeat: Infinity, duration: 6 }}
          >
            Your AI-Generated Composition Is Ready!
          </motion.h2>
          <p className="text-white/70 dark:text-black/70 max-w-2xl mx-auto">
            Emotion: <span className="font-semibold">{currentResult.emotion}</span> • Genre: <span className="font-semibold">{currentResult.genre}</span> • Tempo: <span className="font-semibold">{currentResult.tempo} BPM</span>
          </p>
        </motion.div>

        <WaveformPlayer audioUrl={currentResult.audio} emotion={currentResult.emotion} />

        <DownloadPanel files={currentResult} />

        <FeedbackForm compositionId={currentResult.id} initialFeedback={currentResult.feedback} />

        <div className="text-center">
          <button
            type="button"
            className="gradient-button"
            onClick={() => navigate("/")}
          >
            🎵 Compose Another Track
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
