'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';

type Question = {
  id: number;
  question: string;
  type: string;
  correct_answer: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect?: boolean;
  }>;
  explanation: string;
  created_at: string;
};

type Material = {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  questions: Question[];
};

export default function MaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchMaterial(params.id as string);
    }
  }, [params.id]);

  const fetchMaterial = async (id: string) => {
    try {
      setLoading(true);
      const { getApiPath } = await import('@/lib/apiUtils');
      const response = await fetch(getApiPath(`admin/materials/${id}`));
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'サーバーエラーが発生しました');
      }
      
      setMaterial(data.material);
      setError(null);
    } catch (error) {
      console.error('教材取得エラー:', error);
      setError('教材の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!material || !confirm('本当に削除しますか？')) return;
    
    try {
      const { getApiPath } = await import('@/lib/apiUtils');
      const response = await fetch(getApiPath(`admin/materials/${material.id}`), {
        method: 'DELETE'
      });
      
      if (response.ok) {
        router.push('/admin/materials');
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      alert('削除時にエラーが発生しました');
      console.error('削除エラー:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">エラー: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <Button 
            onClick={() => router.push('/admin/materials')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            教材一覧に戻る
          </Button>
        </main>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">教材が見つかりません</h2>
            <Button 
              onClick={() => router.push('/admin/materials')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              教材一覧に戻る
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      
      <main className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {material.title}
            </h1>
            <p className="text-gray-600">
              {material.description}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/materials')}
              className="text-gray-600 border-gray-600 hover:bg-gray-50"
            >
              一覧に戻る
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/materials/${material.id}/edit`)}
              className="text-amber-600 border-amber-600 hover:bg-amber-50"
            >
              編集
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              削除
            </Button>
          </div>
        </div>

        {/* 教材情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">教材情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-600">タイプ</span>
              <p className="font-medium">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  material.type === 'quiz' 
                    ? 'bg-blue-100 text-blue-800' 
                    : material.type === 'pdf'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {material.type === 'quiz' ? 'AIクイズ' : material.type === 'pdf' ? 'PDF教材' : material.type}
                </span>
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">ステータス</span>
              <p className="font-medium">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  material.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {material.status === 'published' ? '公開中' : '下書き'}
                </span>
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">問題数</span>
              <p className="font-medium">{material.questions?.length || 0}問</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">作成日</span>
              <p className="font-medium">{formatDate(material.created_at)}</p>
            </div>
          </div>
        </div>

        {/* 問題一覧 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">問題一覧</h2>
          
          {material.questions && material.questions.length > 0 ? (
            <div className="space-y-6">
              {material.questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-gray-600">
                      問題 {index + 1}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {formatDate(question.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    {question.question}
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-800 mb-2">選択肢:</h4>
                    <div className="space-y-2">
                      {question.options?.map((option) => (
                        <div 
                          key={option.id} 
                          className={`p-3 rounded border ${
                            option.id === question.correct_answer
                              ? 'bg-green-50 border-green-200 text-green-800'
                              : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <span className="font-medium">{option.id.toUpperCase()})</span> {option.text}
                          {option.id === question.correct_answer && (
                            <span className="ml-2 text-green-600 font-bold">✓ 正解</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">解説:</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              この教材には問題がありません。
            </p>
          )}
        </div>
      </main>
    </div>
  );
}