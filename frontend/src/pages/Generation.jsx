import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import LoaderScreen from "../components/LoaderScreen.jsx";
import { useComposition, stageMessages } from "../context/CompositionContext.jsx";

const GenerationPage = () => {
  const { isGenerating, stageIndex, currentRequest } = useComposition();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isGenerating && !currentRequest) {
      navigate("/");
    }
  }, [isGenerating, currentRequest, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-brand-purple/20 via-brand-aqua/20 to-brand-highlight/20 rounded-3xl">
      <LoaderScreen stageMessage={stageMessages[stageIndex] ?? stageMessages.at(-1)} />
    </div>
  );
};

export default GenerationPage;
