'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, FileQuestion, Calendar, Plus } from 'lucide-react';
import UserNav from '@/components/user/UserNav';

// クイズアイテムの型定義
interface QuizItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  questionCount: number;
}

export default function QuizListPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // クイズデータの取得
  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const { getApiPath } = await import('@/lib/apiUtils');
        const response = await fetch(getApiPath('quizzes'));
        const data = await response.json();
        
        if (data.success && Array.isArray(data.quizzes)) {
          setQuizzes(data.quizzes);
          setFilteredQuizzes(data.quizzes);
        } else {
          setQuizzes([]);
          setFilteredQuizzes([]);
        }
        setError(null);
      } catch (error) {
        console.error('クイズ取得エラー:', error);
        setError('クイズデータの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // 検索フィルタリング
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredQuizzes(quizzes);
    } else {
      const filtered = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredQuizzes(filtered);
    }
  }, [searchQuery, quizzes]);

  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP');
    } catch (error) {
      return dateString;
    }
  };

  // クイズカード
  const QuizCard = ({ quiz }: { quiz: QuizItem }) => {
    return (
      <Card className="glass-card overflow-hidden animate-in delay-300">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className="glass-morphism-subtle text-blue-700 px-3 py-1">
              <FileQuestion className="h-4 w-4 mr-1" />
              <span>問題</span>
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {quiz.title}
          </CardTitle>
          <CardDescription className="text-gray-600 line-clamp-2">
            {quiz.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="glass-morphism-subtle rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">{formatDate(quiz.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <FileQuestion className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {quiz.questionCount}問
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Link href={`/user/quiz/${quiz.id}`} className="w-full">
            <Button className="w-full glass-button bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 rounded-xl">
              問題に挑戦
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <UserNav />
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-br from-green-400/10 to-blue-500/10 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto py-8 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 glass-card rounded-2xl shadow-lg float-animation">
              <FileQuestion className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                問題集一覧
              </h1>
              <p className="mt-2 text-gray-600 text-lg">
                利用可能な問題集から選択して学習を進めましょう
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/user/quiz-generator">
              <Button className="glass-button bg-gradient-to-r from-green-500 to-teal-600 text-white font-medium px-6 py-3 rounded-xl flex items-center space-x-2 pulse-glow">
                <Plus className="h-4 w-4" />
                <span>新しい問題を生成</span>
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="glass-card rounded-2xl shadow-xl overflow-hidden mb-8 animate-in delay-200">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="問題集を検索..."
                  className="pl-10 glass-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="glass-button text-gray-700 px-4 py-2 rounded-xl"
              >
                <Filter className="h-4 w-4 mr-2" />
                フィルター
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="glass-morphism bg-white/30 border-white/20 backdrop-blur-sm rounded-2xl p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-600 mx-auto"></div>
                  <p className="text-gray-600 text-center mt-4">問題集を読み込み中...</p>
                </div>
              </div>
            ) : error ? (
              <div className="glass-morphism bg-red-100/80 border-red-200/50 backdrop-blur-sm text-red-700 px-6 py-4 rounded-2xl">
                <strong className="font-bold">エラー: </strong>
                <span>{error}</span>
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="text-center p-12">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <FileQuestion className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                  問題集がまだありません
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  最初の問題集を生成して学習を始めましょう。
                </p>
                <Link href="/user/quiz-generator">
                  <Button className="glass-button bg-gradient-to-r from-green-500 to-teal-600 text-white font-medium px-8 py-4 rounded-xl flex items-center space-x-2 mx-auto pulse-glow">
                    <Plus className="h-4 w-4" />
                    <span>問題を生成する</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}