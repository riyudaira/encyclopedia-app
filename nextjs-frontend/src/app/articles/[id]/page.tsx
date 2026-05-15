"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { Article, User } from "@/types";
import Image from "next/image";
import Link from "next/link";

export default function ArticleDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artRes, userRes] = await Promise.all([
          axios.get<Article>(`/api/articles/${id}`),
          axios.get("/api/user").catch(() => ({ data: null })),
        ]);
        setArticle(artRes.data);
        setCurrentUser(userRes.data);
      } catch (error) {
        console.error("記事の取得に失敗しました", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getImageUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${path}`;

  const canEdit = () => {
    return currentUser !== null;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-brand-teal font-bold animate-pulse">
        読み込み中...
      </div>
    );

  if (!article)
    return (
      <div className="text-center py-20 text-gray-500">
        記事が見つかりませんでした。
      </div>
    );

  const thumbnail = article.images?.find((img) => img.type === "thumbnail");

  return (
    <article className="max-w-4xl mx-auto py-12 px-4 bg-white md:my-8 md:rounded-3xl md:shadow-sm">
      {/* 編集ボタン */}
      {canEdit() && (
        <div className="flex justify-end mb-6">
          <Link
            href={`/articles/${id}/edit`}
            className="flex items-center gap-2 bg-brand-soft/10 text-brand-teal px-6 py-2 rounded-full font-bold hover:bg-brand-green hover:text-white transition-all shadow-sm text-sm"
          >
            <span>📝</span> 編集する
          </Link>
        </div>
      )}

      {/* サムネイル：小さく丸く中央寄せ */}
      {thumbnail && (
        <div className="flex justify-center mb-10">
          <div className="relative w-32 h-32 md:w-48 md:h-48 overflow-hidden rounded-2xl border-4 border-brand-soft/20 shadow-md">
            <Image
              src={getImageUrl(thumbnail.file_path)}
              alt="メインサムネイル"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
      )}

      <header className="mb-12 border-b border-brand-soft/20 pb-8 text-center">
        <div className="flex justify-center gap-3 mb-6">
          <Link href={`/categories/${article.category.id}`}>
            <span className="bg-brand-green text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm hover:bg-brand-teal transition-colors cursor-pointer">
              {article.category.name}
            </span>
          </Link>
          <time className="text-sm text-gray-400 font-medium self-center">
            {new Date(article.created_at).toLocaleDateString("ja-JP")}
          </time>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-brand-dark tracking-tight">
          {article.title}
        </h1>

        <div className="inline-flex items-center gap-6 p-4 bg-gray-50 rounded-2xl text-brand-teal text-sm">
          <span className="font-bold">👤 {article.user?.name || "匿名"}</span>
          <span className="opacity-70">
            👁 {article.view_count.toLocaleString()} views
          </span>
        </div>
      </header>

      <div className="space-y-16">
        {article.sections
          ?.sort((a, b) => a.order - b.order)
          .map((section) => (
            <section key={section.id}>
              <h2 className="text-2xl font-bold border-l-8 border-brand-green pl-5 mb-8 text-brand-dark tracking-tight">
                {section.title}
              </h2>

              {/* セクション画像：丸いアイコン風のグリッド並び */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
                {article.images
                  ?.filter((img) => img.section_id === section.id)
                  .map((img) => (
                    <div
                      key={img.id}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-sm border border-brand-soft/20 bg-gray-50 hover:scale-105 transition-transform duration-300">
                        <Image
                          src={getImageUrl(img.file_path)}
                          alt="本文画像"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
              </div>

              <div className="text-lg leading-relaxed text-brand-dark whitespace-pre-wrap">
                {section.content}
              </div>
            </section>
          ))}
      </div>

      <div className="mt-24 pt-10 border-t border-brand-soft/20 flex flex-col items-center gap-4">
        <Link
          href={`/articles/${article.id}/report`}
          className="flex items-center gap-2 px-6 py-3 border-2 border-brand-soft/30 text-brand-soft rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-400 transition-all font-bold text-sm"
        >
          <span>🚩</span> この記事を通報する
        </Link>
      </div>
    </article>
  );
}
