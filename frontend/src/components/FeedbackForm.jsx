import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { useComposition } from "../context/CompositionContext.jsx";

const FeedbackForm = ({ compositionId, initialFeedback }) => {
  const { recordFeedback } = useComposition();
  const [rating, setRating] = useState(initialFeedback?.rating ?? 0);
  const [comment, setComment] = useState(initialFeedback?.comment ?? "");
  const [submitted, setSubmitted] = useState(false);

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  const handleSubmit = (event) => {
    event.preventDefault();
    recordFeedback(compositionId, { rating, comment: comment.trim() });
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card px-6 py-6 space-y-4 w-full max-w-3xl mx-auto">
      <div>
        <h3 className="section-title text-2xl">How does this melody feel?</h3>
        <p className="text-sm text-white/60 dark:text-black/60">Share your impressions to help HarmonyAI improve.</p>
      </div>
      <div className="flex items-center justify-center gap-3">
        {stars.map((value) => (
          <motion.button
            type="button"
            key={value}
            onClick={() => setRating(value)}
            whileTap={{ scale: 0.9 }}
            className="p-2"
            aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
          >
            <Star
              className={`size-8 transition ${
                rating >= value ? "fill-brand-highlight text-brand-highlight" : "text-white/40 dark:text-black/40"
              }`}
            />
          </motion.button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Leave a few words about the mood, instrumentation, or emotion..."
        className="input-field min-h-[120px] text-sm"
      />
      <motion.button
        type="submit"
        className="gradient-button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        Submit Feedback
      </motion.button>
      {submitted ? (
        <p className="text-center text-sm text-brand-highlight">Thank you for your feedback!</p>
      ) : null}
    </form>
  );
};

FeedbackForm.propTypes = {
  compositionId: PropTypes.string,
  initialFeedback: PropTypes.shape({
    rating: PropTypes.number,
    comment: PropTypes.string
  })
};

export default FeedbackForm;
