'use client';

import { useState } from 'react';
import QuizGenerator from '@/components/QuizGenerator';
import QuizDisplay from '@/components/QuizDisplay';
import AdminNav from '@/components/admin/AdminNav';
import { QuizQuestion } from '@/lib/models/quiz';
import { Brain, Sparkles, BookOpen } from 'lucide-react';

export default function AdminQuizGeneratorPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const handleQuizGenerated = (generatedQuestions: QuizQuestion[]) => {
    setQuestions(generatedQuestions);
  };

  const resetQuiz = () => {
    setQuestions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AdminNav />
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-br from-green-400/10 to-blue-500/10 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto py-8 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-4 glass-card rounded-2xl shadow-lg float-animation">
            <Brain className="h-10 w-10 text-purple-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              問題生成ツール
            </h1>
            <p className="mt-2 text-gray-600 text-lg max-w-3xl">
              AIを活用して、指定したトピックに関する問題を自動生成します。
            </p>
          </div>
        </div>
        
        <div className="glass-card rounded-2xl shadow-xl overflow-hidden animate-in delay-200">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              {questions.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">生成されたクイズ</h2>
                  </div>
                  <QuizDisplay questions={questions} onReset={resetQuiz} />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">新しいクイズを作成</h2>
                  </div>
                  <QuizGenerator onQuizGenerated={handleQuizGenerated} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}