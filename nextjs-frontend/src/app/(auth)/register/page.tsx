"use client";

import { useState } from "react";
import InputError from "@/components/InputError";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import Link from "next/link";

export default function Register() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      await axios.get("/sanctum/csrf-cookie");

      await axios.post("/register", {
        name,
        email,
        password,
        password_confirmation: password,
      });

      alert("登録に成功しました！さっそく「もんじゅ」を使ってみましょう。");
      router.push("/");
      setTimeout(() => window.location.reload(), 500);
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        alert("登録に失敗しました。内容を確認してください。");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-sm border border-brand-soft/20 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-brand-dark mb-2">会員登録</h1>
          <p className="text-sm text-brand-teal/60 font-medium">
            あなたも百科事典の編集に参加しませんか？
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-brand-teal mb-2 ml-1">
              ニックネーム
            </label>
            <input
              type="text"
              placeholder="例：もんじゅ太郎"
              className={`w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/40 text-brand-dark transition ${
                errors.name ? "border-red-500" : "border-brand-soft/20"
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <InputError messages={errors.name} />
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-teal mb-2 ml-1">
              メールアドレス
            </label>
            <input
              type="email"
              placeholder="mail@example.com"
              className={`w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/40 text-brand-dark transition ${
                errors.email ? "border-red-500" : "border-brand-soft/20"
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <InputError messages={errors.email} />
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-teal mb-2 ml-1">
              パスワード（半角英数字8文字）
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className={`w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/40 text-brand-dark transition ${
                errors.password ? "border-red-500" : "border-brand-soft/20"
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <InputError messages={errors.password} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-brand-dark text-white rounded-2xl font-bold text-lg hover:bg-brand-teal transition shadow-lg shadow-brand-dark/10 disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? "準備中..." : "登録を完了する"}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-brand-soft/10 text-center">
          <p className="text-sm text-gray-400">
            すでにアカウントをお持ちですか？
            <Link
              href="/login"
              className="text-brand-green font-bold ml-2 hover:underline"
            >
              ログインはこちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
