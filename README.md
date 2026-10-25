# びみ 公式サイト

HTML / CSS / JavaScript をほとんど編集せずに始められる、GitHub Pages 用の静的サイトです。ビルドツールは不要です。

## ファイル構成

- `index.html` : トップページ
- `videos.html` : 動画一覧
- `blog.html` : ブログ一覧
- `categories.html` : カテゴリ一覧
- `category.html` : カテゴリごとの動画・記事一覧
- `article.html` : 個別記事
- `about.html` : プロフィール
- `assets/css/style.css` : デザイン
- `assets/js/data.js` : 動画・カテゴリのデータ
- `posts/` : ブログ記事(Markdown)
- `assets/js/posts.js` : 記事データ(自動生成。直接編集しない)
- `build_posts.py` : 記事データの生成スクリプト
- `assets/js/main.js` : 一覧表示などの動作

## 1. GitHub で公開する手順

1. GitHub にログインし、新しいリポジトリを作ります。例: `bimi-site`
2. この ZIP の中身をリポジトリのルートへアップロードします。`index.html` が最上位に来るようにしてください。
3. リポジトリの **Settings → Pages** を開きます。
4. **Build and deployment** の Source で **Deploy from a branch** を選びます。
5. Branch を `main`、フォルダを `/(root)` にして Save します。
6. 数分後、Pages の画面に表示された URL で公開サイトを確認します。

公開URLは通常 `https://ユーザー名.github.io/bimi-site/` の形式です。実際のURLはGitHubのPages画面で確認してください。

## 2. YouTube チャンネル URL の設定

`assets/js/data.js` の冒頭にある以下の行へ、チャンネルURLを記入します。

```js
channelUrl: "https://www.youtube.com/@あなたのチャンネル"
```

URLがまだ決まっていなければ空欄のままで構いません。

## 3. 動画を追加する

`assets/js/data.js` の `VIDEOS` 配列に、次のような項目を追加します。コメント記号 `//` を外して、サンプル値を実際の情報へ置き換えてください。

```js
{
  title: "動画タイトル",
  description: "動画の簡単な説明",
  category: "challenge",
  date: "2026-11-01",
  videoUrl: "https://www.youtube.com/watch?v=動画ID",
  thumbnail: "assets/images/video-thumbnail.jpg",
  relatedPost: "記事ID"
}
```

`category` は次のIDから選びます。

- `challenge` : 家事・生活チャレンジ
- `dance` : ダンス
- `gaming` : ゲーム
- `explainer` : ゆっくり解説
- `journal` : 雑記・活動記録

動画が未公開の場合は、無理にダミー動画を登録しなくても大丈夫です。

## 4. ブログ記事を追加する

記事は `posts/` フォルダの Markdown ファイル 1 つが 1 記事です。`data.js` を編集する必要はありません。

1. `posts/_template.md` をコピーし、`2026-11-15-first-chore.md` のように「日付-記事の名前.md」で保存します。
2. 先頭の `title` と `category` を書き、その下に本文を書きます(空行で段落、`##` で見出し、`- ` で箇条書き)。
3. GitHub の `posts` フォルダへアップロードします。

アップロードすると GitHub Actions が `assets/js/posts.js` を自動で更新し、数分後にサイトへ反映されます。

- `title` と `category` 以外は省略できます。日付と記事ID はファイル名から決まります。
- `draft: true` を書くと下書き扱いになり、公開されません。
- `category` が不正だったり日付がなかったりすると、Actions がエラーで止まり、理由が表示されます。
- 自分のパソコンで確認したいときは `python3 build_posts.py` を実行してから `index.html` を開きます。
- 初期状態の `posts/2026-11-01-sample-post.md` は表示確認用です。公開前に削除してください。

## 5. 画像を追加する

`assets/images/` フォルダを作成して画像を入れ、データ内の `thumbnail` や `image` にパスを書きます。例: `assets/images/my-video.jpg`

画像を追加する場合、画像ファイルもGitHubへアップロードしてください。動画サムネイルや作品画像を使う際は、利用権限を確認してください。

## 注意

- ここにあるカテゴリ名・紹介文・配色は初期案です。好きなように変更できます。
- サイトを公開すると、URLを知っている人だけでなく一般の人も閲覧できます。個人情報や公開したくない内容を掲載しないでください。
- 現在のサイトは外部のデータベースやコメント機能を使わない静的サイトです。
