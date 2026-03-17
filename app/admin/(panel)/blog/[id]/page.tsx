"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RichEditor } from "@/components/ui/rich-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { axiosInstance } from "@/lib/services/instance";
import { slugify } from "@/lib/slugify";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const articleId = params.id;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(`/admin/blog/${articleId}`)
      .then((res) => {
        if (res.data.success) {
          const a = res.data.data;
          setTitle(a.title);
          setSlug(a.slug);
          setContent(a.content);
          setExcerpt(a.excerpt || "");
          setImage(a.image);
          setIsActive(a.isActive);
        }
      })
      .catch(() => toast.error("Ошибка загрузки статьи"))
      .finally(() => setLoading(false));
  }, [articleId]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axiosInstance.post("/admin/upload", formData);
      if (res.data.success) setImage(res.data.data.url);
      toast.success("Обложка загружена");
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Заполните заголовок и содержание");
      return;
    }
    setSaving(true);
    try {
      const res = await axiosInstance.put(`/admin/blog/${articleId}`, {
        title, slug, content, excerpt: excerpt || null, image, isActive,
      });
      if (res.data.success) {
        toast.success("Статья обновлена");
        router.push("/admin/blog");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="animate-spin block h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Редактировать статью</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Содержание</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Заголовок *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>URL (slug)</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Краткое описание (для карточки и SEO)</Label>
                  <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Текст статьи *</Label>
                  <RichEditor value={content} onChange={setContent} placeholder="Текст статьи..." />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Обложка</CardTitle></CardHeader>
              <CardContent>
                {image ? (
                  <div className="relative rounded-lg overflow-hidden border">
                    <img src={image} alt="" className="w-full aspect-video object-cover" />
                    <button type="button" onClick={() => setImage(null)} className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full bg-red-500 text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex aspect-video cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    <div className="text-center">
                      {uploading ? (
                        <span className="animate-spin block mx-auto h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full" />
                      ) : (
                        <>
                          <Upload className="mx-auto h-6 w-6 text-muted-foreground/40" />
                          <span className="mt-1 block text-xs text-muted-foreground">Загрузить обложку</span>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Параметры</CardTitle></CardHeader>
              <CardContent>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(!!v)} />
                  <span className="text-sm">Опубликовать</span>
                </label>
              </CardContent>
            </Card>

            <Button type="submit" disabled={saving} className="h-12 w-full bg-accent text-base font-semibold text-accent-foreground hover:bg-accent/90">
              {saving ? "Сохраняем..." : "Сохранить изменения"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
