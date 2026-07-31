import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Utensils, Carrot, Layers, ShieldAlert, Dumbbell, 
  BicepsFlexed, Wrench, FolderKanban, CalendarCheck, FileText, Award, 
  HelpCircle, Megaphone, Settings, ClipboardCheck, History, UserCheck, 
  LogOut, ChevronLeft, ChevronRight, HeartPulse
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();

  const menuItems = [
    { label: 'Visão geral', path: '/', icon: LayoutDashboard },
    { label: 'Receitas', path: '/recipes', icon: Utensils },
    { label: 'Ingredientes', path: '/ingredients', icon: Carrot },
    { label: 'Categorias de receitas', path: '/recipe-categories', icon: Layers },
    { label: 'Alergênicos', path: '/allergens', icon: ShieldAlert },
    { label: 'Exercícios', path: '/exercises', icon: Dumbbell },
    { label: 'Grupos musculares', path: '/muscle-groups', icon: BicepsFlexed },
    { label: 'Equipamentos', path: '/equipment', icon: Wrench },
    { label: 'Categorias de exercícios', path: '/exercise-categories', icon: FolderKanban },
    { label: 'Modelos de treino', path: '/workout-templates', icon: CalendarCheck },
    { label: 'Planos alimentares', path: '/meal-plans', icon: FileText },
    { label: 'Conquistas', path: '/achievements', icon: Award },
    { label: 'Onboarding', path: '/onboarding', icon: HelpCircle },
    { label: 'Avisos', path: '/announcements', icon: Megaphone },
    { label: 'Configurações', path: '/config', icon: Settings },
    { label: 'Revisões', path: '/reviews', icon: ClipboardCheck },
    { label: 'Logs', path: '/logs', icon: History },
    { label: 'Suporte (Usuários)', path: '/support', icon: UserCheck },
    { label: 'Conta', path: '/account', icon: UserCheck },
  ];

  return (
    <aside 
      className={`bg-[#0D0D0D] border-r border-white/10 h-screen sticky top-0 flex flex-col transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
        {!collapsed && (
          <div className="flex items-center gap-3 border-l-2 border-[#E0FF00] pl-3">
            <div className="p-1.5 bg-[#E0FF00] text-black rounded-sm">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#E0FF00] leading-none mb-0.5">
                SYSTEM PAINEL
              </p>
              <h1 className="font-black text-[#F5F5F5] text-sm leading-tight uppercase tracking-tight">Vida Saudável</h1>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="p-2 bg-[#E0FF00] text-black rounded-sm mx-auto">
            <HeartPulse className="w-5 h-5" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-sm text-neutral-400 hover:text-white hover:bg-white/10 transition-colors hidden md:block"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-sm text-[11px] uppercase tracking-wider font-bold transition-all ${
                  isActive
                    ? 'bg-[#E0FF00] text-black font-black shadow-sm'
                    : 'text-neutral-300 hover:bg-[#1A1A1A] hover:text-[#E0FF00]'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User & Logout */}
      <div className="p-3 border-t border-white/10 bg-[#0A0A0A] space-y-2">
        {!collapsed && user && (
          <div className="text-[11px] px-2">
            <p className="font-bold text-[#F5F5F5] truncate">{user.displayName || user.email}</p>
            <p className="text-[#E0FF00] uppercase font-mono font-bold text-[9px] tracking-widest">{user.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-[11px] uppercase tracking-wider font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
          title={collapsed ? 'Sair' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
};
