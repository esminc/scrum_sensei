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
      <>
        <UserNav />
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      </>
    );
  }
  
  // エラー表示
  if (error || !quiz) {
    return (
      <>
        <UserNav />
        <div className="container mx-auto py-8 px-4">
          <Alert className="bg-red-50 text-red-900 border-red-200">
            <AlertDescription>
              {error || 'クイズデータが見つかりませんでした'}
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 text-center">
            <Button onClick={goToQuizList}>クイズ一覧に戻る</Button>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <UserNav />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card className="shadow-lg overflow-hidden">
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
          <Button variant="outline" onClick={goToQuizList}>
            クイズ一覧に戻る
          </Button>
        </div>
      </div>
    </>
  );
}