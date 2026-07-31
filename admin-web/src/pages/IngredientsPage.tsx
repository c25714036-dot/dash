import React, { useState, useEffect } from 'react';
import { IngredientAdminRepository } from '../repositories/IngredientAdminRepository';
import { Ingredient } from '../models/types';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Plus, Search, Edit, Trash2, Carrot } from 'lucide-react';

export const IngredientsPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filtered, setFiltered] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const [formData, setFormData] = useState({
    name: '',
    category: 'Geral',
    defaultUnit: 'g',
    calories: 100,
    proteins: 5,
    carbs: 15,
    fats: 2,
    source: 'TACO / USDA',
  });

  const loadIngredients = async () => {
    setLoading(true);
    try {
      const list = await IngredientAdminRepository.list();
      setIngredients(list);
      setFiltered(list);
    } catch (err) {
      addToast('error', 'Erro ao carregar ingredientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(ingredients);
    } else {
      const term = search.toLowerCase();
      setFiltered(ingredients.filter(i => i.name.toLowerCase().includes(term) || i.category.toLowerCase().includes(term)));
    }
  }, [search, ingredients]);

  const handleOpenModal = (item?: Ingredient) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        defaultUnit: item.defaultUnit,
        calories: item.nutrientsPer100g.calories,
        proteins: item.nutrientsPer100g.proteins,
        carbs: item.nutrientsPer100g.carbs,
        fats: item.nutrientsPer100g.fats,
        source: item.source || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'Geral',
        defaultUnit: 'g',
        calories: 100,
        proteins: 5,
        carbs: 15,
        fats: 2,
        source: 'TACO / USDA',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('error', 'Insira o nome do ingrediente');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        normalizedName: formData.name.toLowerCase().trim(),
        category: formData.category,
        defaultUnit: formData.defaultUnit,
        nutrientsPer100g: {
          calories: Number(formData.calories),
          proteins: Number(formData.proteins),
          carbs: Number(formData.carbs),
          fats: Number(formData.fats),
        },
        allergenIds: [],
        source: formData.source,
        validationStatus: 'verified' as const,
        active: true,
      };

      if (editingItem) {
        await IngredientAdminRepository.update(editingItem.id, payload);
        addToast('success', 'Ingrediente atualizado com sucesso!');
      } else {
        await IngredientAdminRepository.create(payload);
        addToast('success', 'Ingrediente cadastrado com sucesso!');
      }

      setIsModalOpen(false);
      loadIngredients();
    } catch (err) {
      addToast('error', 'Erro ao salvar ingrediente');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await IngredientAdminRepository.delete(deleteId);
      addToast('success', 'Ingrediente excluído');
      setDeleteId(null);
      loadIngredients();
    } catch (err) {
      addToast('error', 'Erro ao excluir ingrediente');
    }
  };

  const columns = [
    {
      header: 'Ingrediente',
      cell: (i: Ingredient) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#F8FEDA] text-[#F47551] rounded-lg">
            <Carrot className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#333333] block">{i.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">{i.normalizedName}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Categoria',
      cell: (i: Ingredient) => <span className="text-xs text-slate-600 font-medium">{i.category}</span>,
    },
    {
      header: 'Unid. Padrão',
      cell: (i: Ingredient) => <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded-md">{i.defaultUnit}</span>,
    },
    {
      header: 'Nutrientes (por 100g)',
      cell: (i: Ingredient) => (
        <span className="text-[11px] text-slate-600">
          <strong>{i.nutrientsPer100g?.calories || 0} kcal</strong> | P:{i.nutrientsPer100g?.proteins || 0}g C:{i.nutrientsPer100g?.carbs || 0}g F:{i.nutrientsPer100g?.fats || 0}g
        </span>
      ),
    },
    {
      header: 'Ações',
      cell: (i: Ingredient) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal(i)}
            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteId(i.id)}
            className="p-1.5 border border-rose-200 rounded-lg hover:bg-rose-50 text-rose-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(p => p.filter(t => t.id !== id))} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#333333]">Gestão de Ingredientes</h2>
          <p className="text-xs text-slate-500">Cadastre e padronize a tabela nutricional de ingredientes de referência</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Ingrediente
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ingrediente ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F47551]"
          />
        </div>
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyMessage="Nenhum ingrediente cadastrado." />

      {/* Modal Formulário */}
      <Modal
        isOpen={isModalOpen}
        title={editingItem ? 'Editar Ingrediente' : 'Novo Ingrediente'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Nome do Ingrediente *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Peito de Frango Sem Pele"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Categoria</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Proteínas, Vegetais"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Unidade Padrão</label>
              <input
                type="text"
                value={formData.defaultUnit}
                onChange={(e) => setFormData({ ...formData, defaultUnit: e.target.value })}
                placeholder="Ex: g, ml, unidade"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Kcal / 100g</label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Proteínas (g)</label>
              <input
                type="number"
                value={formData.proteins}
                onChange={(e) => setFormData({ ...formData, proteins: Number(e.target.value) })}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Carbos (g)</label>
              <input
                type="number"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Gorduras (g)</label>
              <input
                type="number"
                value={formData.fats}
                onChange={(e) => setFormData({ ...formData, fats: Number(e.target.value) })}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md"
            >
              Salvar Ingrediente
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Excluir Ingrediente"
        message="Tem certeza que deseja excluir este ingrediente?"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
