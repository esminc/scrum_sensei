'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { QuizView } from '@/components/user/QuizView';
import UserNav from '@/components/user/UserNav';
import { Quiz } from '@/lib/models/quiz';
import { QuizResult } from '@/lib/models/progress';

// ユーザー情報（実際はサーバーから取得またはログイン状態から取得）
const mockUser = {
  id: 'user-1',
  name: 'ユーザー'
};

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // クイズデータの取得
  useEffect(() => {
    async function fetchQuiz() {
      try {
        setLoading(true);
        const { getApiPath } = await import('@/lib/apiUtils');
        const response = await fetch(getApiPath(`materials/${params.id}/quiz`));
        
        if (!response.ok) {
          throw new Error('クイズの取得に失敗しました');
        }
        
        const data = await response.json();
        if (data.success && data.quiz) {
          setQuiz(data.quiz);
        } else {
          throw new Error('クイズデータが見つかりませんでした');
        }
      } catch (err) {
        console.error('クイズ取得エラー:', err);
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchQuiz();
    }
  }, [params.id]);

  // クイズ完了時の処理
  const handleQuizComplete = (result: QuizResult) => {
    console.log('クイズ完了:', result);
    // 必要に応じて追加の処理
  };
  
  // クイズ一覧に戻る
  const goToQuizList = () => {
    router.push('/user/quiz');
  };
  
  // ローディング中の表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <UserNav />
        <div className="relative max-w-4xl mx-auto py-8 pt-20 px-4 sm:px-6 lg:px-8 flex justify-center items-center h-64">
          <div className="glass-card rounded-2xl p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-600 mx-auto"></div>
            <p className="text-gray-600 text-center mt-4">クイズを読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // エラー表示
  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <UserNav />
        <div className="relative max-w-4xl mx-auto py-8 pt-20 px-4 sm:px-6 lg:px-8">
          <Alert className="glass-morphism bg-red-100/80 border-red-200/50 backdrop-blur-sm text-red-700 px-6 py-4 rounded-2xl">
            <AlertDescription>
              {error || 'クイズデータが見つかりませんでした'}
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 text-center">
            <Button 
              onClick={goToQuizList}
              className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl"
            >
              クイズ一覧に戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <UserNav />
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-br from-green-400/10 to-blue-500/10 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto py-8 pt-20 px-4 sm:px-6 lg:px-8">
        <Card className="glass-card shadow-xl overflow-hidden animate-in">
          <CardContent className="p-0">
            <QuizView
              quiz={quiz}
              userId={mockUser.id}
              contentId={quiz.contentId || quiz.id} // contentIdがなければクイズIDを代用
              onComplete={handleQuizComplete}
            />
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={goToQuizList}
            className="glass-button text-gray-700 px-6 py-3 rounded-xl"
          >
            クイズ一覧に戻る
          </Button>
        </div>
      </div>
    </div>
  );
}