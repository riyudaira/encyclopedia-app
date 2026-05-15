<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Article;
use App\Models\ArticleSection;
use App\Models\Category;

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $user = User::first();
        $admin = User::where('role', 'admin')->first();
        $cat0 = Category::where('code', '0')->first();

        // --- 「はじめての方へ」記事の作成 ---
        $welcomeArticle = Article::create([
            'title' => 'はじめての方へ',
            'category_id' => $cat0->id,
            'user_id' => $admin->id,
            'lock_version' => 1,
            'view_count' => 0,
        ]);

        $sections = [
            [
                'title' => 'もんじゅへようこそ！',
                'content' => "ご利用ありがとうございます！このアプリはみんなで知識を出し合って作っていく事典です。以下の利用方法を参考にして、ルールを守って活用してくださいね。",
            ],
            [
                'title' => '会員登録について',
                'content' => "右上の「会員登録」ボタンから、ニックネーム・メールアドレス・パスワードを設定するだけで登録できます。登録すると、自分で新しく記事を作成したり、既存の記事をより良く編集したりできるようになります。",
            ],
            [
                'title' => '記事閲覧について',
                'content' => "トップページでは「新着」「注目」「カテゴリ」のタブを切り替えて記事を探せます。また、中央の検索窓からは「記事タイトル」「本文」「カテゴリ名」のすべてを対象にキーワード検索が可能です。",
            ],
            [
                'title' => '記事の作成・編集について',
                'content' => "1つの記事には最大10個の見出しを作成できます。また、各見出しには画像をアップロードして説明を補足することもできます。みんなが読みやすいように整理された記述を心がけましょう。",
            ],
            [
                'title' => 'カテゴリについて',
                'content' => "もんじゅの記事は、図書館で使われる「日本十進分類法」に基づいて分類されています。\n\n0：総記（情報・図書館など）\n1：哲学・宗教\n2：歴史・地理\n3：社会科学\n4：自然科学\n5：技術・工学\n6：産業\n7：芸術・娯楽\n8：言語\n9：文学",
            ],
            [
                'title' => '通報について',
                'content' => "「もんじゅ」は全年齢の方が利用する場所です。不適切な投稿や著作権を侵害する内容は控えてください。もし問題のある記事を見つけた場合は、記事詳細の下部にある「通報する」ボタンから運営にお知らせください。",
            ],
            [
                'title' => '同時編集について（もんじゅの知恵）',
                'content' => "もし、あなたが編集している間に他の誰かが先に更新を完了させた場合、上書きを防ぐための「ロック機能」が働きます。その場合は一度ページを読み込み直し、最新の内容を確認してから再度編集を行ってください。",
            ],
        ];

        foreach ($sections as $index => $s) {
            $welcomeArticle->sections()->create([
                'title' => $s['title'],
                'content' => $s['content'],
                'order' => $index,
            ]);
        }

        $articleData = [
            ['title' => '緋色の研究', 'code' => '9'],
            ['title' => '尺には尺を', 'code' => '9'],
            ['title' => 'コミック', 'code' => '7'],
            ['title' => '相対性理論', 'code' => '4'],
            ['title' => '織田信長', 'code' => '2'],
            ['title' => '民主主義', 'code' => '3'],
            ['title' => 'プログラミング入門', 'code' => '0'],
            ['title' => 'カレー', 'code' => '5'],
            ['title' => '農業', 'code' => '6'],
            ['title' => '英語', 'code' => '8'],
        ];

        foreach ($articleData as $data) {
            $category = Category::where('code', $data['code'])->first();
            $article = Article::create([
                'title' => $data['title'],
                'category_id' => $category->id,
                'user_id' => $user->id,
                'view_count' => rand(10, 100),
            ]);
            ArticleSection::create([
                'article_id' => $article->id,
                'title' => '概要',
                'content' => $data['title'] . 'についての百科事典記事です。',
                'order' => 0
            ]);
        };
    }
}
