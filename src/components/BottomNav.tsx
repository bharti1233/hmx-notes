import { NavLink } from 'react-router-dom';
import { StickyNote, MessageCircle, Settings as SettingsIcon, User, Plus } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Notes', icon: StickyNote, end: true },
  { to: '/chat', label: 'AI Chat', icon: MessageCircle },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
  { to: '/profile', label: 'Profile', icon: User },
];

interface BottomNavProps {
  onNewNote?: () => void;
}

export function BottomNav({ onNewNote }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="max-w-2xl mx-auto grid grid-cols-5 h-16 px-1 pb-[env(safe-area-inset-bottom)] items-center relative">
        {/* First two tabs */}
        {tabs.slice(0, 2).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'w-11 h-7 rounded-full bg-primary-soft scale-110' : ''
                }`}>
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Center floating + button */}
        <div className="flex items-center justify-center">
          <button
            onClick={onNewNote}
            className="w-14 h-14 -mt-8 rounded-full bg-gradient-primary text-primary-foreground shadow-fab flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200"
            aria-label="New Note"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </div>

        {/* Last two tabs */}
        {tabs.slice(2).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'w-11 h-7 rounded-full bg-primary-soft scale-110' : ''
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
