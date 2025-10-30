# 🌸 Cultura - Au Pair Matching App

育児と文化体験をつなぐオーペアマッチングアプリ

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS 4.0" />
</div>

## ✨ 特徴

- 🎨 温かみのあるオレンジ・ピーチ・コーラル系のデザイン
- 📱 完全レスポンシブ対応（PC・タブレット・モバイル）
- 🎭 カスタムロゴとアニメーション効果（Motion/React）
- 👥 家庭とオーペアの2つのユーザータイプ
- 💬 メッセージ機能（2カラムレイアウト）
- 🏘️ コミュニティ機能（Q&A、アドバイス共有、経験談投稿）
- 🔍 高度なフィルター機能
- ⚡ Next.js App Routerによる高速なページ遷移

## 🚀 Getting Started

### 前提条件

- Node.js 18.17以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/cultura-app.git
cd cultura-app

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

### ビルド

```bash
# 本番用ビルド
npm run build

# 本番サーバーを起動
npm run start
```

## 📁 プロジェクト構造

```
cultura-app/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # ログインページ (/)
│   ├── signup/              # サインアップ (/signup)
│   ├── home/                # ホーム (/home)
│   ├── community/           # コミュニティ (/community)
│   ├── messages/[id]/       # メッセージ (/messages/[id])
│   ├── profile/
│   │   ├── [id]/           # プロフィール詳細 (/profile/[id])
│   │   └── edit/           # プロフィール編集 (/profile/edit)
│   ├── profile-create/      # プロフィール作成 (/profile-create)
│   └── settings/            # 設定 (/settings)
├── components/              # Reactコンポーネント
│   ├── ui/                 # ShadCN UIコンポーネント
│   ├── CulturaLogo.tsx     # カスタムロゴ
│   ├── Home.tsx            # ホーム画面
│   ├── Community.tsx       # コミュニティ
│   ├── Messages.tsx        # メッセージ
│   └── ...                 # その他のコンポーネント
├── styles/
│   └── globals.css         # グローバルスタイル（Tailwind設定含む）
├── next.config.ts          # Next.js設定
├── tsconfig.json           # TypeScript設定
└── package.json            # 依存関係
```

## 🎨 デザインシステム

### カラーパレット

アプリケーション全体で使用される温かみのあるオレンジ・ピーチ・コーラル系の色:

- **Primary**: `#2d1810` (ダークブラウン)
- **Secondary**: `#fff5ee` (ライトピーチ)
- **Accent**: `#ffe8d9` (ソフトコーラル)
- **Chart Colors**: オレンジ系のグラデーション

全てのカラートークンは `styles/globals.css` で定義されています。

### タイポグラフィ

- **見出し (h1-h4)**: ミディアムウェイト、1.5の行高
- **本文 (p)**: ノーマルウェイト、1.5の行高
- **ボタン/ラベル**: ミディアムウェイト

## 🔑 主な機能

### 1. ユーザータイプ
- **家庭側**: オーペアを探す
- **オーペア側**: ホストファミリーを探す

### 2. プロフィール
- 写真、基本情報、スキル、経験
- 自己紹介文
- 言語能力、特技

### 3. マッチング
- カード表示
- フィルター機能（国、言語、スキル）
- クイックタグ検索

### 4. メッセージング
- リアルタイムチャット風UI
- 2カラムレイアウト（デスクトップ）
- スレッド管理

### 5. コミュニティ
- Q&A投稿
- アドバイス共有
- 経験談投稿

## 🛠️ 技術スタック

### フレームワーク・ライブラリ
- **Next.js 15** - React フレームワーク
- **React 18** - UIライブラリ
- **TypeScript** - 型安全性
- **Tailwind CSS 4.0** - スタイリング

### UIコンポーネント
- **ShadCN UI** - アクセシブルなUIコンポーネント
- **Lucide React** - アイコン
- **Motion (Framer Motion)** - アニメーション
- **Recharts** - チャート（将来的な統計機能用）

### フォーム
- **React Hook Form** - フォーム管理
- **Sonner** - トースト通知

## 📱 レスポンシブデザイン

- **モバイル**: ボトムナビゲーション、フルスクリーンカード
- **タブレット**: 適応的レイアウト
- **デスクトップ**: トップナビゲーション、マルチカラム

## 🔐 認証（現在の���装）

現在はlocalStorageを使用した簡易的な認証を実装しています。
本番環境では以下を推奨:

- **Next.js Middleware** + **Cookie認証**
- **Supabase Auth** または **NextAuth.js**

詳細は `MIGRATION_GUIDE.md` を参照してください。

## 🚢 デプロイ

### Vercel（推奨）

```bash
# Vercel CLIをインストール
npm i -g vercel

# デプロイ
vercel
```

### その他のプラットフォーム
- Netlify
- AWS Amplify
- Railway
- Render

## 📝 環境変数

`.env.example` をコピーして `.env.local` を作成:

```bash
cp .env.example .env.local
```

必要に応じて値を設定してください。

## 🤝 コントリビューション

コントリビューションは歓迎します！以下の手順でお願いします:

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを開く

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

質問や問題がある場合は、GitHubのIssuesを開いてください。

---

Made with ❤️ by the Cultura Team
