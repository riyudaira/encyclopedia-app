"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Article, Category } from "@/types";
import Link from "next/link";

// welcome を追加
type ViewMode = "new" | "popular" | "categories" | "welcome";

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [welcomeArticle, setWelcomeArticle] = useState<Article | null>(null); // 追加
  const [viewMode, setViewMode] = useState<ViewMode>("new");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (viewMode === "categories") {
          const res = await axios.get("/api/categories");
          setCategories(res.data);
        } else if (viewMode === "welcome") {
          // 「はじめての方へ」というタイトルで検索して取得
          const res = await axios.get(`/api/articles?q=はじめての方へ`);
          // 検索結果の1件目を取得
          if (res.data.data.length > 0) {
            const detail = await axios.get(
              `/api/articles/${res.data.data[0].id}`,
            );
            setWelcomeArticle(detail.data);
          }
        } else {
          const res = await axios.get(`/api/articles?sort=${viewMode}&limit=5`);
          setArticles(res.data.data);
        }
      } catch (error) {
        console.error("データ取得失敗:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [viewMode]);

  return (
    <main className="min-h-screen bg-gray-50 text-brand-dark">
      <div className="bg-brand-dark text-white py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">百科事典〜もんじゅ〜</h1>
        <p className="text-brand-soft">
          知識を共有し、新しい発見をしましょう。
        </p>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* タブメニュー：4つに増やしました */}
        <div className="flex border-b border-brand-soft/30 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button
            onClick={() => setViewMode("new")}
            className={`px-6 py-3 font-bold transition-all ${viewMode === "new" ? "border-b-4 border-brand-green text-brand-green" : "text-gray-400 hover:text-brand-teal"}`}
          >
            新着記事
          </button>
          <button
            onClick={() => setViewMode("popular")}
            className={`px-6 py-3 font-bold transition-all ${viewMode === "popular" ? "border-b-4 border-brand-green text-brand-green" : "text-gray-400 hover:text-brand-teal"}`}
          >
            注目の記事
          </button>
          <button
            onClick={() => setViewMode("categories")}
            className={`px-6 py-3 font-bold transition-all ${viewMode === "categories" ? "border-b-4 border-brand-green text-brand-green" : "text-gray-400 hover:text-brand-teal"}`}
          >
            カテゴリを選択
          </button>
          <button
            onClick={() => setViewMode("welcome")}
            className={`px-6 py-3 font-bold transition-all ${viewMode === "welcome" ? "border-b-4 border-brand-green text-brand-green" : "text-gray-400 hover:text-brand-teal"}`}
          >
            はじめての方へ
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-brand-teal font-bold animate-pulse">
            読み込み中...
          </div>
        ) : (
          <>
            {viewMode === "categories" && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 animate-in fade-in duration-500">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/categories/${c.id}`}
                    className="group flex flex-col items-center p-6 bg-white rounded-3xl border border-brand-soft/20 shadow-sm hover:border-brand-green transition-all"
                  >
                    <span className="text-2xl mb-2 group-hover:scale-125 transition-transform">
                      {c.code}
                    </span>
                    <span className="text-sm font-bold text-brand-teal group-hover:text-brand-green text-center">
                      {c.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {viewMode === "welcome" && welcomeArticle && (
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-brand-soft/10 animate-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-3xl font-bold text-brand-dark mb-10 text-center flex items-center justify-center gap-3">
                  <span className="text-brand-green">📖</span>{" "}
                  {welcomeArticle.title}
                </h2>
                <div className="space-y-12">
                  {welcomeArticle.sections?.map((s) => (
                    <section key={s.id}>
                      <h3 className="text-xl font-bold border-l-4 border-brand-green pl-4 mb-4 text-brand-dark">
                        {s.title}
                      </h3>
                      <div className="text-gray-600 leading-relaxed whitespace-pre-wrap pl-1">
                        {s.content}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}

            {(viewMode === "new" || viewMode === "popular") && (
              <div className="grid gap-4 animate-in fade-in duration-500">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.id}`}
                    className="block p-5 bg-white rounded-2xl shadow-sm border border-brand-soft/10 hover:border-brand-green transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold px-3 py-1 bg-brand-soft/10 text-brand-teal rounded-full mb-3 inline-block uppercase">
                          {article.category.name}
                        </span>
                        <h2 className="text-xl font-bold group-hover:text-brand-green transition-colors">
                          {article.title}
                        </h2>
                      </div>
                      <div className="text-right text-xs text-gray-400 font-medium">
                        <p className="mb-1">
                          {new Date(article.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center justify-end gap-1 text-brand-teal/60">
                          <span>👁</span>
                          <span>{article.view_count}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
