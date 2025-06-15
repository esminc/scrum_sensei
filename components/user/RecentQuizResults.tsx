'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuizResult } from '@/lib/models/progress';
import { ArrowRight, Calendar, CheckCircle, Clock, FileQuestion, Star, XCircle } from 'lucide-react';
import Link from 'next/link';

interface RecentQuizResultsProps {
  results: Array<{
    result: QuizResult;
    quizTitle?: string;
    contentId: string;
  }>;
  limit?: number;
}

export function RecentQuizResults({ results, limit = 3 }: RecentQuizResultsProps) {
  // 表示数を制限
  const limitedResults = results.slice(0, limit);

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      // フォーマットに失敗した場合は元の文字列を返す
      return dateString;
    }
  };

  // 時間をフォーマット
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}分${remainingSeconds > 0 ? `${remainingSeconds}秒` : ''}`;
    }
    return `${remainingSeconds}秒`;
  };

  if (limitedResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileQuestion className="h-5 w-5 mr-2" />
            最近のクイズ結果
          </CardTitle>
          <CardDescription>直近のクイズ解答実績</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-2" />
          <p className="text-lg font-medium">クイズ結果はまだありません</p>
          <p className="text-sm text-muted-foreground mt-1">
            問題を解くとここに結果が表示されます
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/user/quiz">
            <Button variant="outline" className="w-full">
              問題を解く
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileQuestion className="h-5 w-5 mr-2" />
          最近のクイズ結果
        </CardTitle>
        <CardDescription>直近のクイズ解答実績</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {limitedResults.map((item, index) => (
            <div key={`recent-quiz-${index}`} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className={`rounded-full p-1.5 mr-2 ${
                    item.result.score >= 80 ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 
                    item.result.score >= 60 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400' :
                    'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                  }`}>
                    {item.result.score >= 80 ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : item.result.score >= 60 ? (
                      <FileQuestion className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </div>
                  <h3 className="text-sm font-medium truncate max-w-[200px]">
                    {item.quizTitle || 'クイズ'}
                  </h3>
                </div>
                <Badge className={`${
                  item.result.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                  item.result.score >= 60 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {item.result.score}%
                </Badge>
              </div>

              <div className="mb-2">
                <Progress 
                  value={item.result.score} 
                  className="h-1.5" 
                  indicatorClassName={`${
                    item.result.score >= 80 ? 'bg-green-500' : 
                    item.result.score >= 60 ? 'bg-amber-500' : 
                    'bg-red-500'
                  }`}
                />
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  <span>{item.result.correctAnswers}/{item.result.totalQuestions} 正解</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatTime(item.result.timeSpent)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(item.result.completedAt)}</span>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Link href={`/user/quiz/${item.result.quizId}`} className="text-xs text-primary hover:underline">
                  再挑戦
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/user/statistics">
          <Button variant="ghost" className="w-full" size="sm">
            すべての結果を表示
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}