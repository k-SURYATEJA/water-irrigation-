import React from 'react';
import {
  LayoutDashboard,
  Sprout,
  Waves,
  CloudSun,
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
    description: string;
    icon: React.ReactNode;
    badge?: string | number;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'System overview & water balance',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'fields',
      label: isSimple ? 'Crops & Farmland' : 'Fields & Crops',
      description: 'Soil moisture & crop health',
      icon: <Sprout className="w-5 h-5" />,
    },
    {
      id: 'resources',
      label: isSimple ? 'Dams & Canals' : 'Water Resources',
      description: 'Barrages & pump stations',
      icon: <Waves className="w-5 h-5" />,
    },
    {
      id: 'weather',
      label: isSimple ? 'Rain & Soil Moisture' : 'Weather & Soil',
      description: 'Rain forecast & water demand',
      icon: <CloudSun className="w-5 h-5" />,
    },
    {
      id: 'optimization',
      label: isSimple ? 'Smart Optimizer' : 'QUBO Optimization',
      description: isSimple ? 'Automatic schedule solver' : 'Ising Hamiltonian quantum model',
      icon: <Cpu className="w-5 h-5" />,
      badge: isSimple ? 'Smart' : 'Quantum',
    },
    {
      id: 'schedule',
      label: isSimple ? 'Daily Water Schedule' : 'Irrigation Schedule',
      description: 'Hour-by-hour pumping plan',
      icon: <CalendarClock className="w-5 h-5" />,
    },
    {
      id: 'simulation',
      label: isSimple ? 'Drought Simulator' : 'What-If Simulation',
      description: 'Test drought & monsoon scenarios',
      icon: <Sliders className="w-5 h-5" />,
    },
    {
      id: 'analytics',
      label: isSimple ? 'Savings & Efficiency' : 'Analytics',
      description: 'Water & electricity savings',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'alerts',
      label: 'Alerts & Warnings',
      description: 'Live field notifications',
      icon: <Bell className="w-5 h-5" />,
      badge: unreadAlertCount > 0 ? unreadAlertCount : undefined,
    },
    {
      id: 'about',
      label: isSimple ? 'System Guide & About' : 'Architecture & About',
      description: 'Math formulation & local setup',
      icon: <Info className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-900/30">
          <Droplets className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            AquaQuantum
            <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800">
              {isSimple ? 'SMART' : 'QUBO'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 truncate max-w-[150px]">Krishna-Godavari Delta</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {isSimple ? 'Field & Water Status' : 'Command Operations'}
        </div>
        {navItems.slice(0, 4).map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
                <div className="truncate">
                  <div className="text-sm leading-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{item.description}</div>
                </div>
              </div>
            </button>
          );
        })}

        <div className="pt-3 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {isSimple ? 'Smart Scheduling' : 'Decision Engine'}
        </div>
        {navItems.slice(4, 8).map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
                <div className="truncate">
                  <div className="text-sm leading-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{item.description}</div>
                </div>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded-full shrink-0 ml-1">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {isSimple ? 'Help & Notifications' : 'Monitoring & Docs'}
        </div>
        {navItems.slice(8).map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
                <div className="truncate">
                  <div className="text-sm leading-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{item.description}</div>
                </div>
              </div>
              {item.badge !== undefined && (
                <span className="text-[11px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shrink-0 ml-1">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-3 m-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-xs text-slate-400">
        <div className="flex items-center justify-between text-slate-200 font-semibold mb-1">
          <span>{isSimple ? 'Smart AP Irrigation' : 'AP WRD Command'}</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          {isSimple
            ? 'Watering crops at the right time to cut bills and save water.'
            : 'Simulated Quantum Annealing solver connected to SQLite runtime.'}
        </p>
      </div>
    </aside>
  );
};

