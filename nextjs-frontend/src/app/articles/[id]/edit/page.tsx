"use client";

import { useState, useEffect, FormEvent } from "react";
import InputError from "@/components/InputError";
import axios from "@/lib/axios";
import { useRouter, useParams } from "next/navigation";
import { AxiosError } from "axios";
import Image from "next/image";
import { User, Category, Article, ArticleImage } from "@/types";

interface PreviewFile {
  id: string;
  file: File;
  url: string;
}

interface SectionInput {
  id?: number;
  title: string;
  content: string;
  order: number;
  newImages: PreviewFile[];
  existingImages: ArticleImage[];
}

export default function EditArticle() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();
  const { id } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [articleOwnerId, setArticleOwnerId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [thumbnail, setThumbnail] = useState<PreviewFile | null>(null);
  const [existingThumbnail, setExistingThumbnail] =
    useState<ArticleImage | null>(null);
  const [lockVersion, setLockVersion] = useState<number>(1);
  const [sections, setSections] = useState<SectionInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, catRes, artRes] = await Promise.all([
          axios.get("/api/user"),
          axios.get("/api/categories"),
          axios.get<Article>(`/api/articles/${id}`),
        ]);

        const article = artRes.data;
        const user = userRes.data;

        if (user.role !== "member" && user.role !== "admin") {
          alert("編集にはログインが必要です。");
          router.push("/login");
          return;
        }

        setCurrentUser(user);
        setArticleOwnerId(article.user_id);

        setCategories(catRes.data);
        setTitle(article.title);
        setCategoryId(article.category_id.toString());
        setLockVersion(article.lock_version);

        const thumb = article.images?.find((img) => img.type === "thumbnail");
        if (thumb) setExistingThumbnail(thumb);

        if (article.sections) {
          const loadedSections = article.sections
            .sort((a, b) => a.order - b.order)
            .map((s) => ({
              id: s.id,
              title: s.title,
              content: s.content,
              order: s.order,
              newImages: [],
              existingImages:
                article.images?.filter(
                  (img) => img.section_id === s.id && img.type === "content",
                ) || [],
            }));
          setSections(loadedSections);
        }
      } catch (error) {
        console.error("データ取得失敗", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleDelete = async () => {
    if (
      !confirm("この記事を完全に削除しますか？\nこの操作は取り消せません。")
    ) {
      return;
    }

    try {
      await axios.delete(`/api/articles/${id}`);
      alert("記事を削除しました。");
      router.push("/");
    } catch (error) {
      console.error("削除失敗", error);
      alert("削除に失敗しました。権限がない可能性があります。");
    }
  };

  const getImageUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${path}`;

  const addSection = () => {
    setSections([
      ...sections,
      {
        title: "",
        content: "",
        order: sections.length,
        newImages: [],
        existingImages: [],
      },
    ]);
  };

  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections.map((s, i) => ({ ...s, order: i })));
  };

  const updateSection = (
    index: number,
    field: keyof Omit<SectionInput, "newImages" | "existingImages">,
    value: string,
  ) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      [field]: value,
    } as SectionInput;
    setSections(newSections);
  };

  const handleAddNewImages = (index: number, files: File[]) => {
    const totalCurrent = sections.reduce(
      (sum, s) => sum + s.newImages.length + s.existingImages.length,
      0,
    );
    if (totalCurrent + files.length > 5) {
      alert("記事全体の画像は合計5枚までです。");
      return;
    }

    const newPreviews = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
    }));

    const newSections = [...sections];
    newSections[index].newImages = [
      ...newSections[index].newImages,
      ...newPreviews,
    ];
    setSections(newSections);
  };
  const removeExistingImage = (sectionIndex: number, imageId: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].existingImages = newSections[
      sectionIndex
    ].existingImages.filter((img) => img.id !== imageId);
    setSections(newSections);
    setDeletedImageIds([...deletedImageIds, imageId]);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category_id", categoryId);
    formData.append("lock_version", lockVersion.toString());
    formData.append("_method", "PUT");

    deletedImageIds.forEach((id) =>
      formData.append("deleted_image_ids[]", id.toString()),
    );

    if (thumbnail) formData.append("thumbnail", thumbnail.file);

    sections.forEach((s, i) => {
      if (s.id) formData.append(`sections[${i}][id]`, s.id.toString());
      formData.append(`sections[${i}][title]`, s.title);
      formData.append(`sections[${i}][content]`, s.content);
      formData.append(`sections[${i}][order]`, s.order.toString());

      s.newImages.forEach((imgObj) => {
        formData.append(`sections[${i}][images][]`, imgObj.file);
      });
    });

    try {
      await axios.get("/sanctum/csrf-cookie");
      await axios.post(`/api/articles/${id}`, formData);
      alert("記事を更新しました！");
      router.push(`/articles/${id}`);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 422)
          setErrors(error.response.data.errors);
        if (error.response?.status === 409) alert(error.response.data.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const canDelete = () => {
    if (!currentUser || articleOwnerId === null) return false;
    return currentUser.role === "admin" || currentUser.id === articleOwnerId;
  };
  if (loading)
    return (
      <div className="text-center py-20 animate-pulse font-bold text-brand-teal">
        読み込み中...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-brand-dark mb-10 flex items-center gap-3">
        <span className="bg-brand-teal w-2 h-8 rounded-full"></span>
        記事を編集する
      </h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-10">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-soft/20 space-y-6">
          <div>
            <label className="block text-sm font-bold text-brand-teal mb-2 ml-1">
              記事タイトル
            </label>
            <input
              type="text"
              className={`w-full p-4 bg-gray-50 border rounded-2xl outline-none font-bold text-lg ${errors.title ? "border-red-500" : "border-brand-soft/20"}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <InputError messages={errors.title} />
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-teal mb-2 ml-1">
              カテゴリ
            </label>
            <select
              className="w-full p-4 bg-gray-50 border border-brand-soft/20 rounded-2xl outline-none"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}：{c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <label className="block text-sm font-bold text-brand-teal mb-3 ml-1">
              サムネイル画像
            </label>
            <div className="flex flex-wrap items-center gap-6">
              {(thumbnail || existingThumbnail) && (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-brand-green shadow-sm">
                  <Image
                    src={
                      thumbnail
                        ? thumbnail.url
                        : getImageUrl(existingThumbnail!.file_path)
                    }
                    alt="サムネ"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      setThumbnail({
                        id: "new",
                        file,
                        url: URL.createObjectURL(file),
                      });
                  }}
                  className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-teal file:text-white"
                />
                <p className="text-[10px] text-gray-400 mt-2">
                  ※新しい画像を選ぶと上書きされます
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-xl font-bold text-brand-dark px-2">
            見出しと本文
          </h2>
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-3xl shadow-sm border border-brand-soft/20 relative"
            >
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="absolute top-6 right-6 text-gray-300 hover:text-red-400"
                >
                  ✕ 削除
                </button>
              )}

              <input
                type="text"
                className="w-full mb-4 text-xl font-bold border-b-2 border-gray-100 focus:border-brand-green outline-none pb-2"
                value={section.title}
                onChange={(e) => updateSection(index, "title", e.target.value)}
                required
              />
              <textarea
                className="w-full h-40 p-4 bg-gray-50 border border-brand-soft/10 rounded-2xl outline-none leading-relaxed"
                value={section.content}
                onChange={(e) =>
                  updateSection(index, "content", e.target.value)
                }
                required
              />

              <div className="mt-6 p-5 bg-brand-soft/5 rounded-2xl border border-dashed border-brand-soft/30">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs font-bold text-brand-teal uppercase">
                    このセクションの画像
                  </label>
                  <span className="text-[10px] text-brand-teal font-bold">
                    {section.existingImages.length + section.newImages.length}{" "}
                    枚
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-3 mb-4">
                  {section.existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square rounded-full overflow-hidden border border-brand-soft/20 bg-gray-200"
                    >
                      <Image
                        src={getImageUrl(img.file_path)}
                        alt="existing"
                        fill
                        unoptimized
                        className="object-cover opacity-60"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-[8px] text-white font-bold pointer-events-none group-hover:opacity-0 transition-opacity">
                        保存済
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index, img.id)}
                        className="absolute inset-0 z-10 flex items-center justify-center bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                  {section.newImages.map((imgObj) => (
                    <div
                      key={imgObj.id}
                      className="relative aspect-square rounded-full overflow-hidden border-2 border-brand-green bg-white"
                    >
                      <Image
                        src={imgObj.url}
                        alt="new"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-brand-green/20 text-[8px] text-brand-teal font-bold">
                        NEW
                      </div>
                    </div>
                  ))}
                </div>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    handleAddNewImages(index, Array.from(e.target.files || []))
                  }
                  className="block w-full text-[10px] text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-brand-soft/20 file:text-brand-teal"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addSection}
            className="w-full py-4 border-2 border-dashed border-brand-soft/30 rounded-3xl text-brand-teal font-bold hover:bg-brand-soft/5 transition"
          >
            + 見出しを追加する
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 bg-brand-dark text-white rounded-3xl font-bold text-xl hover:bg-brand-teal transition shadow-xl disabled:opacity-50"
        >
          {isSubmitting ? "更新中..." : "変更を保存する"}
        </button>

        {canDelete() && (
          <div className="mt-12 pt-8 border-t border-red-100 flex justify-between items-center">
            <p className="text-sm text-gray-400">
              この記事の掲載を終了しますか？
            </p>
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-2 border-2 border-red-200 text-red-400 rounded-full font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-sm"
            >
              この記事を削除する
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
