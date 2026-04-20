import { NavLink } from 'react-router-dom';
import { StickyNote, LayoutGrid, Archive, Trash2, Settings as SettingsIcon } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Notes', icon: StickyNote, end: true },
  { to: '/templates', label: 'Templates', icon: LayoutGrid },
  { to: '/archive', label: 'Archive', icon: Archive },
  { to: '/trash', label: 'Trash', icon: Trash2 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="max-w-2xl mx-auto grid grid-cols-5 h-16 px-1 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`flex items-center justify-center transition-all ${
                  isActive ? 'w-11 h-7 rounded-full bg-primary-soft' : ''
                }`}>
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
