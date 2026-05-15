<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'article_id' => ['required', 'exists:articles,id'],
            'reason' => [
                'required',
                'string',
                'min:10',
                'max:1000'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'article_id.exists' => '対象の記事が存在しません。',
            'reason.required' => '通報理由を入力してください。',
            'reason.min' => '通報の状況を詳しく知るため、10文字以上で入力してください。',
            'reason.max' => '通報理由は1000文字以内で入力してください。',
        ];
    }
}
