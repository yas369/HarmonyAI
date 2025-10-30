import { motion } from "framer-motion";
import PropTypes from "prop-types";

const LoaderScreen = ({ stageMessage }) => (
  <div className="flex flex-col items-center justify-center gap-8 text-center py-24">
    <div className="glass-card px-8 py-10 flex flex-col items-center gap-6 max-w-xl">
      <motion.div
        className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-purple via-brand-aqua to-brand-highlight flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
      >
        <motion.div
          className="w-24 h-24 rounded-full bg-[#0D0D0D]/80 flex items-center justify-center"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        >
          🎧
        </motion.div>
      </motion.div>
      <div className="space-y-3">
        <h2 className="section-title">Generating Your Composition...</h2>
        <p className="text-base text-white/70 dark:text-black/70">
          {stageMessage}
        </p>
        <p className="text-xs uppercase tracking-widest text-white/40 dark:text-black/40">
          This may take 15–30 seconds
        </p>
      </div>
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.span
            key={index}
            className="size-2.5 rounded-full bg-white/40"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: index * 0.15 }}
          />
        ))}
      </div>
    </div>
  </div>
);

LoaderScreen.propTypes = {
  stageMessage: PropTypes.string.isRequired
};

export default LoaderScreen;
