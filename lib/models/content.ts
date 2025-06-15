/**
 * 学習コンテンツに関するモデル定義
 */

/**
 * コンテンツの種類
 */
export type ContentType = 'lesson' | 'article' | 'quiz' | 'video' | 'audio';

/**
 * コンテンツのステータス
 */
export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';

/**
 * セクション
 */
export interface ContentSection {
  id: string;
  title: string;
  content: string;
  order: number;
  audioUrl?: string;      // 音声ファイルのURL
  sourceText?: string;    // TTS生成の元となるテキスト
}

/**
 * 学習コンテンツ
 */
export interface Content {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  status?: ContentStatus;
  sections?: ContentSection[];
  tags?: string[];
  difficulty?: string;
  estimatedTime?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  published: boolean;
}

/**
 * コンテンツ作成リクエスト
 */
export interface CreateContentRequest {
  title: string;
  description: string;
  type: ContentType;
  status?: ContentStatus;
  sections?: ContentSection[];
  tags?: string[];
  difficulty?: string;
  estimatedTime?: number;
  published?: boolean;
}

/**
 * コンテンツ更新リクエスト
 */
export interface UpdateContentRequest {
  title?: string;
  description?: string;
  type?: ContentType;
  status?: ContentStatus;
  sections?: ContentSection[];
  tags?: string[];
  difficulty?: string;
  estimatedTime?: number;
  published?: boolean;
}

/**
 * コンテンツサマリー
 */
export interface ContentSummary {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  status?: ContentStatus;
  sectionCount: number;
  updatedAt: string;
  published: boolean;
}