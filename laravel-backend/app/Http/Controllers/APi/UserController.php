<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function index()
    {
        $currentUser = Auth::user();
        if (!$currentUser || $currentUser->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $users = User::where('id', '!=', $currentUser->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    public function toggleBan(User $user)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($user->role === 'admin') {
            return response()->json(['message' => '運営者を凍結することはできません。'], 403);
        }

        $user->is_banned = !$user->is_banned;
        $user->save();

        $status = $user->is_banned ? '凍結' : '解除';
        return response()->json([
            'message' => "ユーザーを{$status}しました。",
            'user' => $user
        ]);
    }
}
