"use client";

import { useState, FormEvent } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import Link from "next/link";
import InputError from "@/components/InputError";

export default function Login() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await axios.get("/sanctum/csrf-cookie");
      await axios.post("/login", {
        email,
        password,
      });
      router.push("/");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors); // バリデーションエラー取得
      } else {
        alert("ログインに失敗しました。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-brand-soft/20">
        <h1 className="text-2xl font-bold mb-8 text-brand-dark text-center">
          おかえりなさい
        </h1>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brand-teal mb-2 ml-1">
              メールアドレス
            </label>
            <input
              type="email"
              className="w-full p-3 bg-gray-50 border border-brand-soft/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/40 text-brand-dark transition placeholder-gray-400"
              placeholder="mail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputError messages={errors.email} />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-teal mb-2 ml-1">
              パスワード
            </label>
            <input
              type="password"
              className="w-full p-3 bg-gray-50 border border-brand-soft/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/40 text-brand-dark transition placeholder-gray-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputError messages={errors.password} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-dark text-white py-4 rounded-2xl font-bold hover:bg-brand-teal transition disabled:opacity-50 shadow-lg shadow-brand-dark/10"
          >
            {loading ? "確認中..." : "ログインする"}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-brand-soft/10 text-center">
          <p className="text-sm text-gray-500">
            はじめての方はこちら
            <Link
              href="/register"
              className="text-brand-green font-bold ml-2 hover:underline"
            >
              会員登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
