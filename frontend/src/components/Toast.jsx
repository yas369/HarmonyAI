import { AnimatePresence, motion } from "framer-motion";
import PropTypes from "prop-types";

import { useTheme } from "../context/ThemeContext.jsx";

const toneClasses = {
  info: { light: "bg-white/90 text-[#111111]", dark: "bg-[#181818]/85 text-white" },
  success: { light: "bg-emerald-500/90 text-white", dark: "bg-emerald-500/90 text-white" },
  error: { light: "bg-red-500/90 text-white", dark: "bg-red-500/90 text-white" }
};

const Toast = ({ toast }) => {
  const { theme } = useTheme();

  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            className={`rounded-2xl px-6 py-3 shadow-xl backdrop-blur-md ${
              (toneClasses[toast.tone] ?? toneClasses.info)[theme] ?? toneClasses.info.dark
            }`}
          >
            {toast.message}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

Toast.propTypes = {
  toast: PropTypes.shape({
    message: PropTypes.string,
    tone: PropTypes.oneOf(["info", "success", "error"])
  })
};

export default Toast;
