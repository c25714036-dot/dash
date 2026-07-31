import React, { useState, useEffect } from 'react';
import { RecipeAdminRepository } from '../repositories/RecipeAdminRepository';
import { ExerciseAdminRepository } from '../repositories/ExerciseAdminRepository';
import { WorkoutTemplateAdminRepository } from '../repositories/WorkoutTemplateAdminRepository';
import { IngredientAdminRepository } from '../repositories/IngredientAdminRepository';
import { AnnouncementAdminRepository } from '../repositories/AnnouncementAdminRepository';
import { 
  Utensils, Dumbbell, CalendarCheck, Carrot, Megaphone, 
  Clock, CheckCircle, FileEdit, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { Recipe, Exercise } from '../models/types';
import { StatusBadge } from '../components/common/StatusBadge';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    recipesTotal: 0,
    recipesDraft: 0,
    recipesReview: 0,
    recipesPublished: 0,
    exercisesTotal: 0,
    exercisesReview: 0,
    exercisesPublished: 0,
    workoutTemplates: 0,
    ingredients: 0,
    activeAnnouncements: 0,
  });

  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const [recipes, exercises, workouts, ingredients, announcements] = await Promise.all([
          RecipeAdminRepository.list(),
          ExerciseAdminRepository.list(),
          WorkoutTemplateAdminRepository.list(),
          IngredientAdminRepository.list(),
          AnnouncementAdminRepository.list(),
        ]);

        setStats({
          recipesTotal: recipes.length,
          recipesDraft: recipes.filter(r => r.status === 'draft').length,
          recipesReview: recipes.filter(r => r.status === 'inReview').length,
          recipesPublished: recipes.filter(r => r.status === 'published').length,
          exercisesTotal: exercises.length,
          exercisesReview: exercises.filter(e => e.status === 'inReview').length,
          exercisesPublished: exercises.filter(e => e.status === 'published').length,
          workoutTemplates: workouts.length,
          ingredients: ingredients.length,
          activeAnnouncements: announcements.filter(a => a.active).length,
        });

        setRecentRecipes(recipes.slice(0, 5));
        setRecentExercises(exercises.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="border-l-2 border-[#E0FF00] pl-3">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-[#E0FF00] mb-0.5">
            SYSTEM DIRECTIVE // ANALYTICS
          </p>
          <h2 className="text-xl font-black uppercase tracking-tight text-[#F5F5F5]">Visão Geral do Conteúdo</h2>
          <p className="text-xs text-neutral-400">Métricas consolidadas do catálogo ativo do app Vida Saudável</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121212] p-5 rounded-sm border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Total de Receitas</span>
            <span className="text-3xl font-black text-[#F5F5F5] mt-1 block">{stats.recipesTotal}</span>
            <span className="text-[10px] text-[#E0FF00] font-mono uppercase tracking-wider">{stats.recipesPublished} publicadas</span>
          </div>
          <div className="p-3 bg-[#1A1A1A] border border-white/10 rounded-sm text-[#E0FF00]">
            <Utensils className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#121212] p-5 rounded-sm border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Total de Exercícios</span>
            <span className="text-3xl font-black text-[#F5F5F5] mt-1 block">{stats.exercisesTotal}</span>
            <span className="text-[10px] text-[#E0FF00] font-mono uppercase tracking-wider">{stats.exercisesPublished} publicados</span>
          </div>
          <div className="p-3 bg-[#1A1A1A] border border-white/10 rounded-sm text-[#E0FF00]">
            <Dumbbell className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#121212] p-5 rounded-sm border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">Aguardando Revisão</span>
            <span className="text-3xl font-black text-amber-300 mt-1 block">
              {stats.recipesReview + stats.exercisesReview}
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono uppercase tracking-wider">Conteúdos pendentes</span>
          </div>
          <div className="p-3 bg-amber-950/40 border border-amber-800 rounded-sm text-amber-300">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#121212] p-5 rounded-sm border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Avisos Ativos</span>
            <span className="text-3xl font-black text-[#F5F5F5] mt-1 block">{stats.activeAnnouncements}</span>
            <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">Transmissão no app</span>
          </div>
          <div className="p-3 bg-[#1A1A1A] border border-white/10 rounded-sm text-[#E0FF00]">
            <Megaphone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="bg-[#121212] p-3.5 rounded-sm border border-white/10">
          <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest block">Rascunhos</span>
          <span className="text-xl font-black text-[#F5F5F5]">{stats.recipesDraft}</span>
        </div>
        <div className="bg-[#121212] p-3.5 rounded-sm border border-white/10">
          <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest block">Modelos de Treino</span>
          <span className="text-xl font-black text-[#F5F5F5]">{stats.workoutTemplates}</span>
        </div>
        <div className="bg-[#121212] p-3.5 rounded-sm border border-white/10">
          <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest block">Ingredientes</span>
          <span className="text-xl font-black text-[#F5F5F5]">{stats.ingredients}</span>
        </div>
        <div className="bg-[#121212] p-3.5 rounded-sm border border-white/10">
          <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest block">Status do Banco</span>
          <span className="text-[10px] font-mono font-bold text-black bg-[#E0FF00] px-2 py-0.5 rounded-sm inline-block mt-1 uppercase tracking-wider">Conectado (vital-dd47f)</span>
        </div>
      </div>

      {/* Recent Collections Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas Recentes */}
        <div className="bg-[#121212] rounded-sm border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#E0FF00]" /> Receitas Recentes
            </h3>
            <a href="/recipes" className="text-[10px] font-black uppercase tracking-widest text-[#E0FF00] hover:underline flex items-center gap-1">
              Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {recentRecipes.length === 0 ? (
            <p className="text-xs text-neutral-500 font-mono text-center py-6">Nenhuma receita cadastrada ainda.</p>
          ) : (
            <div className="space-y-2">
              {recentRecipes.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-sm bg-[#181818] border border-neutral-800 hover:bg-[#1F1F1F] transition-colors">
                  <div>
                    <span className="text-xs font-bold text-[#F5F5F5] block">{r.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{r.totalTimeMinutes} min | {r.difficulty}</span>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exercícios Recentes */}
        <div className="bg-[#121212] rounded-sm border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#E0FF00]" /> Exercícios Recentes
            </h3>
            <a href="/exercises" className="text-[10px] font-black uppercase tracking-widest text-[#E0FF00] hover:underline flex items-center gap-1">
              Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {recentExercises.length === 0 ? (
            <p className="text-xs text-neutral-500 font-mono text-center py-6">Nenhum exercício cadastrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {recentExercises.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-sm bg-[#181818] border border-neutral-800 hover:bg-[#1F1F1F] transition-colors">
                  <div>
                    <span className="text-xs font-bold text-[#F5F5F5] block">{e.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{e.primaryMuscleGroup} | {e.level}</span>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
