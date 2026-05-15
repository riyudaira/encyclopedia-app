"use client";

import { useState, useEffect, FormEvent, useRef } from "react"; // useRef を追加
import InputError from "@/components/InputError";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Category } from "@/types";
import { AxiosError } from "axios";
import Image from "next/image";

interface PreviewFile {
  id: string;
  file: File;
  url: string;
}

interface SectionInput {
  title: string;
  content: string;
  order: number;
  images: PreviewFile[];
}

export default function CreateArticle() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  // フォームの状態
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [thumbnail, setThumbnail] = useState<PreviewFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<SectionInput[]>([
    { title: "概要", content: "", order: 0, images: [] },
  ]);

  // --- 【解決の鍵】生成した全URLを記録しておくための Ref ---
  const allGeneratedUrls = useRef<Set<string>>(new Set());

  // URLを作成し、Refに登録する共通関数
  const createPreviewUrl = (file: File) => {
    const url = URL.createObjectURL(file);
    allGeneratedUrls.current.add(url);
    return url;
  };

  useEffect(() => {
    // 1. 効果の中で現在の Ref の中身を変数にコピーする
    const urlsToCleanup = allGeneratedUrls.current;

    return () => {
      // 2. クリーンアップ関数の中では、そのコピーした変数を使う
      urlsToCleanup.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        await axios.get("/api/user");
        const res = await axios.get("/api/categories");
        setCategories(res.data);
      } catch {
        router.push("/login");
      }
    };
    checkAuthAndFetch();
  }, [router]);

  const totalImageCount = sections.reduce(
    (total, s) => total + s.images.length,
    0,
  );

  const handleThumbnailChange = (file: File | null) => {
    if (thumbnail) {
      URL.revokeObjectURL(thumbnail.url);
      allGeneratedUrls.current.delete(thumbnail.url);
    }
    if (file) {
      setThumbnail({
        id: Math.random().toString(),
        file,
        url: createPreviewUrl(file),
      });
    } else {
      setThumbnail(null);
    }
  };

  const addSection = () => {
    if (sections.length < 10) {
      setSections([
        ...sections,
        { title: "", content: "", order: sections.length, images: [] },
      ]);
    }
  };

  const removeSection = (index: number) => {
    sections[index].images.forEach((img) => {
      URL.revokeObjectURL(img.url);
      allGeneratedUrls.current.delete(img.url);
    });
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections.map((s, i) => ({ ...s, order: i })));
  };

  const updateSection = (
    index: number,
    field: keyof Omit<SectionInput, "images">,
    value: string,
  ) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const handleAddSectionImages = (index: number, files: File[]) => {
    const newFilesCount = files.length;
    if (totalImageCount + newFilesCount > 5) {
      alert(`合計5枚までです。`);
      return;
    }

    const newPreviews: PreviewFile[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: createPreviewUrl(file),
    }));

    const newSections = [...sections];
    newSections[index].images = [...newSections[index].images, ...newPreviews];
    setSections(newSections);
  };

  const removeImage = (sectionIndex: number, imageId: string) => {
    const newSections = [...sections];
    const imageToRemove = newSections[sectionIndex].images.find(
      (img) => img.id === imageId,
    );
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.url);
      allGeneratedUrls.current.delete(imageToRemove.url);
    }
    newSections[sectionIndex].images = newSections[sectionIndex].images.filter(
      (img) => img.id !== imageId,
    );
    setSections(newSections);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category_id", categoryId);
    if (thumbnail) {
      formData.append("thumbnail", thumbnail.file);
    }
    sections.forEach((s, i) => {
      formData.append(`sections[${i}][title]`, s.title);
      formData.append(`sections[${i}][content]`, s.content);
      formData.append(`sections[${i}][order]`, s.order.toString());
      s.images.forEach((imgObj) => {
        formData.append(`sections[${i}][images][]`, imgObj.file);
      });
    });

    try {
      await axios.get("/sanctum/csrf-cookie");
      await axios.post("/api/articles", formData);
      alert("記事を公開しました！");
      router.push("/");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 422) {
          setErrors(error.response.data.errors);
          alert("入力内容を確認してください。赤字でエラーが表示されています。");
          return;
        }
      }
      alert("投稿に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-brand-dark mb-10 flex items-center">
        <span className="bg-brand-green w-2 h-8 mr-3 rounded-full"></span>
        新しい記事を書く
      </h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-10">
        {/* --- UI部分は以前と同じなので省略 --- */}
        {/* ... (タイトル、カテゴリ、サムネイル、セクションなどのJSX) ... */}

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-soft/20 space-y-6">
          <div>
            <label className="block text-sm font-bold text-brand-teal mb-2 ml-1">
              記事タイトル
            </label>
            <input
              type="text"
              className={`w-full p-4 bg-gray-50 border rounded-2xl outline-none transition ${errors.title ? "border-red-500" : "border-brand-soft/20"}`}
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
              className={`w-full p-4 bg-gray-50 border rounded-2xl outline-none ${errors.category_id ? "border-red-500" : "border-brand-soft/20"}`}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">選択してください</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}：{c.name}
                </option>
              ))}
            </select>
            <InputError messages={errors.category_id} />
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-teal mb-2 ml-1">
              サムネイル画像
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleThumbnailChange(e.target.files?.[0] || null)
              }
              className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-teal file:text-white"
            />
            {thumbnail && (
              <div className="mt-4 relative w-48 h-32 rounded-2xl overflow-hidden border border-brand-soft/20 group">
                <Image
                  src={thumbnail.url}
                  alt="thumbnail"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleThumbnailChange(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            )}
            <InputError messages={errors.thumbnail} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-brand-dark">見出しと本文</h2>
            <span className="text-xs font-bold text-brand-teal bg-brand-soft/10 px-3 py-1 rounded-full">
              画像合計: {totalImageCount} / 5枚
            </span>
          </div>

          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-3xl shadow-sm border border-brand-soft/20 relative"
            >
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="absolute top-6 right-6 text-gray-300 hover:text-red-400 text-sm"
                >
                  ✕ 削除
                </button>
              )}

              <input
                type="text"
                placeholder="見出し"
                className={`w-full mb-4 text-xl font-bold border-b-2 outline-none pb-2 ${errors[`sections.${index}.title`] ? "border-red-500" : "border-gray-100"}`}
                value={section.title}
                onChange={(e) => updateSection(index, "title", e.target.value)}
                required
              />
              <InputError messages={errors[`sections.${index}.title`]} />

              <textarea
                placeholder="本文..."
                className={`w-full h-40 p-4 bg-gray-50 border rounded-2xl outline-none ${errors[`sections.${index}.content`] ? "border-red-500" : "border-brand-soft/10"}`}
                value={section.content}
                onChange={(e) =>
                  updateSection(index, "content", e.target.value)
                }
                required
              />
              <InputError messages={errors[`sections.${index}.content`]} />

              <div className="mt-6 p-5 bg-brand-soft/5 rounded-2xl border border-dashed border-brand-soft/30">
                <label className="block text-xs font-bold text-brand-teal mb-3">
                  このセクションの画像を追加
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    handleAddSectionImages(
                      index,
                      Array.from(e.target.files || []),
                    )
                  }
                  className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-soft/20 file:text-brand-teal transition cursor-pointer"
                />

                {section.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {section.images.map((imgObj) => (
                      <div
                        key={imgObj.id}
                        className="relative aspect-square rounded-xl overflow-hidden border border-brand-soft/20 bg-white group"
                      >
                        <Image
                          src={imgObj.url}
                          alt="preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, imgObj.id)}
                          className="absolute top-1 right-1 bg-black/50 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <InputError messages={errors[`sections.${index}.images`]} />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addSection}
            className="w-full py-6 border-2 border-dashed border-brand-soft/30 rounded-3xl text-brand-teal font-bold hover:bg-brand-soft/5 transition"
          >
            + 見出しを追加する
          </button>
          <InputError messages={errors.sections} />
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-brand-dark text-white rounded-3xl font-bold text-xl hover:bg-brand-teal transition shadow-2xl disabled:opacity-50"
          >
            {loading ? "送信中..." : "この記事を公開する"}
          </button>
        </div>
      </form>
    </div>
  );
}
