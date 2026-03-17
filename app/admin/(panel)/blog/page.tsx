"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  BookOpen,
  Search,
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

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function BlogAdminPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/blog");
      if (res.data.success) setArticles(res.data.data);
    } catch {
      toast.error("Ошибка загрузки статей");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  async function handleDelete(id: string) {
    try {
      await axiosInstance.delete(`/admin/blog/${id}`);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      toast.success("Статья удалена");
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-lg font-bold text-neutral-800">Блог</h1>
        <button onClick={loadArticles} className="text-neutral-300 hover:text-neutral-500 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="h-[30px] w-48 rounded border border-neutral-300 bg-white pl-8 pr-3 text-[13px] outline-none focus:border-[#1195eb] transition-colors"
            />
          </div>
          <button
            onClick={() => router.push("/admin/blog/new")}
            className="inline-flex items-center gap-1.5 h-[30px] rounded border border-neutral-300 bg-white px-3 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 text-[#1195eb]" />
            Статья
          </button>
        </div>

        <span className="text-xs text-neutral-400">{articles.length} шт</span>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-neutral-200">
              <th className="w-16 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Фото</th>
              <th className="px-3 py-2 text-left font-semibold text-neutral-500 text-[11px]">Заголовок</th>
              <th className="w-36 px-3 py-2 text-left font-semibold text-neutral-500 text-[11px]">URL</th>
              <th className="w-20 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Статус</th>
              <th className="w-28 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Дата</th>
              <th className="w-16 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <RefreshCw className="h-5 w-5 animate-spin text-neutral-300 mx-auto" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-neutral-400">
                  <BookOpen className="h-8 w-8 mx-auto text-neutral-200 mb-2" />
                  {search ? "Ничего не найдено" : "Нет статей"}
                </td>
              </tr>
            ) : (
              filtered.map((article) => (
                <tr key={article.id} className="border-b border-neutral-200 hover:bg-[#e8f4fd] transition-colors">
                  <td className="px-3 py-2 text-center">
                    {article.image ? (
                      <img src={article.image} alt="" className="h-10 w-14 object-cover rounded mx-auto" />
                    ) : (
                      <div className="h-10 w-14 bg-neutral-100 rounded mx-auto flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-neutral-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-medium text-neutral-800 line-clamp-1">{article.title}</p>
                    {article.excerpt && (
                      <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{article.excerpt}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-neutral-500 text-[11px]">{article.slug}</td>
                  <td className="px-3 py-2 text-center">
                    {article.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <Eye className="h-3 w-3" /> Опубл.
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400">
                        <EyeOff className="h-3 w-3" /> Черновик
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center text-neutral-500 text-[11px]">
                    {new Date(article.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <button
                        onClick={() => router.push(`/admin/blog/${article.id}`)}
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
                            <AlertDialogTitle>Удалить «{article.title}»?</AlertDialogTitle>
                            <AlertDialogDescription>Статья будет удалена безвозвратно.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(article.id)} className="bg-red-500 hover:bg-red-600">
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
