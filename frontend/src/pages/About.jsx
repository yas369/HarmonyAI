import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";

const AboutPage = () => (
  <motion.div
    className="glass-card px-8 py-12 space-y-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h1 className="text-4xl font-heading font-bold">About HarmonyAI</h1>
    <p className="text-white/70 dark:text-black/70 text-lg leading-relaxed">
      HarmonyAI is a generative composition studio designed to preserve and evolve Indian musical heritage. From classical
      ragas to cinematic soundscapes, our AI blends tradition with innovation, empowering creatives to explore new
      melodic horizons.
    </p>
    <div className="space-y-2">
      <h2 className="text-2xl font-heading font-semibold">Created by Yaswanth Chezhian</h2>
      <p className="text-white/60 dark:text-black/60">
        Developer, musician, and storyteller passionate about cultural resonance and sonic craftsmanship.
      </p>
      <div className="flex flex-wrap gap-4 pt-2">
        <a
          href="https://www.linkedin.com/in/yaswanth-chezhian"
          target="_blank"
          rel="noopener noreferrer"
          className="gradient-button flex items-center gap-2"
        >
          <Linkedin className="size-5" /> LinkedIn
        </a>
        <a
          href="https://github.com/yaswanth-chezhian"
          target="_blank"
          rel="noopener noreferrer"
          className="gradient-button flex items-center gap-2"
        >
          <Github className="size-5" /> GitHub
        </a>
        <a href="mailto:yaswanth@example.com" className="gradient-button flex items-center gap-2">
          <Mail className="size-5" /> Contact
        </a>
      </div>
    </div>
  </motion.div>
);

export default AboutPage;
