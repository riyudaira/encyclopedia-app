<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreArticleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $articleId = $this->route('id');
        return [
            'title' => 'required|string|max:255|unique:articles,title,' . $articleId,
            'category_id' => 'required|exists:categories,id',
            'sections' => 'required|array|min:1|max:10',
            'sections.*.id' => 'nullable|exists:article_sections,id',
            'sections.*.title' => 'required|string|max:255',
            'sections.*.content' => 'required|string',
            'sections.*.order' => 'required|integer',
            'deleted_image_ids' => 'nullable|array',
            'deleted_image_ids.*' => 'exists:article_images,id',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'sections.*.images' => 'nullable|array|max:5',
            'sections.*.images.*' => 'image|mimes:jpeg,png,jpg|max:2048',
            'lock_version' => $articleId ? 'required|integer' : 'nullable|integer',
        ];
    }
    public function messages()
    {
        return [
            'title.required' => '記事タイトルを入力してください。',
            'title.unique' => 'そのタイトルの記事は既に存在します。',
            'title.max' => 'タイトルは255文字以内で入力してください。',
            'category_id.required' => 'カテゴリを選択してください。',
            'category_id.exists' => '選択されたカテゴリは無効です。',
            'thumbnail.image' => 'サムネイルは画像ファイルを選択してください。',
            'thumbnail.max' => 'サムネイルのサイズは2MB以内で入力してください。',
            'sections.required' => '少なくとも1つの見出しと本文が必要です。',
            'sections.max' => '見出しは最大10件までです。',
            'sections.*.title.required' => '見出しを入力してください。',
            'sections.*.title.max' => '見出しは255文字以内で入力してください。',
            'sections.*.content.required' => '本文を入力してください。',
            'sections.*.content.max' => '本文は10,000文字以内で入力してください。',
            'sections.*.images.max' => '1つのセクションに投稿できる画像は5枚までです。',
            'sections.*.images.*.image' => '画像ファイルを選択してください。',
        ];
    }
}
