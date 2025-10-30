import SettingsPanel from "../components/SettingsPanel.jsx";
import { useComposition } from "../context/CompositionContext.jsx";

const SettingsPage = () => {
  const { settings, updateSettings } = useComposition();

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-heading font-bold">Settings</h1>
        <p className="text-white/60 dark:text-black/60 max-w-2xl">
          Tailor HarmonyAI to your workflow. Toggle theme modes, set your ideal tempo, and define the genres you work with most.
        </p>
      </header>
      <SettingsPanel settings={settings} onChange={updateSettings} />
    </div>
  );
};

export default SettingsPage;
