import React from 'react';
import { Bell, ShieldCheck, LogOut, Flame } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { GlobalSearch } from './GlobalSearch';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-[#0A0A0A] border-b border-white/10 sticky top-0 z-20 px-6 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-3">
        {/* Environment Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#E0FF00]/10 border border-[#E0FF00] px-3 py-1 rounded-sm text-[10px] font-mono font-bold text-[#E0FF00] uppercase tracking-widest">
          <Flame className="w-3.5 h-3.5 text-[#E0FF00] fill-[#E0FF00]" />
          <span>vital-dd47f (Spark)</span>
        </div>

        {/* Notifications */}
        <button 
          aria-label="Notificações"
          className="p-2 rounded-sm text-neutral-400 hover:text-white hover:bg-white/10 relative transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E0FF00] rounded-full"></span>
        </button>

        {/* Admin User Info */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="w-7 h-7 rounded-sm bg-[#E0FF00] text-black flex items-center justify-center font-black text-xs uppercase">
              {user.displayName?.[0] || user.email?.[0] || 'A'}
            </div>
            <div className="hidden md:block text-xs">
              <p className="font-bold text-[#F5F5F5] leading-tight">{user.displayName || user.email}</p>
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-black bg-[#E0FF00] px-1.5 py-0.2 rounded-sm">
                <ShieldCheck className="w-3 h-3" /> {user.role}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title="Sair do painel"
          aria-label="Sair do painel"
          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-sm transition-colors ml-1"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
