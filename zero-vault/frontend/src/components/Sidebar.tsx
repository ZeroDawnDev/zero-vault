import {
  Activity,
  ArrowLeftRight,
  CircleHelp,
  LayoutDashboard,
  MoreHorizontal,
  Settings,
  Tags,
  X,
} from "lucide-react";

export type NavigationItem =
  | "Overview"
  | "Transactions"
  | "Analytics"
  | "Categories"
  | "Settings";

const navigation = [
  { label: "Overview" as const, icon: LayoutDashboard },
  { label: "Transactions" as const, icon: ArrowLeftRight },
  { label: "Analytics" as const, icon: Activity },
  { label: "Categories" as const, icon: Tags },
  { label: "Settings" as const, icon: Settings },
];

interface SidebarProps {
  activeNav: NavigationItem;
  transactionCount: number;
  open: boolean;
  onNavigate: (item: NavigationItem) => void;
  onClose: () => void;
}

export function Sidebar({
  activeNav,
  transactionCount,
  open,
  onNavigate,
  onClose,
}: SidebarProps) {
  return (
    <>
      {open && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-symbol">
            <span />
            <span />
            <span />
          </div>

          <div className="brand-copy">
            <span className="brand-name">zero vault</span>
            <span className="brand-caption">by ZeroDawn</span>
          </div>

          <button
            className="icon-button sidebar-close"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activeNav === label ? "nav-active" : ""}`}
              onClick={() => onNavigate(label)}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Transactions" && (
                <span className="nav-count">{transactionCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-note">
          <div className="note-glow">
            <Activity size={18} />
          </div>
          <p className="note-title">Your money, in focus.</p>
          <p className="note-description">
            A clearer picture of where your money goes.
          </p>
          <div className="note-brand">ZERODAWN · FINANCE</div>
        </div>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => onNavigate("Settings")}>
            <CircleHelp size={19} strokeWidth={1.8} />
            <span>Help & support</span>
          </button>
          <div className="profile-row">
            <div className="avatar">Z</div>
            <div className="profile-copy">
              <span className="profile-name">Zero Vault</span>
              <span className="profile-subtitle">Personal account</span>
            </div>
            <MoreHorizontal size={19} className="profile-more" />
          </div>
        </div>
      </aside>
    </>
  );
}
