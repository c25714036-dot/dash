import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { exerciseSchema } from '../validation/schemas';
import { ExerciseAdminRepository } from '../repositories/ExerciseAdminRepository';
import { MuscleGroupAdminRepository } from '../repositories/MuscleGroupAdminRepository';
import { EquipmentAdminRepository } from '../repositories/EquipmentAdminRepository';
import { Exercise, MuscleGroup, Equipment, EditorialStatus } from '../models/types';
import { MediaInput } from '../components/common/MediaInput';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { useAuth } from '../hooks/useAuth';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { 
  Save, ArrowLeft, Send, Dumbbell, ShieldAlert, Activity, CheckCircle2 
} from 'lucide-react';
import { z } from 'zod';

type ExerciseFormValues = z.infer<typeof exerciseSchema>;

export const ExerciseFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const toastId = Date.now().toString();
    setToasts(p => [...p, { id: toastId, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== toastId)), 4000);
  };

  const { register, handleSubmit, setValue, watch, formState: { errors, isDirty } } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      category: 'Força',
      movementPattern: 'Empurrar',
      primaryMuscleGroup: 'Peitoral',
      level: 'Iniciante',
      impact: 'Médio',
      complexity: 'Simples',
      startingPosition: 'Deite-se no banco plano com os pés firmes no chão.',
      executionStepsText: 'Suba a barra com controle expirando o ar.\nRetorne à posição inicial inspirando.',
      breathingGuide: 'Inspire na descida, expire na subida.',
      suggestedSets: 3,
      minReps: 10,
      maxReps: 12,
      restSeconds: 60,
      imageUrl: '',
      imageAssetKey: '',
    },
  });

  useUnsavedChanges(isDirty);

  useEffect(() => {
    async function init() {
      try {
        const [muscles, eq] = await Promise.all([
          MuscleGroupAdminRepository.list(),
          EquipmentAdminRepository.list(),
        ]);
        setMuscleGroups(muscles);
        setEquipmentList(eq);

        if (id && id !== 'new') {
          const fetched = await ExerciseAdminRepository.getById(id);
          if (fetched) {
            setCurrentExercise(fetched);
            setValue('name', fetched.name);
            setValue('slug', fetched.slug);
            setValue('shortDescription', fetched.shortDescription);
            setValue('fullDescription', fetched.fullDescription);
            setValue('category', fetched.category);
            setValue('movementPattern', fetched.movementPattern);
            setValue('primaryMuscleGroup', fetched.primaryMuscleGroup);
            setValue('level', fetched.level);
            setValue('impact', fetched.impact);
            setValue('complexity', fetched.complexity);
            setValue('startingPosition', fetched.startingPosition);
            setValue('executionStepsText', fetched.executionSteps?.join('\n') || '');
            setValue('breathingGuide', fetched.breathingGuide);
            setValue('commonMistakesText', fetched.commonMistakes?.join('\n') || '');
            setValue('precautionsText', fetched.precautions?.join('\n') || '');
            setValue('stopConditionsText', fetched.stopConditions?.join('\n') || '');
            setValue('suggestedSets', fetched.prescription?.suggestedSets || 3);
            setValue('minReps', fetched.prescription?.minReps || 8);
            setValue('maxReps', fetched.prescription?.maxReps || 12);
            setValue('durationSeconds', fetched.prescription?.durationSeconds || 0);
            setValue('restSeconds', fetched.prescription?.restSeconds || 60);
            setValue('imageUrl', fetched.media?.imageUrl || '');
            setValue('imageAssetKey', fetched.media?.imageAssetKey || '');
          }
        }
      } catch (err) {
        addToast('error', 'Erro ao carregar dados do exercício');
      }
    }
    init();
  }, [id, setValue]);

  const onSave = async (values: ExerciseFormValues, statusOverride?: EditorialStatus) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        shortDescription: values.shortDescription,
        fullDescription: values.fullDescription,
        status: statusOverride || currentExercise?.status || 'draft',
        category: values.category,
        movementPattern: values.movementPattern,
        primaryMuscleGroup: values.primaryMuscleGroup,
        secondaryMuscleGroups: [],
        equipment: [],
        location: ['Academia' as const],
        goals: ['Hipertrofia'],
        level: values.level,
        impact: values.impact,
        complexity: values.complexity,
        startingPosition: values.startingPosition,
        executionSteps: values.executionStepsText.split('\n').filter(s => s.trim()),
        breathingGuide: values.breathingGuide,
        commonMistakes: values.commonMistakesText ? values.commonMistakesText.split('\n').filter(s => s.trim()) : [],
        precautions: values.precautionsText ? values.precautionsText.split('\n').filter(s => s.trim()) : [],
        stopConditions: values.stopConditionsText ? values.stopConditionsText.split('\n').filter(s => s.trim()) : [],
        prescription: {
          metricType: 'reps' as const,
          suggestedSets: values.suggestedSets,
          minReps: values.minReps,
          maxReps: values.maxReps,
          durationSeconds: values.durationSeconds,
          restSeconds: values.restSeconds,
        },
        media: {
          imageUrl: values.imageUrl,
          imageAssetKey: values.imageAssetKey,
          videoUrl: values.videoUrl,
          videoAssetKey: values.videoAssetKey,
        }
      };

      if (id && id !== 'new') {
        await ExerciseAdminRepository.update(id, payload, user?.email || undefined, 'Edição de exercício realizada');
        addToast('success', 'Exercício atualizado com sucesso!');
        setTimeout(() => navigate('/exercises'), 1000);
      } else {
        await ExerciseAdminRepository.create(payload, user?.email || undefined);
        addToast('success', 'Exercício criado com sucesso!');
        setTimeout(() => navigate('/exercises'), 1000);
      }
    } catch (err) {
      addToast('error', 'Erro ao salvar exercício. Verifique os campos.');
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
            onClick={() => navigate('/exercises')}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#333333]">
              {id === 'new' ? 'Novo Exercício' : `Editar Exercício: ${currentExercise?.name || ''}`}
            </h2>
            <span className="text-xs text-slate-400">Preencha com atenção o padrão de movimento e cuidados de execução</span>
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
            <Dumbbell className="w-4 h-4 text-[#CCB1F6]" /> 1. Identificação do Exercício
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Nome do Exercício *</label>
              <input
                type="text"
                {...register('name')}
                placeholder="Ex: Supino Reto com Barra"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F47551]"
              />
              {errors.name && <span className="text-[11px] text-rose-600">{errors.name.message}</span>}
            </div>

            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Slug URL *</label>
              <input
                type="text"
                {...register('slug')}
                placeholder="ex: supino-reto-barra"
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
              placeholder="Exercício multiarticular focado em peitoral, deltoides e tríceps."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F47551]"
            />
            {errors.shortDescription && <span className="text-[11px] text-rose-600">{errors.shortDescription.message}</span>}
          </div>

          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Descrição Completa *</label>
            <textarea
              rows={3}
              {...register('fullDescription')}
              placeholder="Detalhes sobre a mecânica do movimento, ativação neuromuscular e variação postural."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F47551]"
            />
            {errors.fullDescription && <span className="text-[11px] text-rose-600">{errors.fullDescription.message}</span>}
          </div>
        </div>

        {/* Seção 2: Classificação biomecânica */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#333333] border-b pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#CCB1F6]" /> 2. Classificação Biomecânica
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Categoria *</label>
              <select {...register('category')} className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50">
                <option value="Força">Força</option>
                <option value="Cardio">Cardio</option>
                <option value="Mobilidade">Mobilidade</option>
                <option value="Calistenia">Calistenia</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Padrão de Movimento *</label>
              <select {...register('movementPattern')} className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50">
                <option value="Empurrar">Empurrar</option>
                <option value="Puxar">Puxar</option>
                <option value="Agachar">Agachar</option>
                <option value="Dobrar Quadril">Dobrar Quadril</option>
                <option value="Carregar">Carregar</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Grupo Muscular Principal *</label>
              <select {...register('primaryMuscleGroup')} className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50">
                <option value="Peitoral">Peitoral</option>
                <option value="Costas">Costas</option>
                <option value="Quadríceps">Quadríceps</option>
                <option value="Posterior de Coxa">Posterior de Coxa</option>
                <option value="Ombros">Ombros</option>
                <option value="Bíceps">Bíceps</option>
                <option value="Tríceps">Tríceps</option>
                <option value="Core/Sêmen">Core / Abdômen</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Nível de Dificuldade</label>
              <select {...register('level')} className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50">
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seção 3: Execução & Respiração */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#333333] border-b pb-2">3. Execução & Guia de Respiração</h3>

          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Posição Inicial *</label>
            <input
              type="text"
              {...register('startingPosition')}
              placeholder="Ex: Deitado no banco com os pés no chão, pegada um pouco mais larga que os ombros."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Passos da Execução (um por linha) *</label>
            <textarea
              rows={4}
              {...register('executionStepsText')}
              placeholder="1. Destrave a barra do suporte&#10;2. Descenda até o peito de forma controlada&#10;3. Empurre até a extensão quase completa."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Guia de Respiração *</label>
            <input
              type="text"
              {...register('breathingGuide')}
              placeholder="Ex: Inspire na descida e expire na fase concêntrica (empurrão)."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>
        </div>

        {/* Seção 4: Prescrição básica */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#333333] border-b pb-2">4. Prescrição Básica Recomendada</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Séries Sugeridas</label>
              <input
                type="number"
                {...register('suggestedSets', { valueAsNumber: true })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Reps Mínimas</label>
              <input
                type="number"
                {...register('minReps', { valueAsNumber: true })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Reps Máximas</label>
              <input
                type="number"
                {...register('maxReps', { valueAsNumber: true })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Descanso (segundos)</label>
              <input
                type="number"
                {...register('restSeconds', { valueAsNumber: true })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Seção 5: Mídia */}
        <MediaInput
          label="5. Mídia e Demonstração do Exercício"
          imageUrl={watch('imageUrl')}
          imageAssetKey={watch('imageAssetKey')}
          onChangeUrl={(val) => setValue('imageUrl', val, { shouldDirty: true })}
          onChangeAssetKey={(val) => setValue('imageAssetKey', val, { shouldDirty: true })}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/exercises')}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Salvar Exercício
          </button>
        </div>
      </form>
    </div>
  );
};
