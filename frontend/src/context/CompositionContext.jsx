import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { composeTrack } from "../api/api.js";

const HISTORY_KEY = "harmonyai-history";
const SETTINGS_KEY = "harmonyai-settings";

export const stageMessages = [
  "Analyzing lyrics and tone...",
  "Selecting instruments...",
  "Generating melody pattern...",
  "Finalizing harmonies...",
  "Preparing your track..."
];

export const emotionThemes = {
  Love: {
    gradient: "from-rose-500/40 via-purple-500/30 to-fuchsia-500/20",
    glow: "shadow-rose-500/40",
    accent: "text-rose-200"
  },
  Devotion: {
    gradient: "from-amber-400/40 via-orange-300/30 to-yellow-200/20",
    glow: "shadow-amber-400/40",
    accent: "text-amber-100"
  },
  Celebration: {
    gradient: "from-orange-500/40 via-red-400/30 to-pink-400/20",
    glow: "shadow-orange-500/40",
    accent: "text-orange-100"
  },
  Sadness: {
    gradient: "from-slate-600/50 via-blue-500/30 to-cyan-400/20",
    glow: "shadow-slate-500/40",
    accent: "text-blue-100"
  },
  Calm: {
    gradient: "from-blue-500/40 via-cyan-400/30 to-teal-300/20",
    glow: "shadow-blue-500/40",
    accent: "text-cyan-100"
  }
};

const defaultSettings = {
  defaultTempo: 100,
  defaultGenre: "Bollywood Fusion",
  defaultEmotion: "Love",
  apiBaseUrl: import.meta.env.VITE_API_URL || ""
};

const CompositionContext = createContext();

export const CompositionProvider = ({ children }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = window.localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to parse history", error);
      return [];
    }
  });
  const [settings, setSettings] = useState(() => {
    if (typeof window === "undefined") {
      return defaultSettings;
    }
    try {
      const stored = window.localStorage.getItem(SETTINGS_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch (error) {
      console.error("Failed to parse settings", error);
      return defaultSettings;
    }
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const showToast = useCallback((message, tone = "info") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timeout);
  }, [toast]);

  const toggleFavorite = useCallback((id) => {
    setHistory((previous) =>
      previous.map((entry) =>
        entry.id === id ? { ...entry, favorite: !entry.favorite } : entry
      )
    );
    if (currentResult?.id === id) {
      setCurrentResult((prev) => (prev ? { ...prev, favorite: !prev.favorite } : prev));
    }
  }, [currentResult]);

  const recordFeedback = useCallback(
    (id, feedback) => {
      setHistory((previous) =>
        previous.map((entry) => (entry.id === id ? { ...entry, feedback } : entry))
      );
      if (currentResult?.id === id) {
        setCurrentResult((prev) => (prev ? { ...prev, feedback } : prev));
      }
      showToast("Your thoughts inspire our harmony!", "success");
    },
    [currentResult, showToast]
  );

  const generateComposition = useCallback(
    async (payload) => {
      setCurrentRequest(payload);
      setCurrentResult(null);
      setIsGenerating(true);
      setStageIndex(0);
      let stagePointer = 0;

      const stageInterval = setInterval(() => {
        stagePointer = Math.min(stagePointer + 1, stageMessages.length - 1);
        setStageIndex(stagePointer);
      }, 2600);

      try {
        const data = await composeTrack(payload);
        const composition = {
          ...payload,
          ...data,
          id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          createdAt: new Date().toISOString(),
          favorite: false,
          feedback: null
        };
        setCurrentResult(composition);
        setHistory((prev) => [composition, ...prev].slice(0, 50));
        showToast("Track ready! Enjoy your new composition.", "success");
        return { success: true, result: composition };
      } catch (error) {
        console.error("Composition failed", error);
        const message = error instanceof Error ? error.message : "We couldn't complete the composition. Please try again.";
        showToast(message, "error");
        return { success: false, error };
      } finally {
        clearInterval(stageInterval);
        setStageIndex(stageMessages.length - 1);
        setIsGenerating(false);
      }
    },
    [showToast]
  );

  const updateSettings = useCallback((updater) => {
    setSettings((prev) => ({ ...prev, ...updater }));
    showToast("Preferences saved successfully!", "success");
  }, [showToast]);

  const value = useMemo(
    () => ({
      generateComposition,
      isGenerating,
      stageIndex,
      stageMessages,
      currentRequest,
      currentResult,
      history,
      settings,
      updateSettings,
      toggleFavorite,
      recordFeedback,
      emotionThemes,
      toast,
      clearToast: () => setToast(null)
    }),
    [
      generateComposition,
      isGenerating,
      stageIndex,
      currentRequest,
      currentResult,
      history,
      settings,
      updateSettings,
      toggleFavorite,
      recordFeedback,
      toast
    ]
  );

  return <CompositionContext.Provider value={value}>{children}</CompositionContext.Provider>;
};

export const useComposition = () => {
  const context = useContext(CompositionContext);
  if (!context) {
    throw new Error("useComposition must be used within a CompositionProvider");
  }
  return context;
};
