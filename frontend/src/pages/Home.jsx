import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import InputForm from "../components/InputForm.jsx";
import { useComposition } from "../context/CompositionContext.jsx";

const HomePage = () => {
  const navigate = useNavigate();
  const { generateComposition, settings, isGenerating } = useComposition();

  const handleGenerate = async (payload) => {
    navigate("/generating");
    const result = await generateComposition(payload);
    if (result.success) {
      navigate("/result");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="space-y-12">
      <motion.section
        className="glass-card px-8 py-10 text-center space-y-4 mx-auto max-w-5xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.p
          className="text-sm uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-300"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          Indian Musical Heritage, Reimagined
        </motion.p>
        <h1 className="text-4xl sm:text-5xl font-heading font-bold">
          Compose Music from Emotion & Words
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-zinc-600 dark:text-zinc-300">
          HarmonyAI transforms your lyrics into melodies inspired by Carnatic, Hindustani, Sufi, and Bollywood traditions.
          Describe the mood, set the tempo, and let our AI orchestra weave a bespoke sonic journey.
        </p>
        <motion.button
          onClick={() => {
            const anchor = document.getElementById("composer-form");
            anchor?.scrollIntoView({ behavior: "smooth" });
          }}
          className="gradient-button mx-auto"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          type="button"
        >
          Start Creating
        </motion.button>
      </motion.section>

      <section id="composer-form" className="mx-auto max-w-5xl w-full">
        <InputForm
          onSubmit={handleGenerate}
          initialTempo={settings.defaultTempo}
          initialGenre={settings.defaultGenre}
          initialEmotion={settings.defaultEmotion}
        />
        {isGenerating ? (
          <p className="mt-3 text-sm text-brand-highlight">We are already composing your current track...</p>
        ) : null}
      </section>
    </div>
  );
};

export default HomePage;
