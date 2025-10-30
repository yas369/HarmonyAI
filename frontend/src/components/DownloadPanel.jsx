import PropTypes from "prop-types";
import { FileAudio, FileMusic, FileText } from "lucide-react";

const links = [
  { key: "audio", label: "Download WAV", icon: FileAudio },
  { key: "midi", label: "Download MIDI", icon: FileMusic },
  { key: "pdf", label: "Download PDF Sheet", icon: FileText }
];

const DownloadPanel = ({ files }) => (
  <div className="glass-card px-6 py-6 flex flex-wrap gap-4 justify-center">
    {links.map(({ key, label, icon: Icon }) => (
      <a
        key={key}
        href={files?.[key] ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`gradient-button flex items-center gap-2 ${!files?.[key] ? "pointer-events-none opacity-60" : ""}`}
        aria-disabled={!files?.[key]}
      >
        <Icon className="size-5" />
        {label}
      </a>
    ))}
  </div>
);

DownloadPanel.propTypes = {
  files: PropTypes.shape({
    audio: PropTypes.string,
    midi: PropTypes.string,
    pdf: PropTypes.string
  })
};

export default DownloadPanel;
