"use client";

import { useEffect, useState, FormEvent } from "react";
import InputError from "@/components/InputError";
import axios from "@/lib/axios";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

export default function ProfileEdit() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios
      .get("/api/user")
      .then((res) => {
        setName(res.data.name);
        setEmail(res.data.email);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    try {
      await axios.put("/api/user/profile", { name, email });
      alert("プロフィールを更新しました。");
      router.push("/mypage");
      window.location.reload();
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        alert("送信に失敗しました。");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <h1 className="text-2xl font-bold text-brand-dark mb-8 text-center">
        プロフィール編集
      </h1>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white p-8 rounded-3xl shadow-sm border border-brand-soft/20 space-y-6"
      >
        <div>
          <label className="block text-sm font-bold text-brand-teal mb-2">
            ニックネーム
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-brand-soft/20 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/40"
          />
          <InputError messages={errors.name} />
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-teal mb-2">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-brand-soft/20 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/40"
          />
          <InputError messages={errors.email} />
        </div>
        <button
          disabled={isSubmitting}
          className="w-full py-4 bg-brand-dark text-white rounded-2xl font-bold hover:bg-brand-teal transition shadow-lg shadow-brand-dark/10 disabled:opacity-50"
        >
          {isSubmitting ? "更新中..." : "変更を保存する"}
        </button>
      </form>
    </div>
  );
}
