import React from 'react';
import {
  LayoutDashboard,
  Sprout,
  Waves,
  CloudSun,
  Database,
  Cpu,
  CalendarClock,
  Sliders,
  BarChart3,
  Bell,
  Info,
  Droplets,
} from 'lucide-react';
import { useViewMode } from '../context/ViewModeContext.js';

export type NavSection =
  | 'dashboard'
  | 'fields'
  | 'resources'
  | 'weather'
  | 'datasets'
  | 'optimization'
  | 'schedule'
  | 'simulation'
  | 'analytics'
  | 'alerts'
  | 'about';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  unreadAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  unreadAlertCount,
}) => {
  const { isSimple } = useViewMode();

  const navItems: Array<{
    id: NavSection;
    label: string;
    icon: React.ReactNode;
    group: 'operations' | 'decision' | 'system';
    badge?: string | number;
  }> = [
    { id: 'dashboard',    label: 'Dashboard',                                        icon: <LayoutDashboard className="w-4 h-4" />, group: 'operations' },
    { id: 'fields',       label: isSimple ? 'Crops & Farmland' : 'Fields & Crops',   icon: <Sprout className="w-4 h-4" />,         group: 'operations' },
    { id: 'resources',    label: isSimple ? 'Dams & Canals'    : 'Water Resources',  icon: <Waves className="w-4 h-4" />,          group: 'operations' },
    { id: 'weather',      label: isSimple ? 'Rain & Soil'      : 'Weather & Soil',   icon: <CloudSun className="w-4 h-4" />,       group: 'operations' },
    { id: 'datasets',     label: isSimple ? 'Real Datasets Hub': 'Datasets & Segments', icon: <Database className="w-4 h-4" />,    group: 'operations', badge: '5 Sets' },
    { id: 'optimization', label: isSimple ? 'Smart Optimizer'  : 'QUBO Optimization',  icon: <Cpu className="w-4 h-4" />,         group: 'decision',   badge: isSimple ? 'Smart' : 'Quantum' },
    { id: 'schedule',     label: isSimple ? 'Daily Schedule'   : 'Irrigation Schedule', icon: <CalendarClock className="w-4 h-4" />, group: 'decision' },
    { id: 'simulation',   label: isSimple ? 'Drought Simulator': 'What-If Simulation',  icon: <Sliders className="w-4 h-4" />,     group: 'decision' },
    { id: 'analytics',    label: isSimple ? 'Savings & Efficiency': 'Analytics',       icon: <BarChart3 className="w-4 h-4" />,    group: 'decision' },
    { id: 'alerts',       label: 'Alerts & Warnings',                                  icon: <Bell className="w-4 h-4" />,         group: 'system',     badge: unreadAlertCount > 0 ? unreadAlertCount : undefined },
    { id: 'about',        label: isSimple ? 'System Guide'     : 'Architecture & About', icon: <Info className="w-4 h-4" />,       group: 'system' },
  ];

  const groups: Array<{ key: 'operations' | 'decision' | 'system'; label: string }> = [
    { key: 'operations', label: isSimple ? 'Field & Water Status' : 'Command Operations' },
    { key: 'decision',   label: isSimple ? 'Smart Scheduling'     : 'Decision Engine' },
    { key: 'system',     label: isSimple ? 'Help & Notifications' : 'Monitoring & Docs' },
  ];

  const NavItem = ({ item }: { item: (typeof navItems)[0]; key?: React.Key }) => {
    const isActive = currentSection === item.id;
    const isAlertBadge = item.id === 'alerts' && item.badge !== undefined;
    return (
      <button
        id={`nav-${item.id}`}
        onClick={() => onSelectSection(item.id)}
        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-all ${
          isActive
            ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow-xs'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
          <span className="text-sm leading-tight truncate">{item.label}</span>
        </div>
        {item.badge !== undefined && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-1 ${
              isAlertBadge
                ? 'bg-amber-500 text-slate-950'
                : 'font-mono bg-cyan-900/60 text-cyan-300 border border-cyan-700/50'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-900/30 shrink-0">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            AquaQuantum
            <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800">
              {isSimple ? 'SMART' : 'QUBO'}
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 truncate max-w-[150px]">Krishna-Godavari Delta</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {groups.map((group, gi) => (
          <React.Fragment key={group.key}>
            <div className={`px-3 ${gi > 0 ? 'pt-3' : 'pt-1'} pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500`}>
              {group.label}
            </div>
            {navItems.filter((i) => i.group === group.key).map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </React.Fragment>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 m-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 text-[11px]">
        <div className="flex items-center justify-between text-slate-200 font-semibold">
          <span>{isSimple ? 'Smart AP Irrigation' : 'AP WRD Command'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
        </div>
        <div className="text-slate-500 mt-0.5">
          {isSimple ? 'Optimised watering · cost & water savings' : 'Quantum Annealing · SQLite runtime'}
        </div>
      </div>
    </aside>
  );
};
