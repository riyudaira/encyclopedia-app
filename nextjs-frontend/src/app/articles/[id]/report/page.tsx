"use client";

import { useState } from "react";
import InputError from "@/components/InputError";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { AxiosError } from "axios";

export default function ReportPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { id } = useParams();
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      await axios.post("/api/reports", {
        article_id: id,
        reason: reason,
      });
      alert("通報を送信しました。ご協力ありがとうございます。");
      router.push(`/articles/${id}`);
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
    <div className="max-w-2xl mx-auto py-20 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-soft/20">
        <h1 className="text-2xl font-bold text-brand-dark mb-6 flex items-center gap-2">
          <span>🚩</span> 記事の通報
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          不適切な内容、著作権侵害、または間違いがある場合は理由を詳しく記入してください。
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea
            className="w-full h-40 p-4 bg-gray-50 border border-brand-soft/20 rounded-2xl outline-none focus:ring-2 focus:ring-red-200"
            placeholder="通報理由を入力してください..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <InputError messages={errors.reason} />
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition"
            >
              キャンセル
            </button>
            <button
              disabled={isSubmitting}
              className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition shadow-lg shadow-red-200 disabled:opacity-50"
            >
              {isSubmitting ? "送信中..." : "通報を確定する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
