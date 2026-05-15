"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { User } from "@/types";
import { useRouter } from "next/navigation";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userRes = await axios.get("/api/user");
        if (userRes.data.role !== "admin") {
          throw new Error("Not Admin");
        }

        const res = await axios.get("/api/admin/users");
        setUsers(res.data);
      } catch {
        alert("管理者権限が必要です。");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [router]);

  const handleToggleBan = async (user: User) => {
    const action = user.is_banned ? "解除" : "凍結";
    if (!confirm(`本当にこのユーザーを${action}しますか？`)) return;

    try {
      const res = await axios.patch(`/api/admin/users/${user.id}/toggle-ban`);
      setUsers(users.map((u) => (u.id === user.id ? res.data.user : u)));
      alert(res.data.message);
    } catch {
      alert("操作に失敗しました。");
    }
  };

  if (loading) return <div className="text-center py-20">読み込み中...</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-brand-dark mb-10 flex items-center gap-3">
        <span className="bg-brand-teal text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">
          👥
        </span>
        ユーザー管理
      </h1>

      <div className="bg-white rounded-3xl shadow-sm border border-brand-soft/20 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-brand-teal text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">ユーザー名 / メールアドレス</th>
              <th className="px-6 py-4">役割</th>
              <th className="px-6 py-4">ステータス</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  <div className="font-bold text-brand-dark">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${user.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-brand-soft/10 text-brand-teal"}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.is_banned ? (
                    <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                      凍結中
                    </span>
                  ) : (
                    <span className="text-brand-green text-xs font-bold">
                      正常
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleToggleBan(user)}
                    className={`text-xs font-bold px-4 py-2 rounded-full border transition ${
                      user.is_banned
                        ? "border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                        : "border-red-200 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500"
                    }`}
                  >
                    {user.is_banned ? "凍結を解除" : "アカウントを凍結"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
