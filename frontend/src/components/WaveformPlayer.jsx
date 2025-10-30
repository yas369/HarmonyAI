import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Pause, Play, Repeat } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

const WaveformPlayer = ({ audioUrl, emotion }) => {
  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    if (!audioUrl) {
      return undefined;
    }

    containerRef.current.innerHTML = "";

    const wave = WaveSurfer.create({
      container: containerRef.current,
      height: 120,
      waveColor: "rgba(155, 93, 229, 0.6)",
      progressColor: "rgba(0, 187, 249, 0.9)",
      cursorColor: "rgba(254, 228, 64, 0.9)",
      barWidth: 2,
      barRadius: 3,
      barGap: 2,
      responsive: true
    });

    wavesurferRef.current = wave;
    wave.load(audioUrl);

    const handleReady = () => {
      setIsPlaying(false);
    };

    wave.on("ready", handleReady);

    return () => {
      wave.un("ready", handleReady);
      wave.destroy();
      wavesurferRef.current = null;
    };
  }, [audioUrl]);

  useEffect(() => {
    const wave = wavesurferRef.current;
    if (!wave) {
      return undefined;
    }

    const handleFinish = () => {
      if (isLooping) {
        wave.play();
      } else {
        setIsPlaying(false);
      }
    };

    wave.on("finish", handleFinish);

    return () => {
      wave.un("finish", handleFinish);
    };
  }, [isLooping]);

  const handlePlayPause = () => {
    const wave = wavesurferRef.current;
    if (!wave) {
      return;
    }
    wave.playPause();
    setIsPlaying(wave.isPlaying());
  };

  const handleLoop = () => {
    setIsLooping((prev) => !prev);
  };

  return (
    <div className="glass-card w-full px-6 py-6">
      {audioUrl ? (
        <div className="space-y-4">
          <div ref={containerRef} />
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handlePlayPause}
              className="gradient-button px-5 py-2 flex items-center gap-2"
            >
              {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>
            <button
              type="button"
              onClick={handleLoop}
              className={`rounded-2xl border px-4 py-2 flex items-center gap-2 transition ${
                isLooping
                  ? "border-brand-highlight bg-brand-highlight/20 text-brand-highlight"
                  : "border-white/20 text-white/70 dark:text-black/70 hover:border-brand-purple/50"
              }`}
            >
              <Repeat className="size-5" />
              <span>Loop</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-white/70 dark:text-black/70 py-6">
          Audio will appear here once generated.
        </div>
      )}
      {emotion ? (
        <p className="mt-4 text-center text-sm text-white/60 dark:text-black/60">
          Emotional palette: <span className="font-medium">{emotion}</span>
        </p>
      ) : null}
    </div>
  );
};

WaveformPlayer.propTypes = {
  audioUrl: PropTypes.string,
  emotion: PropTypes.string
};

export default WaveformPlayer;
