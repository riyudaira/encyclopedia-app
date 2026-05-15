<?php

use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\UserController as AdminUserController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReportController;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/articles', [ArticleController::class, 'store']);
    Route::put('/articles/{id}', [ArticleController::class, 'update']);
    Route::post('/articles/{id}', [ArticleController::class, 'update']);
    Route::delete('/articles/{id}', [ArticleController::class, 'destroy']);
    Route::put('/user/profile', [ProfileController::class, 'update']);
    Route::get('/admin/reports', [ReportController::class, 'index']);
    Route::patch('/admin/reports/{id}', [ReportController::class, 'update']);
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::patch('/admin/users/{user}/toggle-ban', [AdminUserController::class, 'toggleBan']);
});

Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{id}', [ArticleController::class, 'show']);
Route::get('/categories', function () {
    return Category::all();
});
Route::post('/reports', [ReportController::class, 'store']);
