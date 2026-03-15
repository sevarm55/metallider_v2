"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Check,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { axiosInstance } from "@/lib/services/instance";
import { cn } from "@/lib/utils";

interface Attribute {
  id: string;
  name: string;
  key: string;
  type: "NUMBER" | "STRING" | "COLOR";
  unit: string | null;
  sortOrder: number;
  isFilter: boolean;
  _count: { values: number };
}

const typeLabels: Record<string, string> = {
  NUMBER: "Число",
  STRING: "Строка",
  COLOR: "Цвет",
};

const typeColors: Record<string, string> = {
  NUMBER: "bg-blue-100 text-blue-700",
  STRING: "bg-neutral-100 text-neutral-600",
  COLOR: "bg-purple-100 text-purple-700",
};

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formKey, setFormKey] = useState("");
  const [formType, setFormType] = useState<"NUMBER" | "STRING" | "COLOR">("STRING");
  const [formUnit, setFormUnit] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsFilter, setFormIsFilter] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAttributes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/attributes");
      if (res.data.success) setAttributes(res.data.data);
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAttributes(); }, [loadAttributes]);

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setFormName("");
    setFormKey("");
    setFormType("STRING");
    setFormUnit("");
    setFormSortOrder(0);
    setFormIsFilter(true);
  }

  function startCreate() {
    resetForm();
    setShowForm(true);
  }

  function startEdit(attr: Attribute) {
    setEditingId(attr.id);
    setFormName(attr.name);
    setFormKey(attr.key);
    setFormType(attr.type);
    setFormUnit(attr.unit || "");
    setFormSortOrder(attr.sortOrder);
    setFormIsFilter(attr.isFilter);
    setShowForm(true);
  }

  async function handleSave() {
    if (!formName.trim() || !formKey.trim()) {
      toast.error("Заполните название и ключ");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        key: formKey.trim(),
        type: formType,
        unit: formUnit.trim() || null,
        sortOrder: formSortOrder,
        isFilter: formIsFilter,
      };

      if (editingId) {
        await axiosInstance.put(`/admin/attributes/${editingId}`, payload);
        toast.success("Характеристика обновлена");
      } else {
        await axiosInstance.post("/admin/attributes", payload);
        toast.success("Характеристика создана");
      }
      resetForm();
      loadAttributes();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await axiosInstance.delete(`/admin/attributes/${id}`);
      setAttributes((prev) => prev.filter((a) => a.id !== id));
      toast.success("Характеристика удалена");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Ошибка удаления");
    }
  }

  // Auto-generate key from name
  function handleNameChange(val: string) {
    setFormName(val);
    if (!editingId) {
      setFormKey(
        val
          .toLowerCase()
          .replace(/[а-яё]/gi, (ch) => {
            const map: Record<string, string> = {
              а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"ts",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya",
            };
            return map[ch.toLowerCase()] || ch;
          })
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_|_$/g, ""),
      );
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-lg font-bold text-neutral-800">Характеристики</h1>
        <button onClick={loadAttributes} className="text-neutral-300 hover:text-neutral-500 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={startCreate}
          className="ml-auto inline-flex items-center gap-1.5 h-[30px] rounded border border-neutral-300 bg-white px-3 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
        >
          <Plus className="h-3.5 w-3.5 text-[#1195eb]" />
          Характеристика
        </button>

        <span className="text-xs text-neutral-400">{attributes.length} шт</span>
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-neutral-800">
              {editingId ? "Редактировать характеристику" : "Новая характеристика"}
            </h2>
            <button onClick={resetForm} className="text-neutral-400 hover:text-neutral-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 mb-1 block">Название *</label>
              <input
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Диаметр"
                className="h-8 w-full rounded border border-neutral-300 bg-white px-2.5 text-[13px] outline-none focus:border-[#1195eb] transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 mb-1 block">Ключ *</label>
              <input
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
                placeholder="diameter"
                className="h-8 w-full rounded border border-neutral-300 bg-white px-2.5 text-[13px] font-mono outline-none focus:border-[#1195eb] transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 mb-1 block">Тип</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="h-8 w-full rounded border border-neutral-300 bg-white px-2 text-[13px] outline-none focus:border-[#1195eb] transition-colors"
              >
                <option value="STRING">Строка</option>
                <option value="NUMBER">Число</option>
                <option value="COLOR">Цвет</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 mb-1 block">Ед. измерения</label>
              <input
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                placeholder="мм"
                className="h-8 w-full rounded border border-neutral-300 bg-white px-2.5 text-[13px] outline-none focus:border-[#1195eb] transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 mb-1 block">Сортировка</label>
              <input
                type="number"
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
                className="h-8 w-full rounded border border-neutral-300 bg-white px-2.5 text-[13px] outline-none focus:border-[#1195eb] transition-colors"
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-1.5 h-8 text-[13px] text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsFilter}
                  onChange={(e) => setFormIsFilter(e.target.checked)}
                  className="rounded"
                />
                Фильтр
              </label>
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-8 px-4 rounded bg-[#1195eb] text-white text-[13px] font-semibold hover:bg-[#0d7fd4] disabled:opacity-50 transition-colors ml-auto"
              >
                {saving ? "..." : editingId ? "Сохранить" : "Создать"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-neutral-200">
              <th className="w-10 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">№</th>
              <th className="px-3 py-2 text-left font-semibold text-neutral-500 text-[11px]">Название</th>
              <th className="w-36 px-3 py-2 text-left font-semibold text-neutral-500 text-[11px]">Ключ</th>
              <th className="w-24 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Тип</th>
              <th className="w-20 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Ед. изм.</th>
              <th className="w-16 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Порядок</th>
              <th className="w-16 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Фильтр</th>
              <th className="w-20 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Товаров</th>
              <th className="w-16 px-2 py-2 text-center">
                <Settings2 className="h-3.5 w-3.5 mx-auto text-neutral-400" />
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <RefreshCw className="h-5 w-5 animate-spin text-neutral-300 mx-auto" />
                </td>
              </tr>
            ) : attributes.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-neutral-400">
                  <SlidersHorizontal className="h-8 w-8 mx-auto text-neutral-200 mb-2" />
                  Нет характеристик
                </td>
              </tr>
            ) : (
              attributes.map((attr, idx) => (
                <tr key={attr.id} className="border-b border-neutral-200 hover:bg-[#e8f4fd] transition-colors">
                  <td className="px-3 py-2 text-center text-neutral-400">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium text-neutral-800">{attr.name}</td>
                  <td className="px-3 py-2 font-mono text-neutral-500 text-[12px]">{attr.key}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={cn("inline-block rounded px-2 py-0.5 text-[11px] font-semibold", typeColors[attr.type])}>
                      {typeLabels[attr.type]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center text-neutral-500">{attr.unit || "—"}</td>
                  <td className="px-3 py-2 text-center text-neutral-400">{attr.sortOrder}</td>
                  <td className="px-3 py-2 text-center">
                    {attr.isFilter ? (
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-neutral-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-3 py-2 text-center text-neutral-500">{attr._count.values}</td>
                  <td className="px-2 py-2 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <button
                        onClick={() => startEdit(attr)}
                        className="h-6 w-6 flex items-center justify-center rounded text-neutral-400 hover:text-[#1195eb] hover:bg-blue-50 transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="h-6 w-6 flex items-center justify-center rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить «{attr.name}»?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {attr._count.values > 0
                                ? `Будут удалены ${attr._count.values} значений у товаров.`
                                : "Характеристика будет удалена."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(attr.id)} className="bg-red-500 hover:bg-red-600">
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
