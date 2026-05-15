"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import { Article, PaginatedResponse } from "@/types";
import Link from "next/link";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await axios.get<PaginatedResponse<Article>>(
          `/api/articles?q=${query}`,
        );
        setArticles(res.data.data);
      } catch (error) {
        console.error("検索失敗", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-brand-dark mb-8">
        「<span className="text-brand-green">{query}</span>」の検索結果
        <span className="ml-4 text-sm font-normal text-gray-500">
          {articles.length} 件見つかりました
        </span>
      </h1>

      {loading ? (
        <div className="text-center py-20">検索中...</div>
      ) : articles.length > 0 ? (
        <div className="grid gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.id}`}
              className="group bg-white p-6 rounded-2xl border border-brand-soft/20 hover:border-brand-green transition-all shadow-sm"
            >
              <span className="text-xs font-bold text-brand-teal bg-brand-soft/10 px-2 py-1 rounded mb-2 inline-block">
                {article.category.name}
              </span>
              <h2 className="text-xl font-bold text-brand-dark group-hover:text-brand-green transition-colors">
                {article.title}
              </h2>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-brand-soft/30">
          <p className="text-gray-400">一致する記事が見つかりませんでした。</p>
          <Link
            href="/"
            className="text-brand-green font-bold mt-4 inline-block hover:underline"
          >
            トップへ戻る
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
