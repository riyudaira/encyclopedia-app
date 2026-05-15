"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import Link from "next/link";
import { Report, User } from "@/types";
import { useRouter } from "next/navigation";

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        const userRes = await axios.get("/api/user");
        if (userRes.data.role !== "admin") {
          alert("管理者権限が必要です。");
          router.push("/");
          return;
        }
        const res = await axios.get("/api/admin/reports");
        setReports(res.data);
      } catch (error) {
        console.error("取得失敗", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchReportsData();
  }, [router]);

  const handleResolve = async (id: number) => {
    if (!confirm("この通報を解決済みにしますか？")) return;
    try {
      await axios.patch(`/api/admin/reports/${id}`, {
        admin_comment: "対応完了",
      });
      setReports(
        reports.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)),
      );
    } catch {
      alert("更新に失敗しました。");
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-brand-teal font-bold animate-pulse">
        読み込み中...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-brand-dark mb-10 flex items-center gap-3">
        <span className="bg-brand-teal text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">
          🛡️
        </span>
        運営管理：通報一覧
      </h1>

      <div className="grid gap-6">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div
              key={report.id}
              className={`p-6 rounded-3xl border transition-all ${
                report.status === "resolved"
                  ? "bg-gray-50 border-gray-100 opacity-60"
                  : "bg-white border-brand-soft/20 shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-2 inline-block ${
                      report.status === "resolved"
                        ? "bg-gray-200 text-gray-500"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {report.status === "resolved" ? "解決済" : "未対応"}
                  </span>
                  <h2 className="text-lg font-bold text-brand-dark">
                    対象記事：
                    {report.article ? (
                      <Link
                        href={`/articles/${report.article_id}`}
                        className="text-brand-green hover:underline ml-1"
                      >
                        {report.article.title}
                      </Link>
                    ) : (
                      <span className="text-gray-400 ml-1 italic">
                        削除された記事 (ID: {report.article_id})
                      </span>
                    )}
                  </h2>
                </div>
                <time className="text-xs text-gray-400">
                  {new Date(report.created_at).toLocaleString("ja-JP")}
                </time>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl text-sm text-brand-dark leading-relaxed mb-4 border border-brand-soft/10">
                <p className="font-bold text-xs text-brand-teal mb-1 uppercase tracking-wider">
                  通報理由
                </p>
                {report.reason}
              </div>

              {report.status === "open" && (
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => handleResolve(report.id)}
                    className="px-6 py-2 bg-brand-green text-white rounded-full text-sm font-bold hover:bg-opacity-90 transition shadow-md shadow-brand-green/20"
                  >
                    対応完了にする
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-brand-soft/20">
            <p className="text-brand-soft font-bold">
              現在、通報された記事は０件です
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
