'use client';

import { useState, useEffect } from 'react';
import { Content, ContentStatus } from '@/lib/models/content';
import Link from 'next/link';

interface ContentManagerProps {
  onEdit?: (content: Content) => void;
}

export default function ContentManager({ onEdit }: ContentManagerProps) {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');
  const [debug, setDebug] = useState<string>('');

  // コンテンツを取得
  const fetchContents = async () => {
    setLoading(true);
    try {
      // APIクライアントをインポート
      const { get } = await import('@/lib/api/client');
      
      // APIクライアントを使用してデータを取得
      const data = await get('admin/content');
      setContents(data.contents || []);
      
      // デバッグ情報を設定
      if (data.contents && data.contents.length > 0) {
        const firstItem = data.contents[0];
        setDebug(`最初のコンテンツ情報: status=${firstItem.status}, published=${firstItem.published}`);
      } else {
        setDebug('コンテンツがありません');
      }
      
      setError(null);
    } catch (err) {
      console.error('コンテンツ取得エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // コンテンツを削除
  const deleteContent = async (id: string) => {
    if (!confirm('このコンテンツを削除してもよろしいですか？')) return;
    
    try {
      // APIクライアントをインポート
      const { del } = await import('@/lib/api/client');
      
      // APIクライアントを使用してデータを削除
      await del(`admin/content?id=${id}`);
      
      // 削除成功したら一覧を更新
      fetchContents();
    } catch (err) {
      console.error('コンテンツ削除エラー:', err);
      alert(err instanceof Error ? err.message : '不明なエラーが発生しました');
    }
  };

  // コンテンツのステータスを変更（ステータス変更ボタンを表示するときにこの関数を使用）
  /* 現在未使用のため、必要になったらコメントを外して使用する
  const updateContentStatus = async (id: string, status: ContentStatus) => {
    try {
      const response = await fetch(`/scrum_sensei/api/admin/content/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) throw new Error('コンテンツの更新に失敗しました');
      
      // 更新成功したら一覧を更新
      fetchContents();
    } catch (err) {
      console.error('コンテンツ更新エラー:', err);
      alert(err instanceof Error ? err.message : '不明なエラーが発生しました');
    }
  };
  */

  // コンテンツを公開する（専用APIを使用）
  const publishContent = async (id: string) => {
    try {
      const response = await fetch(`/scrum_sensei/api/admin/content/publish/${id}`, {
        method: 'PUT',
      });
      
      if (!response.ok) throw new Error('コンテンツの公開に失敗しました');
      
      // 更新成功したら一覧を更新
      fetchContents();
      alert('コンテンツが公開されました！ユーザー学習ページで閲覧できるようになりました。');
    } catch (err) {
      console.error('コンテンツ公開エラー:', err);
      alert(err instanceof Error ? err.message : '不明なエラーが発生しました');
    }
  };

  // 初回レンダリング時にコンテンツを取得
  useEffect(() => {
    fetchContents();
  }, []);

  // ステータスでフィルタリングされたコンテンツ
  const filteredContents = statusFilter === 'all'
    ? contents
    : contents.filter(content => content.status === statusFilter);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">コンテンツ管理</h2>
        <Link href="/admin/generate" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          新規コンテンツ作成
        </Link>
      </div>
      
      <div className="mb-4">
        <label className="mr-2">ステータス:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ContentStatus | 'all')}
          className="border rounded p-2"
        >
          <option value="all">すべて</option>
          <option value="draft">下書き</option>
          <option value="review">レビュー</option>
          <option value="published">公開</option>
          <option value="archived">アーカイブ</option>
        </select>
        <button 
          onClick={fetchContents}
          className="ml-4 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
        >
          更新
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : error ? (
        <div className="text-red-500 py-4">{error}</div>
      ) : filteredContents.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 rounded">
          コンテンツが見つかりません
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border text-gray-800 dark:text-white">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="py-2 px-4 border text-gray-800 dark:text-white">タイトル</th>
                <th className="py-2 px-4 border text-gray-800 dark:text-white">タイプ</th>
                <th className="py-2 px-4 border text-gray-800 dark:text-white">ステータス</th>
                <th className="py-2 px-4 border text-gray-800 dark:text-white">作成日</th>
                <th className="py-2 px-4 border text-gray-800 dark:text-white">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredContents.map((content) => (
                <tr key={content.id} className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
                  <td className="py-2 px-4 border">{content.title}</td>
                  <td className="py-2 px-4 border">{content.type}</td>
                  <td className="py-2 px-4 border">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      content.status === 'published' ? 'bg-green-200 text-green-900' : 
                      content.status === 'review' ? 'bg-yellow-200 text-yellow-900' : 
                      content.status === 'archived' ? 'bg-gray-200 text-gray-900' : 'bg-blue-200 text-blue-900'
                    }`}>
                      {content.status === 'published' ? '公開' : 
                       content.status === 'review' ? 'レビュー' : 
                       content.status === 'archived' ? 'アーカイブ' : '下書き'}
                    </span>
                  </td>
                  <td className="py-2 px-4 border">
                    {new Date(content.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onEdit?.(content)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                      >
                        編集
                      </button>
                      {/* 条件を簡略化して表示を保証 */}
                      <button 
                        onClick={() => publishContent(content.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                      >
                        公開
                      </button>
                      <button 
                        onClick={() => deleteContent(content.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* デバッグ情報表示 */}
      <div className="mt-4 p-4 bg-gray-50 border rounded">
        <h3 className="font-bold text-lg">デバッグ情報</h3>
        <pre className="text-sm text-gray-700">{debug}</pre>
      </div>
    </div>
  );
}