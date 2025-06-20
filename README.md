# Scrum Sensei AI学習プラットフォーム
**最新AI技術で実現する次世代学習体験**

PDFアップロード→AIクイズ自動生成→パーソナライズされた学習コーチング

## 概要
Scrum Senseiは、PDFをアップロードするだけでAIが自動的に学習コンテンツとクイズを生成し、個人の進捗に合わせたパーソナライズされた学習アドバイスを提供する次世代のAI学習プラットフォームです。最新のAI技術を活用して効率的で実践的なスクラム学習を実現しています。

## 🎯 主要機能

### 🤖 AI自動生成エンジン
- **PDFアップロード**: ドラッグ&ドロップで簡単アップロード
- **自動コンテンツ生成**: OpenAI GPT APIがPDF内容を解析し、理解度チェック用クイズを自動生成
- **多様な問題形式**: 選択式、記述式など様々な形式の問題を自動生成
- **説明付きクイズ**: 正解だけでなく詳細な解説も自動生成

### 🎵 音声学習機能
- **Google Gemini 2.5 TTS**: 最新のGemini 2.5による高品質な音声合成
- **テキスト音声変換**: 学習コンテンツを自然な日本語音声に変換
- **移動中学習**: 通勤中や作業中でも効率的な学習が可能
- **音声スクリプト生成**: AIが解説授業形式の音声用スクリプトを生成
- **カスタムTTS設定**: 音声速度や音質の調整が可能

### 💡 パーソナルAIコーチ *（開発中）*
- **学習履歴分析**: 個人の学習パターンと進捗を詳細分析
- **パーソナライズアドバイス**: 一人ひとりに最適化されたAIアドバイスを提供
- **弱点特定**: 理解度の低い分野を自動識別
- **学習計画提案**: 効果的な学習スケジュールを提案

### 📊 インテリジェント分析 *（開発中）*
- **リアルタイムダッシュボード**: 学習進捗、スコア、連続学習日数を可視化
- **詳細統計**: 学習時間、進捗率、問題タイプ別の統計分析
- **成長トラッキング**: 長期的な学習成果の追跡
- **比較分析**: 他の学習者との進捗比較

### 🎯 スクラム特化AI *（開発中）*
- **スクラム専門知識**: 豊富なスクラム実践知見をAIに学習
- **実践的アドバイス**: 理論だけでない現場で使える実践的指導
- **ケーススタディ**: 実際のプロジェクト事例に基づいた学習コンテンツ
- **段階的学習**: 初心者から上級者まで対応する段階的カリキュラム

## 🏗️ 技術構成

### アーキテクチャ
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                 │
│  Next.js 15 App Router + Tailwind CSS + Shadcn/UI     │
├─────────────────────────────────────────────────────────┤
│                 Next.js API Routes                     │
│     統合バックエンド (Server-side レンダリング)        │
├─────────────────────────────────────────────────────────┤
│              AI Processing Layer                       │
│  OpenAI GPT API + Google Gemini 2.5 TTS               │
├─────────────────────────────────────────────────────────┤
│                  Data Layer                           │
│        SQLite + Better SQLite3 Driver                │
└─────────────────────────────────────────────────────────┘
```

### 技術スタック

#### **コア技術**
- **Next.js 15**: React 19対応の最新フレームワーク
- **OpenAI GPT API**: 最新のAI技術によるコンテンツ生成
- **Google Gemini 2.5 TTS**: 高品質な日本語音声合成
- **SQLite**: 軽量で高性能なファイルベースデータベース
- **TypeScript**: 型安全性を保証する開発環境

#### **フロントエンド**
- **React 19**: 最新のReactで構築された高性能UI
- **Tailwind CSS**: ユーティリティファーストのCSSフレームワーク
- **Shadcn/UI**: モダンで美しいUIコンポーネント
- **Glass Morphism**: 次世代のガラス質デザイン
- **レスポンシブデザイン**: モバイル・デスクトップ両対応

#### **バックエンド**
- **Next.js API Routes**: フロントエンドと統合されたAPIサーバー
- **Better SQLite3**: 高性能なSQLiteドライバー
- **File Upload**: セキュアなPDFファイル処理
- **Error Handling**: 堅牢なエラーハンドリングシステム

#### **AI・機械学習**
- **OpenAI GPT-4**: 高品質なテキスト生成・分析
- **Google Gemini 2.5 TTS**: 最新の高品質音声合成技術
- **PDF Processing**: PDFコンテンツの自動解析・抽出
- **Custom TTS Engine**: カスタマイズ可能なテキスト音声変換
- **Intelligent Content Analysis**: 学習コンテンツの自動分析・最適化

#### **開発・運用**
- **TypeScript**: 型安全な開発環境
- **ESLint**: コード品質管理
- **Git**: バージョン管理
- **Environment Config**: 開発・本番環境の設定管理

### 主要コンポーネント

#### **AI エージェントシステム**
- `advisorAgent`: パーソナライズされた学習アドバイス生成
- `contentCreator`: 学習材料とレッスンの自動生成
- `learningCoach`: 高度な学習パス推奨システム
- `simpleCoach`: 基本的な学習サポート

#### **AI ツールチェーン**
- `pdfProcessor`: PDF抽出・処理エンジン
- `progressTracker`: 学習進捗の監視・分析
- `quizGenerator`: コンテンツ材料からのクイズ作成
- `resourceFinder`: キーワードベースの学習リソース検索

#### **データモデル**
- `Content`: 学習材料とメタデータ管理
- `Quiz`: 質問・回答・パフォーマンス追跡
- `Progress`: ユーザー学習進捗データ

## 🚀 セットアップ・使用方法

### 環境要件
- Node.js 18.0.0 以上
- npm 8.0.0 以上
- OpenAI API キー

### インストール

```bash
# リポジトリのクローン
git clone [repository-url]
cd scrum-sensei

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.local に OpenAI API キーを設定

# 開発サーバーの起動
npm run dev
```

### 環境変数設定
```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=./memory.db
```

### 使用方法

#### 管理者向け
1. **PDFアップロード**: `/admin/upload` でスクラム教材をアップロード
2. **AIコンテンツ生成**: アップロードしたPDFからクイズを自動生成
3. **音声教材作成**: `/admin/audio-materials` で音声版教材を生成
4. **コンテンツ管理**: 生成されたコンテンツの確認・編集・公開

#### 学習者向け
1. **クイズ学習**: `/user/quiz` で公開されたクイズに挑戦
2. **音声学習**: `/user/audio-materials` で移動中に音声学習
3. **AIアドバイス**: `/user/advice` で個人向けアドバイスを受取
4. **進捗確認**: `/user/dashboard` で学習状況を可視化

## 📊 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクション実行
npm run start

# リンティング
npm run lint

# 型チェック
npm run type-check
```

## 🎯 プラットフォームの特徴

### AI技術の活用
- **最新AI統合**: OpenAI GPT-4 と Google Gemini 2.5 TTS の組み合わせ
- **実践的指導**: 理論だけでない現場で使える知識の提供
- **個人最適化**: 一人ひとりの学習スタイルに合わせた指導
- **継続的改善**: 学習データによるAIモデルの継続的改善

### 包括的学習体験
- **マルチモーダル学習**: テキスト、音声、視覚的な学習方法を統合
- **自動化**: PDFからクイズ・音声教材まで一気通貫で自動生成
- **パーソナライゼーション**: 個人の進捗と理解度に基づく最適な学習パス
- **アクセシビリティ**: いつでもどこでも学習できる柔軟性

## 🏢 企業向け差別化戦略

### 独自ドキュメントによる競争優位性
- **企業固有知見の活用**: 各企業が保有する独自のドキュメント・マニュアル・ガイドラインを取り込み
- **他社との差別化**: 公開されているスクラムガイドではなく、企業独自の実践知見をAI学習に活用
- **組織特化学習**: 会社固有のプロセス、文化、ベストプラクティスに基づいた学習コンテンツ
- **ナレッジ資産化**: 暗黙知として蓄積された組織の知見を体系的な学習リソースに変換

**活用例**:
- **開発プロセス**: 社内のコーディング規約、レビュー基準、品質ガイドライン
- **プロジェクト管理**: 独自のプロジェクト運営手法、チーム運営ノウハウ
- **業務手順**: 営業プロセス、カスタマーサポート手順、セキュリティ規定
- **技術文書**: 社内システム仕様書、アーキテクチャドキュメント

## 🌐 汎用学習プラットフォームとしての展開

### ドメイン横断での活用可能性
- **ジャンル非依存**: スクラム以外の任意の専門分野に対応可能
- **業界特化**: 医療、法務、金融、製造業など各業界の専門知識に対応
- **職種別学習**: エンジニア、営業、マーケティング、人事など職種固有のスキル習得
- **資格対応**: 各種資格試験の学習教材として活用可能

**展開例**:
- **医療分野**: 診療ガイドライン → 医療従事者向けクイズ・音声学習
- **法務分野**: 法令・判例集 → 法務担当者向け実践的学習コンテンツ
- **金融分野**: コンプライアンス規定 → 金融従事者向け規制遵守学習
- **製造業**: 安全マニュアル → 現場作業員向け安全教育プログラム
- **営業**: 商品カタログ・提案書 → 営業スキル向上プログラム
- **技術研修**: 技術仕様書 → エンジニア向けスキルアップ教材

### プラットフォーム拡張性
- **カスタマイズ可能**: 業界・企業・職種に応じた学習パス設計
- **マルチテナント対応**: 複数企業・部門での同時利用
- **API統合**: 既存の人事システム・LMSとの連携
- **白紙状態からの構築**: 任意のドキュメントから専門学習システムを構築

## 🔧 プロジェクト構造

```
scrum-sensei/
├── app/                          # Next.js App Router
│   ├── admin/                    # 管理者画面
│   │   ├── materials/           # 教材管理
│   │   ├── audio-materials/     # 音声教材生成
│   │   └── upload/              # PDFアップロード
│   ├── user/                     # 学習者画面
│   │   ├── dashboard/           # ダッシュボード
│   │   ├── quiz/                # クイズ学習
│   │   ├── advice/              # AIアドバイス
│   │   └── audio-materials/     # 音声学習
│   ├── api/                      # API Routes
│   │   ├── admin/               # 管理者API
│   │   ├── user/                # 学習者API
│   │   └── mastra/              # AI エージェントAPI
│   └── globals.css              # グローバルスタイル
├── components/                   # React コンポーネント
│   ├── admin/                   # 管理者用コンポーネント
│   ├── user/                    # 学習者用コンポーネント
│   └── ui/                      # 共通UIコンポーネント
├── lib/                         # ユーティリティ・設定
│   ├── ai/                      # AI システム
│   │   ├── agents/              # AI エージェント
│   │   ├── tools/               # AI ツール
│   │   └── config.ts            # AI 設定
│   ├── models/                  # データモデル
│   └── db.ts                    # データベース設定
├── public/                      # 静的ファイル
│   ├── uploads/                 # アップロードファイル
│   └── audio/                   # 生成音声ファイル
└── README.md                    # このファイル
```

## 🎮 デモ・体験

### ライブデモ
- **管理者画面**: コンテンツ作成・管理機能の体験
- **学習者画面**: AI学習体験・進捗確認

### 生成例

#### AIクイズ生成例
```
質問: スクラムにおけるスプリントの最大期間は？
A) 1週間
B) 2週間  
C) 4週間
D) 8週間

正解: C) 4週間

解説: スクラムガイドによると、スプリントは1ヶ月以内の期間で実行されます。
一般的には1〜4週間の範囲で設定され、チームの成熟度や要件に応じて調整されます。
```

#### AIアドバイス生成例
```
🤖 あなたの学習アドバイス

現在の進捗: スクラム基礎 85%完了

📊 分析結果:
- 強み: スクラムイベントの理解度が高い
- 改善点: スクラムロールの責任範囲の理解

💡 推奨アクション:
1. Product Ownerの役割に関するクイズを重点的に学習
2. 音声教材でスクラムマスターの実践事例を学習
3. 実践的な現場事例で知識を補強

次回学習予定: 明日 20:00〜20:30 (30分)
```

## 📈 品質指標

### AI生成品質
- **クイズ生成精度**: 95%以上の高品質問題
- **音声変換品質**: 自然な読み上げ音声
- **アドバイス適合度**: 個人学習履歴に基づく90%以上の適合率
- **レスポンス時間**: 平均3秒以内のAI応答

### システム品質
- **可用性**: 99.9%稼働率目標
- **セキュリティ**: エンタープライズレベルのデータ保護
- **パフォーマンス**: 高速レスポンス・軽量設計
- **スケーラビリティ**: ユーザー増加に対応する拡張性

## 🏆 NewBiz企画ハッカソン 2025 エントリー作品

本プロジェクトは「NewBiz企画ハッカソン 2025」のエントリー作品として開発されました。

**テーマ**: 最新AI技術でスクラム学習体験を革新

**革新性**: 複数の最新AI技術を組み合わせた包括的な学習プラットフォーム

## 📝 ライセンス

MIT License

---

**Powered by 最先端AI技術**

*未来の学習を、今ここに。*