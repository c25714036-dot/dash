import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recipeSchema } from '../validation/schemas';
import { RecipeAdminRepository } from '../repositories/RecipeAdminRepository';
import { CategoryAdminRepository } from '../repositories/CategoryAdminRepository';
import { IngredientAdminRepository } from '../repositories/IngredientAdminRepository';
import { Recipe, RecipeCategory, Ingredient, EditorialStatus } from '../models/types';
import { MediaInput } from '../components/common/MediaInput';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { useAuth } from '../hooks/useAuth';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { 
  Save, ArrowLeft, Plus, Trash2, Send, CheckCircle2, 
  HelpCircle, Utensils, Clock, Flame, ListOrdered, ShieldCheck
} from 'lucide-react';
import { z } from 'zod';

type RecipeFormValues = z.infer<typeof recipeSchema>;

export const RecipeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const toastId = Date.now().toString();
    setToasts(p => [...p, { id: toastId, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== toastId)), 4000);
  };

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isDirty } } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      difficulty: 'Fácil',
      cost: 'Médio',
      prepTimeMinutes: 15,
      cookTimeMinutes: 20,
      totalTimeMinutes: 35,
      servings: 2,
      categories: [],
      goals: ['Emagrecimento'],
      diets: ['Sem Glúten'],
      mealTypes: ['Almoço'],
      tags: [],
      calories: 350,
      proteins: 25,
      carbs: 30,
      fats: 12,
      imageUrl: '',
      imageAssetKey: '',
    },
  });

  useUnsavedChanges(isDirty);

  // Dynamic ingredient rows
  const [recipeIngredients, setRecipeIngredients] = useState<{
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    gramsEquivalent?: number;
    isOptional?: boolean;
    substitutions?: string;
  }[]>([
    { ingredientId: '1', ingredientName: 'Peito de Frango', quantity: 200, unit: 'g', gramsEquivalent: 200 }
  ]);

  // Dynamic instruction steps
  const [steps, setSteps] = useState<{
    stepNumber: number;
    title?: string;
    instruction: string;
    timeMinutes?: number;
    warningNotice?: string;
  }>([
    { stepNumber: 1, instruction: 'Tempere o frango com sal e pimenta-do-reino.' },
    { stepNumber: 2, instruction: 'Grelhe em uma frigideira antiaderente por 10 minutos.' }
  ]);

  useEffect(() => {
    async function init() {
      try {
        const [cats, ings] = await Promise.all([
          CategoryAdminRepository.list(),
          IngredientAdminRepository.list(),
        ]);
        setCategories(cats);
        setAvailableIngredients(ings);

        if (id && id !== 'new') {
          const fetched = await RecipeAdminRepository.getById(id);
          if (fetched) {
            setCurrentRecipe(fetched);
            setValue('name', fetched.name);
            setValue('slug', fetched.slug);
            setValue('shortDescription', fetched.shortDescription);
            setValue('fullDescription', fetched.fullDescription);
            setValue('difficulty', fetched.difficulty);
            setValue('cost', fetched.cost);
            setValue('prepTimeMinutes', fetched.prepTimeMinutes);
            setValue('cookTimeMinutes', fetched.cookTimeMinutes);
            setValue('totalTimeMinutes', fetched.totalTimeMinutes);
            setValue('servings', fetched.servings);
            setValue('categories', fetched.categories || []);
            setValue('goals', fetched.goals || []);
            setValue('diets', fetched.diets || []);
            setValue('mealTypes', fetched.mealTypes || []);
            setValue('tags', fetched.tags || []);
            setValue('calories', fetched.nutrition?.calories || 0);
            setValue('proteins', fetched.nutrition?.proteins || 0);
            setValue('carbs', fetched.nutrition?.carbs || 0);
            setValue('fats', fetched.nutrition?.fats || 0);
            setValue('imageUrl', fetched.media?.imageUrl || '');
            setValue('imageAssetKey', fetched.media?.imageAssetKey || '');

            if (fetched.ingredients) setRecipeIngredients(fetched.ingredients);
            if (fetched.instructions) setSteps(fetched.instructions);
          }
        }
      } catch (err) {
        addToast('error', 'Erro ao carregar dados da receita');
      }
    }
    init();
  }, [id, setValue]);

  const onSave = async (values: RecipeFormValues, statusOverride?: EditorialStatus) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        shortDescription: values.shortDescription,
        fullDescription: values.fullDescription,
        status: statusOverride || currentRecipe?.status || 'draft',
        difficulty: values.difficulty,
        cost: values.cost,
        prepTimeMinutes: values.prepTimeMinutes,
        cookTimeMinutes: values.cookTimeMinutes,
        totalTimeMinutes: values.prepTimeMinutes + values.cookTimeMinutes,
        servings: values.servings,
        categories: values.categories,
        goals: values.goals,
        diets: values.diets,
        mealTypes: values.mealTypes,
        tags: values.tags,
        ingredients: recipeIngredients,
        instructions: steps,
        nutrition: {
          calories: values.calories,
          proteins: values.proteins,
          carbs: values.carbs,
          fats: values.fats,
          fiber: values.fiber,
          sodium: values.sodium,
          saturatedFats: values.saturatedFats,
        },
        media: {
          imageUrl: values.imageUrl,
          imageAssetKey: values.imageAssetKey,
          videoUrl: values.videoUrl,
          videoAssetKey: values.videoAssetKey,
          altText: values.altText,
        }
      };

      if (id && id !== 'new') {
        await RecipeAdminRepository.update(id, payload, user?.email || undefined, 'Edição salva pelo usuário');
        addToast('success', 'Receita atualizada com sucesso!');
        setTimeout(() => navigate('/recipes'), 1000);
      } else {
        await RecipeAdminRepository.create(payload, user?.email || undefined);
        addToast('success', 'Receita criada com sucesso!');
        setTimeout(() => navigate('/recipes'), 1000);
      }
    } catch (err) {
      addToast('error', 'Falha ao salvar receita. Verifique os campos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <ToastContainer toasts={toasts} onDismiss={(tId) => setToasts(p => p.filter(t => t.id !== tId))} />

      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/recipes')}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#333333]">
              {id === 'new' ? 'Nova Receita' : `Editar Receita: ${currentRecipe?.name || ''}`}
            </h2>
            <span className="text-xs text-slate-400">Preencha com atenção todas as informações nutricionais e os ingredientes</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSubmit((vals) => onSave(vals, 'draft'))}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#333333] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4 text-slate-600" /> Salvar Rascunho
          </button>
          <button
            type="button"
            onClick={handleSubmit((vals) => onSave(vals, 'inReview'))}
            disabled={loading}
            className="px-4 py-2 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" /> Enviar p/ Revisão
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit((vals) => onSave(vals))} className="space-y-6">
        {/* Seção 1: Identificação */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#333333] border-b pb-2 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#F47551]" /> 1. Identificação Geral
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Nome da Receita *</label>
              <input
                type="text"
                {...register('name')}
                placeholder="Ex: Frango ao Molho com Ervas"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F47551]"
              />
              {errors.name && <span className="text-[11px] text-rose-600">{errors.name.message}</span>}
            </div>

            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Slug URL *</label>
              <input
                type="text"
                {...register('slug')}
                placeholder="ex: frango-ao-molho-ervas"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F47551]"
              />
              {errors.slug && <span className="text-[11px] text-rose-600">{errors.slug.message}</span>}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Descrição Curta *</label>
            <input
              type="text"
              {...register('shortDescription')}
              placeholder="Uma opção leve e rica em proteínas para o almoço."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F47551]"
            />
            {errors.shortDescription && <span className="text-[11px] text-rose-600">{errors.shortDescription.message}</span>}
          </div>

          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Descrição Completa *</label>
            <textarea
              rows={3}
              {...register('fullDescription')}
              placeholder="Descreva a origem da receita, dicas de harmonização ou benefícios nutricionais."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F47551]"
            />
            {errors.fullDescription && <span className="text-[11px] text-rose-600">{errors.fullDescription.message}</span>}
          </div>
        </div>

        {/* Seção 2: Classificação & Tempos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#333333] border-b pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F47551]" /> 2. Classificação & Tempos de Preparo
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Dificuldade</label>
              <select {...register('difficulty')} className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50">
                <option value="Fácil">Fácil</option>
                <option value="Médio">Médio</option>
                <option value="Difícil">Difícil</option>
                <option value="Chef">Chef</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Custo Estimado</label>
              <select {...register('cost')} className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50">
                <option value="Baixo">Baixo</option>
                <option value="Médio">Médio</option>
                <option value="Alto">Alto</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Preparo (min)</label>
              <input
                type="number"
                {...register('prepTimeMinutes', { valueAsNumber: true })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Cozimento (min)</label>
              <input
                type="number"
                {...register('cookTimeMinutes', { valueAsNumber: true })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Seção 3: Tabela de Ingredientes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-[#333333]">3. Lista de Ingredientes Associados</h3>
            <button
              type="button"
              onClick={() => setRecipeIngredients([...recipeIngredients, { ingredientId: '', ingredientName: '', quantity: 100, unit: 'g' }])}
              className="text-xs font-bold text-[#F47551] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Ingrediente
            </button>
          </div>

          <div className="space-y-3">
            {recipeIngredients.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <input
                  type="text"
                  placeholder="Nome do Ingrediente"
                  value={item.ingredientName}
                  onChange={(e) => {
                    const copy = [...recipeIngredients];
                    copy[idx].ingredientName = e.target.value;
                    setRecipeIngredients(copy);
                  }}
                  className="flex-1 p-2 rounded-lg border border-slate-300 bg-white"
                />
                <input
                  type="number"
                  placeholder="Qtd"
                  value={item.quantity}
                  onChange={(e) => {
                    const copy = [...recipeIngredients];
                    copy[idx].quantity = Number(e.target.value);
                    setRecipeIngredients(copy);
                  }}
                  className="w-20 p-2 rounded-lg border border-slate-300 bg-white"
                />
                <input
                  type="text"
                  placeholder="Unidade (ex: g, ml, xícara)"
                  value={item.unit}
                  onChange={(e) => {
                    const copy = [...recipeIngredients];
                    copy[idx].unit = e.target.value;
                    setRecipeIngredients(copy);
                  }}
                  className="w-28 p-2 rounded-lg border border-slate-300 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setRecipeIngredients(recipeIngredients.filter((_, i) => i !== idx))}
                  className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Seção 4: Passo a Passo do Preparo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-[#333333] flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-[#F47551]" /> 4. Modo de Preparo (Instruções)
            </h3>
            <button
              type="button"
              onClick={() => setSteps([...steps, { stepNumber: steps.length + 1, instruction: '' }])}
              className="text-xs font-bold text-[#F47551] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Etapa
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-[#F47551] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                  {idx + 1}
                </span>
                <textarea
                  rows={2}
                  value={step.instruction}
                  onChange={(e) => {
                    const copy = [...steps];
                    copy[idx].instruction = e.target.value;
                    setSteps(copy);
                  }}
                  placeholder="Instrução da etapa..."
                  className="flex-1 p-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                  className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Seção 5: Tabela Nutricional */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#333333] border-b pb-2 flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#F47551]" /> 5. Informações Nutricionais (Por porção)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Calorias (kcal) *</label>
              <input
                type="number"
                {...register('calories', { valueAsNumber: true })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Proteínas (g) *</label>
              <input
                type="number"
                {...register('proteins', { valueAsNumber: true })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Carboidratos (g) *</label>
              <input
                type="number"
                {...register('carbs', { valueAsNumber: true })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Gorduras (g) *</label>
              <input
                type="number"
                {...register('fats', { valueAsNumber: true })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Seção 6: Mídia (Spark Media Adapter) */}
        <MediaInput
          label="6. Mídia e Imagens da Receita"
          imageUrl={watch('imageUrl')}
          imageAssetKey={watch('imageAssetKey')}
          onChangeUrl={(val) => setValue('imageUrl', val, { shouldDirty: true })}
          onChangeAssetKey={(val) => setValue('imageAssetKey', val, { shouldDirty: true })}
        />

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/recipes')}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Salvar Receita
          </button>
        </div>
      </form>
    </div>
  );
};
