'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // next/imageをインポート
import { BookOpen, FileQuestion, Grid, List, Clock, Eye, RefreshCw } from 'lucide-react'; // 未使用のCalendarを削除
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserNav from './UserNav';

type Quiz = {
  id: string;
  title: string;
  description: string;
  questions: Array<Record<string, unknown>>; // anyの代わりに型を指定
};

type LearningMaterial = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  type: 'pdf' | 'video' | 'article' | 'lesson' | 'quiz';
  createdAt: string;
  quizzes?: Quiz[]; // クイズ情報を追加
};

export default function LearningDashboard() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card'); // 表示モードの状態

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      // APIクライアントをインポート
      const { get } = await import('@/lib/api/client');
      
      // APIクライアントを使用してデータを取得
      const data = await get('user/content?includeQuizzes=true');
      setMaterials(data.contents || []);
      setError(null);
    } catch {
      // エラー変数を削除して空のキャッチブロックに
      setError('教材の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // 教材とクイズの総数を計算
  const materialCount = materials.length;
  const quizCount = materials.reduce((count, material) => 
    count + (material.quizzes?.length || 0), 0);

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP');
    } catch {
      return dateString;
    }
  };

  // 時間をフォーマット
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('ja-JP');
    } catch {
      return '';
    }
  };

  // 実データがない場合は統計カードを非表示
  const hasData = materials.length > 0;

  // カード表示のレンダリング
  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map((material) => (
        <div key={material.id} className="flex flex-col">
          {/* 教材カード */}
          <Link 
            href={`/user/content/${material.id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 mb-2"
          >
            <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Image
                src={material.thumbnail || '/globe.svg'}
                alt={material.title}
                width={64}
                height={64}
                className="opacity-50"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center mb-2">
                <BookOpen className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-2">
                  {material.type.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {material.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {material.description}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatDate(material.createdAt)}
              </p>
            </div>
          </Link>
          
          {/* 関連クイズカード */}
          {material.quizzes && material.quizzes.length > 0 && material.quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              href={`/user/quiz/${quiz.id}`}
              className="bg-white dark:bg-gray-800 border-l-4 border-purple-500 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 mb-2 ml-4"
            >
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <FileQuestion className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium text-purple-500 ml-2">
                    問題
                  </span>
                </div>
                <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-1">
                  {quiz.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {quiz.description}
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-900/30 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-300">
                    問題数: {quiz.questions.length}問
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );

  // テーブル表示のレンダリング
  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              教材名
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              種類
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              問題数
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              作成日時
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {materials.map((material) => (
            <tr 
              key={material.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {material.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {material.description || '説明なし'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                  {material.type.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {material.quizzes?.length || 0}個
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-700 dark:text-gray-300">{formatDate(material.createdAt)}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{formatTime(material.createdAt)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex space-x-2 justify-center">
                  <Link href={`/user/content/${material.id}`} className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Eye className="h-3 w-3 mr-1" />
                    表示
                  </Link>
                  {material.quizzes && material.quizzes.length > 0 && (
                    <Link href={`/user/quiz/${material.quizzes[0].id}`} className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                      <FileQuestion className="h-3 w-3 mr-1" />
                      問題へ
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <UserNav />
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              学習ダッシュボード
            </span>
          </h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMaterials}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              更新
            </Button>
            <div className="bg-white dark:bg-gray-800 rounded-md p-1 flex">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="flex items-center"
              >
                <Grid className="h-4 w-4 mr-1" />
                カード
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="flex items-center"
              >
                <List className="h-4 w-4 mr-1" />
                表形式
              </Button>
            </div>
          </div>
        </div>

        {hasData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              あなたの学習状況
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 flex items-center">
                <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full mr-4">
                  <BookOpen className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-300">教材数</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{materialCount}</p>
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 flex items-center">
                <div className="bg-purple-100 dark:bg-purple-800 p-3 rounded-full mr-4">
                  <FileQuestion className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-300">問題数</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">{quizCount}</p>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 flex items-center">
                <div className="bg-green-100 dark:bg-green-800 p-3 rounded-full mr-4">
                  <Clock className="h-6 w-6 text-green-700 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-green-600 dark:text-green-300">累計学習時間</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-200">0時間</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <Tabs defaultValue="materials" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="materials" className="text-sm">学習教材</TabsTrigger>
              <TabsTrigger value="quizzes" className="text-sm">クイズ一覧</TabsTrigger>
              <TabsTrigger value="progress" className="text-sm">進捗状況</TabsTrigger>
            </TabsList>
            
            <TabsContent value="materials">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                利用可能な学習教材
              </h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-md mb-6">
                  <p>{error}</p>
                </div>
              ) : materials.length === 0 ? (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 p-4 rounded-md mb-6">
                  <p>現在、利用可能な学習教材はありません。</p>
                </div>
              ) : viewMode === 'card' ? (
                renderCardView()
              ) : (
                renderTableView()
              )}
            </TabsContent>
            
            <TabsContent value="quizzes">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                クイズ一覧
              </h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-md">
                  <p>{error}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          クイズ名
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          問題数
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          教材
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {materials.flatMap(material => 
                        (material.quizzes || []).map(quiz => (
                          <tr 
                            key={quiz.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                  <FileQuestion className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {quiz.title}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                    {quiz.description || '説明なし'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700 dark:text-gray-300">
                                {quiz.questions.length}問
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link href={`/user/content/${material.id}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                {material.title}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <Link href={`/user/quiz/${quiz.id}`} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                                問題に挑戦
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="progress">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                進捗状況
              </h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md text-yellow-800 dark:text-yellow-300">
                <p>進捗データは現在準備中です。</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}