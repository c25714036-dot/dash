import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeLabels: Record<string, string> = {
    recipes: 'Receitas',
    new: 'Novo Registro',
    edit: 'Editar',
    ingredients: 'Ingredientes',
    'recipe-categories': 'Categorias de Receitas',
    allergens: 'Alergênicos',
    exercises: 'Exercícios',
    'muscle-groups': 'Grupos Musculares',
    equipment: 'Equipamentos',
    'exercise-categories': 'Categorias de Exercícios',
    'workout-templates': 'Modelos de Treino',
    'meal-plans': 'Planos Alimentares',
    achievements: 'Conquistas',
    onboarding: 'Onboarding',
    announcements: 'Avisos',
    config: 'Configurações',
    reviews: 'Revisões Editorial',
    logs: 'Logs de Auditoria',
    support: 'Usuários (Suporte)',
    account: 'Minha Conta',
  };

  return (
    <nav className="flex items-center space-x-1 text-[11px] font-mono uppercase tracking-widest text-neutral-500 mb-6" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-[#E0FF00] flex items-center gap-1 transition-colors">
        <Home className="w-3.5 h-3.5" /> Visão Geral
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = routeLabels[value] || value;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-neutral-600" />
            {isLast ? (
              <span className="font-bold text-[#E0FF00]">{label}</span>
            ) : (
              <Link to={to} className="hover:text-[#E0FF00] transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
