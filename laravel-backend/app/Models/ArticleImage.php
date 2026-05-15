<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use \Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class ArticleImage extends Model
{
    use HasFactory;
    protected $fillable = ['article_id',  'section_id', 'file_path', 'type', 'display_order'];
    public function section(): BelongsTo
    {
        return $this->belongsTo(ArticleSection::class, 'section_id');
    }
}
