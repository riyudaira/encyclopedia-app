<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): Response
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'password' => ['required', 'confirmed', 'size:8', 'regex:/^[a-zA-Z0-9]+$/'],
        ], [
            'name.required' => 'ニックネームを入力してください。',
            'email.required' => 'メールアドレスを入力してください。',
            'email.email' => '正しいメールアドレスの形式で入力してください。',
            'email.unique' => 'このメールアドレスは既に登録されています。',
            'password.required' => 'パスワードを入力してください。',
            'password.confirmed' => 'パスワード（確認用）と一致しません。',
            'password.size' => 'パスワードはちょうど8文字で入力してください。',
            'password.regex' => 'パスワードは半角英数字のみ使用できます。',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return response()->noContent();
    }
}
