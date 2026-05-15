<?php

namespace App\Models;

use App\Models\Category;
use App\Models\User;
use App\Models\ArticleSection;
use App\Models\ArticleImage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Article extends Model
{
    use HasFactory;
    protected $fillable = ['category_id', 'user_id', 'title', 'lock_version', 'view_count'];
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function sections(): HasMany
    {
        return $this->hasMany(ArticleSection::class);
    }
    public function images(): HasMany
    {
        return $this->hasMany(ArticleImage::class);
    }
}
