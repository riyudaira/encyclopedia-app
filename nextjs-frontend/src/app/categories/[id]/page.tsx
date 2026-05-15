"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "@/lib/axios";
import { Article, Category, PaginatedResponse } from "@/types";
import Link from "next/link";

export default function CategoryArchive() {
  const { id } = useParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const [catRes, artRes] = await Promise.all([
          axios.get(`/api/categories`),
          axios.get<PaginatedResponse<Article>>(
            `/api/articles?category_id=${id}`,
          ),
        ]);

        const currentCat = catRes.data.find(
          (c: Category) => c.id === Number(id),
        );
        setCategory(currentCat);
        setArticles(artRes.data.data);
      } catch (error) {
        console.error("取得失敗", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryData();
  }, [id]);

  if (loading) return <div className="text-center py-20">読み込み中...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-10 pb-6 border-b border-brand-soft/20">
        <p className="text-brand-teal font-bold text-sm mb-2 uppercase tracking-widest">
          Category {category?.code}
        </p>
        <h1 className="text-3xl font-bold text-brand-dark">
          「{category?.name}」の記事一覧
        </h1>
      </div>

      <div className="grid gap-6">
        {articles.length > 0 ? (
          articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.id}`}
              className="group bg-white p-6 rounded-3xl border border-brand-soft/10 shadow-sm hover:border-brand-green transition-all"
            >
              <h2 className="text-xl font-bold text-brand-dark group-hover:text-brand-green transition-colors">
                {article.title}
              </h2>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span>👁 {article.view_count} views</span>
                <span>
                  📅 {new Date(article.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-brand-soft/20 text-gray-400">
            このカテゴリにはまだ記事がありません。
          </div>
        )}
      </div>
    </div>
  );
}
