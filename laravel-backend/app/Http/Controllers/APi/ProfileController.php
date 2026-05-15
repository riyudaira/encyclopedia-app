<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateProfileRequest;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();
        $user->update($validated);
        return response()->json($user);
    }
}
