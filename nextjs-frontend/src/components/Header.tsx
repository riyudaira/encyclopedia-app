"use client";

import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation"; // usePathnameは不要になったので削除
import axios from "@/lib/axios";
import { User } from "@/types";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // ユーザー情報の取得のみuseEffectで行う
  useEffect(() => {
    axios
      .get("/api/user")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsMenuOpen(false); // 検索実行時にメニューを閉じる
  };

  const handleLogout = async () => {
    try {
      await axios.post("/logout");
      setUser(null);
      setIsMenuOpen(false); // ログアウト時にメニューを閉じる
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("ログアウトに失敗しました", error);
    }
  };

  // メニューを閉じるための共通関数
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-brand-dark text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* 1. ロゴ */}
        <div className="flex-shrink-0">
          <Link
            href="/"
            onClick={closeMenu} // クリック時に閉じる
            className="text-2xl font-bold tracking-tighter hover:text-brand-soft transition flex items-center gap-2"
          >
            もんじゅ
          </Link>
        </div>

        {/* 2. デスクトップ用検索窓 (md以上) */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 mx-8 max-w-md"
        >
          <div className="relative w-full">
            <input
              type="text"
              placeholder="知恵を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-brand-soft/30 rounded-full py-1.5 pl-4 pr-10 focus:outline-none focus:bg-white focus:text-brand-dark transition placeholder-brand-soft/70 text-sm"
            />
            <button
              type="submit"
              className="absolute right-3 top-2 text-brand-soft hover:text-brand-green"
            >
              🔍
            </button>
          </div>
        </form>

        {/* 3. デスクトップ用ナビゲーション (md以上) */}
        <nav className="hidden md:flex flex-shrink-0 items-center gap-4">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  href="/admin/reports"
                  className="text-xs font-bold bg-red-500/20 text-red-200 px-3 py-1 rounded border border-red-500/30 hover:bg-red-500 hover:text-white transition"
                >
                  通報管理
                </Link>
              )}
              <Link
                href="/mypage"
                className="text-sm hover:text-brand-green transition font-medium"
              >
                {user.name} さん
              </Link>
              <button
                onClick={handleLogout}
                className="bg-brand-teal px-4 py-1.5 rounded-full text-sm font-bold hover:bg-opacity-80 transition"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm hover:text-brand-soft transition"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="bg-brand-green text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-opacity-90 transition"
              >
                会員登録
              </Link>
            </>
          )}
        </nav>

        {/* 4. モバイル用ハンバーガーボタン */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-brand-soft hover:text-white focus:outline-none"
          >
            {isMenuOpen ? (
              <span className="text-2xl">✕</span>
            ) : (
              <div className="space-y-1.5">
                <span className="block w-6 h-0.5 bg-current"></span>
                <span className="block w-6 h-0.5 bg-current"></span>
                <span className="block w-6 h-0.5 bg-current"></span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 5. モバイル用ドロップダウンメニュー */}
      {isMenuOpen && (
        <div className="md:hidden bg-brand-dark border-t border-brand-soft/20 animate-in slide-in-from-top duration-300">
          <div className="px-4 py-6 space-y-6">
            <form onSubmit={handleSearch}>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="タイトル、本文、カテゴリを検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-brand-soft/30 rounded-2xl py-3 pl-4 pr-12 focus:outline-none focus:bg-white focus:text-brand-dark transition text-brand-soft"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-3.5 text-xl"
                >
                  🔍
                </button>
              </div>
            </form>

            <nav className="flex flex-col gap-4">
              {user ? (
                <>
                  <div className="pb-4 border-b border-brand-soft/10">
                    <p className="text-xs text-brand-soft mb-1 uppercase tracking-widest">
                      ログイン中
                    </p>
                    <p className="text-lg font-bold">{user.name} さん</p>
                  </div>
                  {/* 各リンクに onClick={closeMenu} を追加 */}
                  <Link
                    href="/mypage"
                    onClick={closeMenu}
                    className="flex items-center gap-3 py-2 text-brand-soft hover:text-brand-green font-bold"
                  >
                    <span>👤</span> マイページ
                  </Link>
                  {user.role === "admin" && (
                    <>
                      <Link
                        href="/admin/reports"
                        onClick={closeMenu}
                        className="flex items-center gap-3 py-2 text-red-300 hover:text-red-400 font-bold"
                      >
                        <span>🛡️</span> 通報管理
                      </Link>
                      <Link
                        href="/admin/users"
                        onClick={closeMenu}
                        className="flex items-center gap-3 py-2 text-brand-soft hover:text-brand-green font-bold"
                      >
                        <span>👥</span> ユーザー管理
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="mt-4 w-full bg-brand-teal text-white py-4 rounded-2xl font-bold"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex items-center justify-center py-4 bg-white/5 border border-brand-soft/30 rounded-2xl font-bold"
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="flex items-center justify-center py-4 bg-brand-green text-white rounded-2xl font-bold"
                  >
                    会員登録
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
