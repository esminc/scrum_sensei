/**
 * コンテンツデータにアクセスするためのストレージモジュール
 */
import { getDb } from '@/lib/dbUtils';
import { Content, ContentStatus, ContentType, UpdateContentRequest } from '../models/content';
import { Quiz } from '../models/quiz';
import { initContentTables } from './dbInit';
import { 
  CreateProgressRequest, 
  LearningStatistics, 
  ProgressStatus, 
  UpdateProgressRequest, 
  UserProgress 
} from '../models/progress';

// DBのコンテンツレコード型定義
interface DBContent {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  status: ContentStatus;
  tags?: string;
  difficulty?: string;
  estimated_time?: number;
  source_id?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// DBのセクションレコード型定義
interface DBContentSection {
  id: string;
  content_id: string;
  title: string;
  content: string;
  order: number;
  audio_url?: string;
  source_text?: string;
  created_at: string;
  updated_at: string;
}

// 進捗データのDBレコード型定義
interface DBProgress {
  id: string;
  user_id: string;
  content_id: string;
  status: ProgressStatus;
  completion_percentage: number;
  time_spent: number;
  last_accessed: string;
  created_at: string;
  updated_at: string;
}

interface DBSectionProgress {
  id: string;
  progress_id: string;
  section_id: string;
  completed: number; // boolean as 0 or 1
  time_spent: number;
  last_accessed: string;
  created_at: string;
  updated_at: string;
}

interface DBQuizResult {
  id: string;
  progress_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
  time_spent: number;
  created_at: string;
  answers?: DBAnswerDetail[];
}

interface DBAnswerDetail {
  id: string;
  quiz_result_id: string;
  question_id: string;
  user_answer: string;
  is_correct: number;
  time_spent?: number;
  created_at: string;
}

// アプリケーション起動時にテーブルを初期化
initContentTables().catch(error => {
  console.error('データベース初期化エラー:', error);
});

/**
 * コンテンツストアクラス
 * コンテンツデータへのアクセスを管理
 */
class ContentStore {
  /**
   * すべてのコンテンツを取得
   */
  async getAllContents(): Promise<Content[]> {
    try {
      const db = await getDb();
      const contents = await db.all<DBContent[]>(`
        SELECT * FROM contents 
        ORDER BY updated_at DESC
      `);
      
      return this.mapDbContentsToModel(contents);
    } catch (error) {
      console.error('コンテンツ取得エラー:', error);
      return [];
    }
  }

  /**
   * 指定ステータスのコンテンツを取得
   */
  async getContentsByStatus(status: ContentStatus): Promise<Content[]> {
    try {
      const db = await getDb();
      const contents = await db.all<DBContent[]>(`
        SELECT * FROM contents 
        WHERE status = ? 
        ORDER BY updated_at DESC
      `, status);
      
      return this.mapDbContentsToModel(contents);
    } catch (error) {
      console.error(`${status}状態のコンテンツ取得エラー:`, error);
      return [];
    }
  }

  /**
   * IDによるコンテンツ取得
   */
  async getContentById(id: string): Promise<Content | null> {
    try {
      const db = await getDb();
      const content = await db.get<DBContent>('SELECT * FROM contents WHERE id = ?', id);
      
      if (!content) return null;
      
      // セクション情報を取得
      const sections = await db.all<DBContentSection[]>(`
        SELECT * FROM content_sections 
        WHERE content_id = ? 
        ORDER BY \`order\`
      `, id);
      
      const contentModel = this.mapDbContentToModel(content);
      contentModel.sections = sections.map(section => ({
        id: section.id,
        title: section.title,
        content: section.content,
        order: section.order,
        audioUrl: section.audio_url,
        sourceText: section.source_text
      }));
      
      return contentModel;
    } catch (error) {
      console.error(`ID: ${id} のコンテンツ取得エラー:`, error);
      return null;
    }
  }

  /**
   * コンテンツを公開状態に変更
   */
  async publishContent(id: string): Promise<Content | null> {
    try {
      const db = await getDb();
      const now = new Date().toISOString();
      
      // トランザクション開始
      await db.exec('BEGIN TRANSACTION');
      
      // コンテンツのステータスを更新
      const result = await db.run(`
        UPDATE contents 
        SET status = ?, published_at = ?, updated_at = ?
        WHERE id = ?
      `, 'published', now, now, id);
      
      // 影響を受けた行がなければトランザクションをロールバック
      if (result.changes === 0) {
        await db.exec('ROLLBACK');
        return null;
      }
      
      // トランザクションをコミット
      await db.exec('COMMIT');
      
      // 更新されたコンテンツを取得して返す
      return await this.getContentById(id);
    } catch (error) {
      console.error(`コンテンツの公開に失敗しました ID: ${id}:`, error);
      return null;
    }
  }

  /**
   * コンテンツに関連するクイズを取得
   */
  async getQuizzesByContentId(contentId: string): Promise<Quiz[]> {
    try {
      const db = await getDb();
      const quizzes = await db.all<{
        id: string;
        title: string;
        description: string;
        content_id?: string;
        time_limit?: number;
        passing_score?: number;
        created_at: string;
        updated_at: string;
      }[]>(`
        SELECT * FROM quizzes 
        WHERE content_id = ? 
        ORDER BY created_at DESC
      `, contentId);
      
      return quizzes.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        contentId: quiz.content_id,
        timeLimit: quiz.time_limit,
        passingScore: quiz.passing_score,
        createdAt: quiz.created_at,
        updatedAt: quiz.updated_at,
        questions: [] // 必要に応じて質問を取得
      }));
    } catch (error) {
      console.error(`コンテンツID: ${contentId} のクイズ取得エラー:`, error);
      return [];
    }
  }

  /**
   * コンテンツを更新
   */
  async updateContent(id: string, data: UpdateContentRequest): Promise<Content | null> {
    try {
      const db = await getDb();
      const now = new Date().toISOString();
      
      // トランザクション開始
      await db.exec('BEGIN TRANSACTION');
      
      // 既存のコンテンツを取得
      const existingContent = await this.getContentById(id);
      if (!existingContent) {
        await db.exec('ROLLBACK');
        return null;
      }
      
      // コンテンツ基本情報の更新
      const fieldsToUpdate = [];
      const params = [];
      
      if (data.title !== undefined) {
        fieldsToUpdate.push('title = ?');
        params.push(data.title);
      }
      
      if (data.description !== undefined) {
        fieldsToUpdate.push('description = ?');
        params.push(data.description);
      }
      
      if (data.status !== undefined) {
        fieldsToUpdate.push('status = ?');
        params.push(data.status);
      }
      
      if (data.type !== undefined) {
        fieldsToUpdate.push('type = ?');
        params.push(data.type);
      }
      
      if (data.tags !== undefined) {
        fieldsToUpdate.push('tags = ?');
        params.push(JSON.stringify(data.tags));
      }
      
      if (data.difficulty !== undefined) {
        fieldsToUpdate.push('difficulty = ?');
        params.push(data.difficulty);
      }
      
      if (data.estimatedTime !== undefined) {
        fieldsToUpdate.push('estimated_time = ?');
        params.push(data.estimatedTime);
      }
      
      if (data.published !== undefined) {
        const status = data.published ? 'published' : existingContent.status === 'published' ? 'draft' : existingContent.status;
        fieldsToUpdate.push('status = ?');
        params.push(status);
        
        if (data.published) {
          fieldsToUpdate.push('published_at = ?');
          params.push(now);
        }
      }
      
      // 更新日時の設定
      fieldsToUpdate.push('updated_at = ?');
      params.push(now);
      
      // IDをパラメータの最後に追加
      params.push(id);
      
      // コンテンツテーブルの更新
      if (fieldsToUpdate.length > 0) {
        await db.run(`
          UPDATE contents 
          SET ${fieldsToUpdate.join(', ')} 
          WHERE id = ?
        `, ...params);
      }
      
      // セクションの更新
      if (data.sections) {
        // 既存のセクションを削除
        await db.run('DELETE FROM content_sections WHERE content_id = ?', id);
        
        // 新しいセクションを追加
        for (const section of data.sections) {
          await db.run(`
            INSERT INTO content_sections (
              id, content_id, title, content, \`order\`, 
              audio_url, source_text, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, 
          section.id || `section-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          id, 
          section.title, 
          section.content, 
          section.order,
          section.audioUrl || null,
          section.sourceText || null,
          now,
          now
          );
        }
      }
      
      // トランザクションのコミット
      await db.exec('COMMIT');
      
      // 更新されたコンテンツを取得して返す
      return await this.getContentById(id);
      
    } catch (error) {
      console.error(`コンテンツ更新エラー (${id}):`, error);
      return null;
    }
  }

  /**
   * コンテンツを削除
   */
  async deleteContent(id: string): Promise<boolean> {
    try {
      const db = await getDb();
      
      // トランザクション開始
      await db.exec('BEGIN TRANSACTION');
      
      // コンテンツの存在確認
      const content = await db.get('SELECT id FROM contents WHERE id = ?', id);
      if (!content) {
        await db.exec('ROLLBACK');
        return false;
      }
      
      // 関連するセクションを削除
      await db.run('DELETE FROM content_sections WHERE content_id = ?', id);
      
      // コンテンツを削除
      await db.run('DELETE FROM contents WHERE id = ?', id);
      
      // トランザクションのコミット
      await db.exec('COMMIT');
      
      return true;
    } catch (error) {
      console.error(`コンテンツ削除エラー (${id}):`, error);
      return false;
    }
  }

  /**
   * DB結果をモデルにマッピング
   */
  private mapDbContentsToModel(dbContents: DBContent[]): Content[] {
    return dbContents.map(content => this.mapDbContentToModel(content));
  }

  /**
   * 単一DBレコードをモデルにマッピング
   */
  private mapDbContentToModel(dbContent: DBContent): Content {
    return {
      id: dbContent.id,
      title: dbContent.title,
      description: dbContent.description,
      type: dbContent.type as ContentType,
      status: dbContent.status,
      sections: [], // 必要に応じて取得
      tags: dbContent.tags ? JSON.parse(dbContent.tags) : [],
      difficulty: dbContent.difficulty,
      estimatedTime: dbContent.estimated_time,
      createdAt: dbContent.created_at,
      updatedAt: dbContent.updated_at,
      publishedAt: dbContent.published_at,
      published: dbContent.status === 'published'
    };
  }
}

/**
 * 進捗ストアクラス
 * ユーザーの学習進捗データへのアクセスを管理
 */
class ProgressStore {
  /**
   * ユーザーの進捗情報を取得
   */
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    try {
      const db = await getDb();
      const progresses = await db.all<DBProgress[]>(`
        SELECT * FROM user_progress 
        WHERE user_id = ? 
        ORDER BY last_accessed DESC
      `, userId);
      
      const results: UserProgress[] = [];
      
      for (const progress of progresses) {
        const fullProgress = await this.getProgressById(progress.id);
        if (fullProgress) {
          results.push(fullProgress);
        }
      }
      
      return results;
    } catch (error) {
      console.error(`ユーザー進捗取得エラー (${userId}):`, error);
      return [];
    }
  }

  /**
   * 特定のコンテンツに対するユーザーの進捗を取得
   */
  async getContentProgress(userId: string, contentId: string): Promise<UserProgress | null> {
    try {
      const db = await getDb();
      const progress = await db.get<DBProgress>(`
        SELECT * FROM user_progress 
        WHERE user_id = ? AND content_id = ?
      `, userId, contentId);
      
      if (!progress) return null;
      
      return this.getProgressById(progress.id);
    } catch (error) {
      console.error(`コンテンツ進捗取得エラー (${userId}, ${contentId}):`, error);
      return null;
    }
  }

  /**
   * 進捗IDによる詳細情報取得
   */
  async getProgressById(progressId: string): Promise<UserProgress | null> {
    try {
      const db = await getDb();
      const progress = await db.get<DBProgress>(`
        SELECT * FROM user_progress WHERE id = ?
      `, progressId);
      
      if (!progress) return null;
      
      // セクション進捗取得
      const sectionProgresses = await db.all<DBSectionProgress[]>(`
        SELECT * FROM section_progress WHERE progress_id = ?
      `, progressId);
      
      // クイズ結果取得
      const quizResults = await db.all<DBQuizResult[]>(`
        SELECT * FROM quiz_results WHERE progress_id = ?
        ORDER BY completed_at DESC
      `, progressId);
      
      // 解答詳細を取得
      const quizResultsWithAnswers = [];
      for (const qr of quizResults) {
        const answers = await db.all<DBAnswerDetail[]>(`
          SELECT * FROM answer_details WHERE quiz_result_id = ?
        `, qr.id);
        
        quizResultsWithAnswers.push({
          ...qr,
          answers: answers.map(a => ({
            questionId: a.question_id,
            userAnswer: JSON.parse(a.user_answer),
            isCorrect: !!a.is_correct,
            timeSpent: a.time_spent
          }))
        });
      }
      
      return {
        id: progress.id,
        userId: progress.user_id,
        contentId: progress.content_id,
        status: progress.status as ProgressStatus,
        completionPercentage: progress.completion_percentage,
        timeSpent: progress.time_spent,
        lastAccessed: progress.last_accessed,
        sectionProgress: sectionProgresses.map(sp => ({
          sectionId: sp.section_id,
          completed: !!sp.completed,
          timeSpent: sp.time_spent,
          lastAccessed: sp.last_accessed
        })),
        quizResults: quizResultsWithAnswers.map(qr => ({
          quizId: qr.quiz_id,
          score: qr.score,
          totalQuestions: qr.total_questions,
          correctAnswers: qr.correct_answers,
          completedAt: qr.completed_at,
          timeSpent: qr.time_spent,
          answers: qr.answers
        }))
      };
    } catch (error) {
      console.error(`進捗詳細取得エラー (${progressId}):`, error);
      return null;
    }
  }

  /**
   * ユーザーの学習統計情報を取得
   */
  async getUserStats(userId: string): Promise<LearningStatistics> {
    try {
      const db = await getDb();
      
      // 総学習時間
      const timeResult = await db.get<{ total: number }>(`
        SELECT SUM(time_spent) as total FROM user_progress WHERE user_id = ?
      `, userId);
      
      // 完了したコンテンツ数
      const completedResult = await db.get<{ count: number }>(`
        SELECT COUNT(*) as count FROM user_progress 
        WHERE user_id = ? AND status = 'completed'
      `, userId);
      
      // 進行中のコンテンツ数
      const inProgressResult = await db.get<{ count: number }>(`
        SELECT COUNT(*) as count FROM user_progress 
        WHERE user_id = ? AND status = 'in-progress'
      `, userId);
      
      // 平均スコア
      const scoreResult = await db.get<{ avg: number }>(`
        SELECT AVG(qr.score) as avg FROM quiz_results qr
        JOIN user_progress up ON qr.progress_id = up.id
        WHERE up.user_id = ?
      `, userId);
      
      // 学習タグ分析のためのコンテンツ取得
      const contents = await db.all<Array<{ id: string, tags: string }>>(`
        SELECT c.id, c.tags FROM contents c
        JOIN user_progress up ON c.id = up.content_id
        WHERE up.user_id = ?
      `, userId);
      
      // クイズ結果取得
      const quizResults = await db.all<Array<{ content_id: string, score: number }>>(`
        SELECT up.content_id, qr.score FROM quiz_results qr
        JOIN user_progress up ON qr.progress_id = up.id
        WHERE up.user_id = ?
      `, userId);
      
      // タグごとの強み/弱みを分析
      const tagScores: Record<string, { total: number, count: number }> = {};
      
      // contentsが配列であることを確認
      if (Array.isArray(contents)) {
        for (const content of contents) {
          if (!content.tags) continue;
          
          let tags: string[] = [];
          try {
            // tagsが文字列か確認してからパース
            tags = typeof content.tags === 'string' ? JSON.parse(content.tags) : [];
            if (!Array.isArray(tags)) {
              tags = [];
            }
          } catch {
            continue;
          }
          
          // quizResultsが配列であることを確認
          if (Array.isArray(quizResults)) {
            // クイズ結果のフィルタリングを修正
            const contentResults = quizResults.filter((result: { content_id: string, score: number }) => 
              result.content_id === content.id
            );
            
            if (contentResults.length === 0) continue;
            
            // reduce関数の引数の型を明示
            const avgScore = contentResults.reduce((sum: number, result: { score: number }) => 
              sum + result.score, 0) / contentResults.length;
            
            for (const tag of tags) {
              if (!tagScores[tag]) {
                tagScores[tag] = { total: 0, count: 0 };
              }
              tagScores[tag].total += avgScore;
              tagScores[tag].count++;
            }
          }
        }
      }
      
      const sortedTags = Object.entries(tagScores)
        .filter(([, stats]) => stats.count > 0)
        .map(([tag, stats]) => ({
          tag,
          avgScore: stats.total / stats.count
        }))
        .sort((a, b) => b.avgScore - a.avgScore);
      
      const strongTopics = sortedTags.slice(0, 3).map(item => item.tag);
      const weakTopics = [...sortedTags].reverse().slice(0, 3).map(item => item.tag);
      
      return {
        totalTimeSpent: timeResult?.total || 0,
        completedContents: completedResult?.count || 0,
        inProgressContents: inProgressResult?.count || 0,
        averageScore: scoreResult?.avg || 0,
        strongTopics,
        weakTopics
      };
    } catch (error) {
      console.error(`学習統計取得エラー (${userId}):`, error);
      return {
        totalTimeSpent: 0,
        completedContents: 0,
        inProgressContents: 0,
        averageScore: 0,
        strongTopics: [],
        weakTopics: []
      };
    }
  }

  /**
   * 進捗情報を新規作成
   */
  async createProgress(data: CreateProgressRequest): Promise<UserProgress | null> {
    try {
      const db = await getDb();
      const now = new Date().toISOString();
      const id = `prog_${Date.now()}`;
      
      // 既存の進捗を確認
      const existingProgress = await db.get<{ id: string }>(`
        SELECT id FROM user_progress 
        WHERE user_id = ? AND content_id = ?
      `, data.userId, data.contentId);
      
      if (existingProgress) {
        // 既に存在する場合は更新
        return this.updateProgress(existingProgress.id, {
          ...data,
          lastAccessed: now
        });
      }
      
      // 新しい進捗を作成
      await db.run(`
        INSERT INTO user_progress (
          id, user_id, content_id, status, 
          completion_percentage, time_spent, last_accessed,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, 
      id, data.userId, data.contentId, data.status || 'not-started',
      data.completionPercentage || 0, data.timeSpent || 0, now,
      now, now);
      
      // セクション進捗があれば追加
      if (data.sectionProgress && data.sectionProgress.length > 0) {
        for (const section of data.sectionProgress) {
          await db.run(`
            INSERT INTO section_progress (
              id, progress_id, section_id, completed,
              time_spent, last_accessed, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          `sp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          id, section.sectionId, section.completed ? 1 : 0,
          section.timeSpent || 0, now, now, now);
        }
      }
      
      // 作成した進捗を返す
      return this.getProgressById(id);
    } catch (error) {
      console.error('進捗作成エラー:', error);
      return null;
    }
  }

  /**
   * 進捗情報を更新
   */
  async updateProgress(progressId: string, data: UpdateProgressRequest): Promise<UserProgress | null> {
    try {
      const db = await getDb();
      const now = new Date().toISOString();
      
      // 既存の進捗を確認
      const existing = await db.get<DBProgress>(`
        SELECT * FROM user_progress WHERE id = ?
      `, progressId);
      
      if (!existing) return null;
      
      // 進捗データ更新
      const updates = [];
      const values = [];
      
      if (data.status) {
        updates.push('status = ?');
        values.push(data.status);
      }
      
      if (typeof data.completionPercentage === 'number') {
        updates.push('completion_percentage = ?');
        values.push(data.completionPercentage);
      }
      
      if (typeof data.timeSpent === 'number') {
        updates.push('time_spent = time_spent + ?');
        values.push(data.timeSpent);
      }
      
      // 最終アクセス日時は必ず更新
      updates.push('last_accessed = ?');
      values.push(data.lastAccessed || now);
      
      updates.push('updated_at = ?');
      values.push(now);
      
      // 値が更新されるものがあれば実行
      if (updates.length > 0) {
        const query = `UPDATE user_progress SET ${updates.join(', ')} WHERE id = ?`;
        await db.run(query, ...values, progressId);
      }
      
      // セクション進捗の更新
      if (data.sectionProgress && data.sectionProgress.length > 0) {
        for (const section of data.sectionProgress) {
          // 既存のセクション進捗を確認
          const existingSection = await db.get<{ id: string }>(`
            SELECT id FROM section_progress 
            WHERE progress_id = ? AND section_id = ?
          `, progressId, section.sectionId);
          
          if (existingSection) {
            // 既存セクションの更新
            const sectionUpdates = [];
            const sectionValues = [];
            
            if (typeof section.completed === 'boolean') {
              sectionUpdates.push('completed = ?');
              sectionValues.push(section.completed ? 1 : 0);
            }
            
            if (typeof section.timeSpent === 'number') {
              sectionUpdates.push('time_spent = time_spent + ?');
              sectionValues.push(section.timeSpent);
            }
            
            sectionUpdates.push('last_accessed = ?');
            sectionValues.push(now);
            
            sectionUpdates.push('updated_at = ?');
            sectionValues.push(now);
            
            if (sectionUpdates.length > 0) {
              const sectionQuery = `UPDATE section_progress SET ${sectionUpdates.join(', ')} WHERE id = ?`;
              await db.run(sectionQuery, ...sectionValues, existingSection.id);
            }
          } else {
            // 新しいセクション進捗を作成
            await db.run(`
              INSERT INTO section_progress (
                id, progress_id, section_id, completed,
                time_spent, last_accessed, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            `sp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            progressId, section.sectionId, section.completed ? 1 : 0,
            section.timeSpent || 0, now, now, now);
          }
        }
      }
      
      // クイズ結果の追加
      if (data.quizResult) {
        // クイズ結果を保存
        const quizResultId = `qr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        await db.run(`
          INSERT INTO quiz_results (
            id, progress_id, quiz_id, score,
            total_questions, correct_answers,
            completed_at, time_spent, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        quizResultId, progressId, data.quizResult.quizId, data.quizResult.score,
        data.quizResult.totalQuestions, data.quizResult.correctAnswers,
        data.quizResult.completedAt || now, data.quizResult.timeSpent || 0, now);
        
        // 回答詳細を保存
        if (data.quizResult.answers && data.quizResult.answers.length > 0) {
          for (const answer of data.quizResult.answers) {
            await db.run(`
              INSERT INTO answer_details (
                id, quiz_result_id, question_id, 
                user_answer, is_correct, time_spent, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            `ad_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            quizResultId, answer.questionId,
            JSON.stringify(answer.userAnswer), answer.isCorrect ? 1 : 0, 
            answer.timeSpent || 0, now);
          }
        }
      }
      
      // 更新された進捗を返す
      return this.getProgressById(progressId);
    } catch (error) {
      console.error(`進捗更新エラー (${progressId}):`, error);
      return null;
    }
  }
}

export const contentStore = new ContentStore();
export const progressStore = new ProgressStore();