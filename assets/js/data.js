/*
  【更新方法】
  動画を追加するときは videos の配列に1件追加します。
  記事は posts/ フォルダにMarkdownファイルを追加します(posts/README.md 参照)。
  画像は assets/images/ に入れ、ファイル名を指定してください。
*/
const SITE_CONFIG = {
  channelUrl: "", // YouTubeチャンネルURLをここに貼り付け
  siteName: "びみ"
};

const CATEGORIES = [
  { id: "challenge", name: "家事・生活チャレンジ", description: "初めての家事や、いろいろなことへの挑戦。", icon: "✦" },
  { id: "dance", name: "ダンス", description: "コサックダンスなど、身体を使った挑戦。", icon: "↗" },
  { id: "gaming", name: "ゲーム", description: "ゲーム実況やプレイ記録。", icon: "▣" },
  { id: "explainer", name: "ゆっくり解説", description: "調べたことをまとめる解説動画。", icon: "≡" },
  { id: "journal", name: "雑記・活動記録", description: "趣味や日々の活動、制作の記録。", icon: "✎" }
];

// 公開する動画ができたら、この配列に追加してください。
// videoUrl はYouTubeなどの動画URL、thumbnail は画像パスです。
const VIDEOS = [
  // 例:
  // {
  //   title: "初めての家事実況",
  //   description: "家事を一度もやったことがない人が挑戦。",
  //   category: "challenge",
  //   date: "2026-11-01",
  //   videoUrl: "https://www.youtube.com/watch?v=動画ID",
  //   thumbnail: "assets/images/first-chore.jpg",
  //   relatedPost: "first-video-behind-scenes"
  // }
];

// 記事(POSTS)は posts/ フォルダのMarkdownファイルから自動生成されます。
// 追加方法は posts/README.md を見てください。
