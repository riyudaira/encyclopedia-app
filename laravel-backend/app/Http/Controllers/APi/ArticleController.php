<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Http\Requests\Api\StoreArticleRequest;
use App\Models\ArticleSection;
use App\Models\ArticleImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $query = Article::with('category');
        if (!$request->has('q')) {
            $query->where('title', '!=', 'はじめての方へ');
        }
        if ($request->has('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }
        if ($request->query('user_id') === 'me') {
            $query->where('user_id', Auth::id());
        }
        if ($request->has('q')) {
            $keyword = $request->query('q');
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'like', "%{$keyword}%")
                    ->orWhereHas('category', function ($catQuery) use ($keyword) {
                        $catQuery->where('name', 'like', "%{$keyword}%");
                    })
                    ->orWhereHas('sections', function ($secQuery) use ($keyword) {
                        $secQuery->where('content', 'like', "%{$keyword}%");
                    });
            });
        }
        $sort = $request->query('sort', 'new');
        if ($sort === 'popular') {
            $query->orderBy('view_count', 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }
        if ($request->has('limit')) {
            return response()->json(['data' => $query->take($request->query('limit'))->get()]);
        }
        return response()->json($query->paginate(10));
    }
    public function show($id)
    {
        $article = Article::with(['category', 'user', 'sections', 'images'])->findOrFail($id);
        $article->increment('view_count');
        return response()->json($article);
    }
    public function store(StoreArticleRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $article = Article::create([
                'title' => $request->title,
                'category_id' => $request->category_id,
                'user_id' => Auth::id(),
                'lock_version' => 1,
                'view_count' => 0,
            ]);

            if ($request->hasFile('thumbnail')) {
                $path = $request->file('thumbnail')->store('thumbnails', 'public');
                $article->images()->create([
                    'file_path' => $path,
                    'type' => 'thumbnail',
                    'section_id' => null,
                ]);
            }
            foreach ($request->sections as $index => $sectionData) {
                $section = $article->sections()->create([
                    'title' => $sectionData['title'],
                    'content' => $sectionData['content'],
                    'order' => $sectionData['order'],
                ]);
                if ($request->hasFile("sections.{$index}.images")) {
                    foreach ($request->file("sections.{$index}.images") as $imgIndex => $imageFile) {
                        $path = $imageFile->store('articles', 'public');
                        $article->images()->create([
                            'section_id' => $section->id,
                            'file_path' => $path,
                            'type' => 'content',
                            'display_order' => $imgIndex + 1,
                        ]);
                    }
                }
            }

            return response()->json($article->load('sections.images', 'images'), 201);
        });
    }
    public function update(StoreArticleRequest $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $article = Article::findOrFail($id);
            Gate::authorize('update', $article);
            if ($article->lock_version !== (int)$request->lock_version) {
                return response()->json(['message' => '他のユーザーが更新済みです。'], 409);
            }
            $article->update([
                'title' => $request->title,
                'category_id' => $request->category_id,
                'lock_version' => $article->lock_version + 1,
            ]);
            if ($request->deleted_image_ids) {
                $imagePaths = ArticleImage::whereIn('id', $request->deleted_image_ids)
                    ->pluck('file_path');
                foreach ($imagePaths as $path) {
                    if ($path) {
                        Storage::disk('public')->delete($path);
                    }
                }
                ArticleImage::whereIn('id', $request->deleted_image_ids)->delete();
            }
            $existingSectionIds = $article->sections->pluck('id')->toArray();
            $requestSectionIds = [];

            foreach ($request->sections as $index => $sectionData) {
                $section = $article->sections()->updateOrCreate(
                    ['id' => $sectionData['id'] ?? null],
                    [
                        'title' => $sectionData['title'],
                        'content' => $sectionData['content'],
                        'order' => $sectionData['order'],
                    ]
                );
                $requestSectionIds[] = $section->id;

                if ($request->hasFile("sections.{$index}.images")) {
                    foreach ($request->file("sections.{$index}.images") as $imgIndex => $imageFile) {
                        $path = $imageFile->store('articles', 'public');
                        $article->images()->create([
                            'section_id' => $section->id,
                            'file_path' => $path,
                            'type' => 'content',
                            'display_order' => $imgIndex + 1,
                        ]);
                    }
                }
            }

            $sectionsToDelete = array_diff($existingSectionIds, $requestSectionIds);
            ArticleSection::destroy($sectionsToDelete);

            if ($request->deleted_image_ids) {
                $imagePaths = ArticleImage::whereIn('id', $request->deleted_image_ids)
                    ->pluck('file_path');
                foreach ($imagePaths as $path) {
                    if ($path) {
                        Storage::disk('public')->delete($path);
                    }
                }
                ArticleImage::whereIn('id', $request->deleted_image_ids)->delete();
            }
            return response()->json($article->load('sections', 'images'));
        });
    }
    // public function update(StoreArticleRequest $request, $id)
    // {
    //     return DB::transaction(function () use ($request, $id) {
    //         $article = Article::findOrFail($id);
    //         Gate::authorize('update', $article);
    //         if ($article->lock_version !== (int)$request->lock_version) {
    //             return response()->json([
    //                 'message' => '他のユーザーがこの記事を更新したため、保存できません。ページを再読み込みしてください。'
    //             ], 409);
    //         }
    //         $article->update([
    //             'title' => $request->title,
    //             'category_id' => $request->category_id,
    //             'lock_version' => $article->lock_version + 1,
    //         ]);
    //         $article->sections()->delete();
    //         $article->images()->where('type', 'content')->delete();

    //         foreach ($request->sections as $index => $sectionData) {
    //             $section = $article->sections()->create([
    //                 'title' => $sectionData['title'],
    //                 'content' => $sectionData['content'],
    //                 'order' => $sectionData['order'],
    //             ]);

    //             if ($request->hasFile("sections.{$index}.images")) {
    //                 foreach ($request->file("sections.{$index}.images") as $imgIndex => $imageFile) {
    //                     $path = $imageFile->store('articles', 'public');
    //                     $article->images()->create([
    //                         'section_id' => $section->id,
    //                         'file_path' => $path,
    //                         'type' => 'content',
    //                         'display_order' => $imgIndex + 1,
    //                     ]);
    //                 }
    //             }
    //         }
    //         if ($request->hasFile('thumbnail')) {
    //             $article->images()->where('type', 'thumbnail')->delete();
    //             $path = $request->file('thumbnail')->store('thumbnails', 'public');
    //             $article->images()->create([
    //                 'file_path' => $path,
    //                 'type' => 'thumbnail',
    //                 'section_id' => null,
    //             ]);
    //         }
    //         return response()->json($article->load('sections', 'images'));
    //     });
    // }
    public function destroy($id)
    {
        $article = Article::with('images')->findOrFail($id);
        Gate::authorize('delete', $article);
        if ($article->images) {
            foreach ($article->images as $image) {
                if ($image->file_path && Storage::disk('public')->exists($image->file_path)) {
                    Storage::disk('public')->delete($image->file_path);
                }
            }
        }
        $article->delete();
        return response()->json(['message' => '記事を削除しました。']);
    }
}
