import { LayoutDashboard, Settings as SettingsIcon } from "lucide-react";

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  return (
    <section className="coming-soon">
      <div className="coming-soon-icon">
        <SettingsIcon size={27} />
      </div>
      <div className="eyebrow">
        <span className="eyebrow-line" />
        ZERO VAULT
      </div>
      <h1>Settings</h1>
      <p>Your account preferences and app settings will live here.</p>
      <button className="button button-primary" onClick={onBack}>
        <LayoutDashboard size={17} />
        Back to overview
      </button>
    </section>
  );
}
