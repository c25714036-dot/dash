import React, { useState, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { RecipeAdminRepository } from '../../repositories/RecipeAdminRepository';
import { ExerciseAdminRepository } from '../../repositories/ExerciseAdminRepository';
import { IngredientAdminRepository } from '../../repositories/IngredientAdminRepository';
import { useNavigate } from 'react-router-dom';
import { Recipe, Exercise, Ingredient } from '../../models/types';

export const GlobalSearch: React.FC = () => {
  const [term, setTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    recipes: Recipe[];
    exercises: Exercise[];
    ingredients: Ingredient[];
  }>({ recipes: [], exercises: [], ingredients: [] });

  const debouncedTerm = useDebounce(term, 350);

  useEffect(() => {
    if (!debouncedTerm.trim() || debouncedTerm.length < 2) {
      setResults({ recipes: [], exercises: [], ingredients: [] });
      setIsOpen(false);
      return;
    }

    let isMounted = true;
    const executeSearch = async () => {
      setLoading(true);
      try {
        const queryTerm = debouncedTerm.toLowerCase().trim();

        const [allRecipes, allExercises, allIngredients] = await Promise.all([
          RecipeAdminRepository.list(),
          ExerciseAdminRepository.list(),
          IngredientAdminRepository.list(),
        ]);

        if (!isMounted) return;

        const matchedRecipes = allRecipes.filter(r => 
          r.name.toLowerCase().includes(queryTerm) || r.slug.includes(queryTerm)
        ).slice(0, 5);

        const matchedExercises = allExercises.filter(e => 
          e.name.toLowerCase().includes(queryTerm) || e.slug.includes(queryTerm)
        ).slice(0, 5);

        const matchedIngredients = allIngredients.filter(i => 
          i.name.toLowerCase().includes(queryTerm)
        ).slice(0, 5);

        setResults({
          recipes: matchedRecipes,
          exercises: matchedExercises,
          ingredients: matchedIngredients,
        });
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    executeSearch();

    return () => {
      isMounted = false;
    };
  }, [debouncedTerm]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="PESQUISAR RECEITAS, EXERCÍCIOS, INGREDIENTES..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="w-full pl-9 pr-8 py-2 text-xs uppercase font-bold tracking-wider bg-[#141414] rounded-sm border border-neutral-700 focus:outline-none focus:border-[#E0FF00] text-[#F5F5F5] placeholder:text-neutral-500"
        />
        {term && (
          <button 
            onClick={() => { setTerm(''); setIsOpen(false); }}
            className="absolute right-2.5 top-2.5 text-neutral-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-11 left-0 right-0 bg-[#141414] rounded-sm shadow-2xl border border-white/10 z-50 p-3 max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center p-4 text-xs text-neutral-400 gap-2 font-mono uppercase">
              <Loader2 className="w-4 h-4 animate-spin text-[#E0FF00]" /> Buscando...
            </div>
          )}

          {!loading && 
            results.recipes.length === 0 && 
            results.exercises.length === 0 && 
            results.ingredients.length === 0 && (
            <p className="text-xs text-neutral-400 p-3 text-center">Nenhum resultado para "{debouncedTerm}"</p>
          )}

          {results.recipes.length > 0 && (
            <div className="mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E0FF00] px-2 block mb-1">Receitas</span>
              {results.recipes.map(r => (
                <a
                  key={r.id}
                  href={`/recipes/edit/${r.id}`}
                  onClick={() => setIsOpen(false)}
                  className="block p-2 rounded-sm hover:bg-[#1F1F1F] text-xs font-bold text-[#F5F5F5] transition-colors"
                >
                  🥗 {r.name}
                </a>
              ))}
            </div>
          )}

          {results.exercises.length > 0 && (
            <div className="mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E0FF00] px-2 block mb-1">Exercícios</span>
              {results.exercises.map(e => (
                <a
                  key={e.id}
                  href={`/exercises/edit/${e.id}`}
                  onClick={() => setIsOpen(false)}
                  className="block p-2 rounded-sm hover:bg-[#1F1F1F] text-xs font-bold text-[#F5F5F5] transition-colors"
                >
                  🏋️ {e.name}
                </a>
              ))}
            </div>
          )}

          {results.ingredients.length > 0 && (
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E0FF00] px-2 block mb-1">Ingredientes</span>
              {results.ingredients.map(i => (
                <a
                  key={i.id}
                  href="/ingredients"
                  onClick={() => setIsOpen(false)}
                  className="block p-2 rounded-sm hover:bg-[#1F1F1F] text-xs font-bold text-[#F5F5F5] transition-colors"
                >
                  🥕 {i.name}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
