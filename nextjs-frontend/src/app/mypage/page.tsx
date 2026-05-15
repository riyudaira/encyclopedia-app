"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Article, User, PaginatedResponse } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, artRes] = await Promise.all([
          axios.get("/api/user"),
          axios.get<PaginatedResponse<Article>>("/api/articles?user_id=me"),
        ]);
        setUser(userRes.data);
        setArticles(artRes.data.data);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading)
    return (
      <div className="text-center py-20 text-brand-teal">読み込み中...</div>
    );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {user?.role === "admin" && (
        <div className="mb-10 p-6 bg-brand-teal text-white rounded-3xl shadow-lg shadow-brand-teal/20 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                <span>🛡️</span> 管理者専用メニュー
              </h2>
              <p className="text-sm opacity-80">
                届いている通報の確認や、サイトの管理が行えます。
              </p>
            </div>
            <Link
              href="/admin/reports"
              className="bg-white text-brand-teal px-6 py-2 rounded-full font-bold hover:bg-brand-soft hover:text-white transition-all shadow-sm"
            >
              通報一覧を見る
            </Link>
            <Link
              href="/admin/users"
              className="bg-white text-brand-teal px-6 py-2 rounded-full font-bold hover:bg-brand-soft hover:text-white transition-all shadow-sm"
            >
              ユーザー管理（凍結・解除）
            </Link>
          </div>
        </div>
      )}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-soft/20 mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark mb-1">
            {user?.name}{" "}
            <span className="text-sm font-normal text-gray-400 text-brand-soft">
              さんのマイページ
            </span>
          </h1>
          <p className="text-sm text-brand-teal opacity-70">{user?.email}</p>
        </div>
        <Link
          href="/mypage/edit"
          className="px-5 py-2 bg-brand-soft/10 text-brand-teal rounded-full text-sm font-bold hover:bg-brand-soft/20 transition"
        >
          プロフィール編集
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-brand-dark flex items-center">
          <span className="w-1.5 h-6 bg-brand-green mr-2 rounded-full"></span>
          あなたが作成した記事
        </h2>
        <Link
          href="/articles/create"
          className="text-sm text-brand-green font-bold hover:underline"
        >
          + 新しく書く
        </Link>
      </div>

      <div className="grid gap-4">
        {articles.length > 0 ? (
          articles.map((article) => (
            <div
              key={article.id}
              className="group relative bg-white p-5 rounded-2xl border border-brand-soft/10 shadow-sm hover:shadow-md hover:border-brand-green/30 transition-all flex justify-between items-center"
            >
              <Link
                href={`/articles/${article.id}`}
                className="absolute inset-0 z-0"
                aria-label={article.title}
              />

              <div className="relative z-10 pointer-events-none flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold text-brand-teal bg-brand-soft/10 px-2 py-0.5 rounded uppercase tracking-wider">
                    {article.category.name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    👁 {article.view_count.toLocaleString()} views
                  </span>
                </div>

                <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-green transition-colors">
                  {article.title}
                </h3>

                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <span>📅</span>
                  作成日:{" "}
                  {new Date(article.created_at).toLocaleDateString("ja-JP")}
                </p>
              </div>

              <div className="relative z-20 ml-4">
                <Link
                  href={`/articles/${article.id}/edit`}
                  className="flex items-center justify-center w-12 h-12 bg-gray-50 text-gray-400 hover:text-brand-teal hover:bg-brand-soft/10 rounded-full transition-all text-xl shadow-inner border border-transparent hover:border-brand-soft/20"
                  title="編集する"
                >
                  ⚙️
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-brand-soft/20">
            <p className="text-gray-400">まだ投稿した記事はありません。</p>
          </div>
        )}
      </div>
    </div>
  );
}
