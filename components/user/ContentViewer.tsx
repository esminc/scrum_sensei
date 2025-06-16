'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ContentViewerProps = {
  contentId: string;
};

type Content = {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'article';
  url: string;
  createdAt: string;
};

export default function ContentViewer({ contentId }: ContentViewerProps) {
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const { getApiPath } = await import('@/lib/apiUtils');
        const res = await fetch(getApiPath(`user/content/${contentId}`));
        if (!res.ok) {
          throw new Error('教材が見つかりません');
        }
        const data = await res.json();
        setContent(data.content);
        setError(null);
      } catch {
        setError('教材の読み込み中にエラーが発生しました。');
      } finally {
        setIsLoading(false);
      }
    };

    if (contentId) {
      fetchContent();
    }
  }, [contentId]);

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // PDFビューアー
  const PDFViewer = ({ url }: { url: string }) => (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow overflow-hidden h-[70vh]">
      <div className="h-full flex flex-col items-center justify-center">
        <svg className="h-20 w-20 text-red-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-600 dark:text-gray-300 mb-4">この段階ではPDFビューアーは実装されていません</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">PDFへのパス: {url}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-6 rounded-md">
          <h3 className="text-lg font-medium mb-2">エラー</h3>
          <p>{error || '教材を読み込めませんでした。'}</p>
          <Link href="/user" className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Link href="/user" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
          <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ダッシュボードに戻る
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {content.title}
        </h1>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="mr-4">
            <span className="font-medium">タイプ:</span> {content.type.toUpperCase()}
          </span>
          <span>
            <span className="font-medium">追加日:</span> {formatDate(content.createdAt)}
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {content.description}
        </p>
      </div>

      {content.type === 'pdf' && <PDFViewer url={content.url} />}

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          フィードバック
        </h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <p className="text-blue-700 dark:text-blue-300">
            この教材はあなたにとって役立ちましたか？フィードバックを共有してください。
          </p>
          <div className="mt-4 flex space-x-2">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors">
              フィードバックを送信
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}