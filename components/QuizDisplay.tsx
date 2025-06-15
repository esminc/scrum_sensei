'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import quizRepository from '@/lib/quizRepository';
import { useRouter } from 'next/navigation';
import { QuizQuestion } from '@/lib/models/quiz';

type QuizDisplayProps = {
  questions: QuizQuestion[];
  onReset: () => void;
};

export default function QuizDisplay({ questions, onReset }: QuizDisplayProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [processedQuestions, setProcessedQuestions] = useState<QuizQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'quiz'>('overview');
  // 保存関連の状態
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);

  // 問題データを処理して、必要な形式に変換する
  useEffect(() => {
    if (questions && questions.length > 0) {
      const processed = questions.map((q, index) => {
        // 必須フィールドが欠けている場合は補完
        const question: QuizQuestion = {
          id: q.id || `question_${index}`,
          question: q.question || `問題 ${index + 1}`,
          type: q.type || 'multiple-choice',
          explanation: q.explanation || '',
          points: 1,
          difficulty: q.difficulty || 'intermediate',
        };

        // 選択肢の処理
        if (q.options && Array.isArray(q.options)) {
          question.options = q.options.map((opt, optIndex) => ({
            id: opt.id || `q${index}_opt${optIndex}`,
            text: opt.text || `選択肢 ${optIndex + 1}`,
            isCorrect: !!opt.isCorrect
          }));
        }

        // 正答が別フィールドに入っている場合の対応
        if (q.correctAnswer && !q.options?.some(o => o.isCorrect)) {
          question.correctAnswer = q.correctAnswer;
        }

        return question;
      });
      setProcessedQuestions(processed);
    }
  }, [questions]);
  
  const currentQuestion = processedQuestions[currentQuestionIndex];
  
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: answer,
    });
  };
  
  const isLastQuestion = currentQuestionIndex === processedQuestions.length - 1;
  
  const nextQuestion = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const prevQuestion = () => {
    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
  };
  
  const startQuiz = () => {
    setActiveTab('quiz');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  // 正解のテキストを取得する関数
  const getCorrectAnswerText = (question: QuizQuestion) => {
    if (question.type === 'multiple-choice' || question.type === 'true-false') {
      if (question.options && question.options.length > 0) {
        const correctOption = question.options.find(option => option.isCorrect);
        return correctOption?.text || '';
      }
    }
    return question.correctAnswer || '';
  };
  
  // クイズを保存する関数
  const saveQuiz = async () => {
    if (isSaving) return;
    
    // タイトルチェック
    if (!quizTitle.trim()) {
      setSaveMessage({
        type: 'error',
        text: '問題集タイトルを入力してください'
      });
      return;
    }
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // 問題データをAPI経由で保存
      const result = await quizRepository.createQuiz({
        title: quizTitle,
        description: `${quizTitle}に関する問題集`,
        questions: processedQuestions.map(q => ({
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty || 'intermediate'
        }))
      });
      
      // 保存成功
      setSaveMessage({
        type: 'success',
        text: '問題を保存しました！'
      });
      
      setSavedQuizId(result.id);
    } catch (error) {
      console.error('問題保存エラー:', error);
      setSaveMessage({
        type: 'error',
        text: '問題の保存に失敗しました'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // 保存した問題の一覧ページへ移動
  const navigateToQuizList = () => {
    router.push('/user/dashboard');
  };

  if (!processedQuestions.length) {
    return (
      <Card className="p-6 shadow-lg">
        <Alert>
          <AlertDescription>問題が見つかりません。</AlertDescription>
        </Alert>
        <Button onClick={onReset} className="mt-4">
          戻る
        </Button>
      </Card>
    );
  }
  
  if (showResults) {
    const correctAnswers = processedQuestions.filter((q) => {
      if (q.type === 'multiple-choice' || q.type === 'true-false') {
        if (q.options && q.options.length > 0) {
          const selectedAnswer = selectedAnswers[q.id];
          const correctOption = q.options.find(option => option.isCorrect);
          return selectedAnswer === correctOption?.id;
        } else if (q.correctAnswer) {
          return selectedAnswers[q.id] === q.correctAnswer;
        }
      } else if (q.correctAnswer) {
        return selectedAnswers[q.id] === q.correctAnswer;
      }
      return false;
    }).length;
    
    return (
      <Card className="p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">結果</h2>
        <p className="text-xl mb-6">
          {processedQuestions.length}問中 {correctAnswers}問 正解
        </p>
        
        {processedQuestions.map((q, idx) => {
          const selectedAnswer = selectedAnswers[q.id];
          let correctAnswerText = '';
          let isCorrect = false;
          
          if ((q.type === 'multiple-choice' || q.type === 'true-false') && q.options && q.options.length > 0) {
            const correctOption = q.options.find(option => option.isCorrect);
            correctAnswerText = correctOption?.text || '';
            isCorrect = selectedAnswer === correctOption?.id;
          } else if (q.correctAnswer) {
            correctAnswerText = q.correctAnswer;
            isCorrect = selectedAnswer === q.correctAnswer;
          }
          
          const selectedText = (q.type === 'multiple-choice' || q.type === 'true-false') && q.options
            ? q.options.find(opt => opt.id === selectedAnswer)?.text
            : selectedAnswer;
          
          return (
            <div key={q.id} className="mb-6 p-4 border rounded">
              <h3 className="font-bold">{idx + 1}. {q.question}</h3>
              <div className="mt-2">
                <span className="font-medium">あなたの回答:</span> {selectedText || '未回答'}
              </div>
              <div className="mt-1">
                <span className="font-medium">正解:</span> {correctAnswerText}
              </div>
              <div className={`mt-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? '○ 正解' : '× 不正解'}
              </div>
              {q.explanation && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="font-medium">解説:</p>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
        
        <Button onClick={onReset} className="mt-4">
          新しい問題を生成する
        </Button>
      </Card>
    );
  }
  
  // 問題一覧表示と問題解答モードの切り替え
  return (
    <Card className="p-6 shadow-lg">
      {/* タイトル入力欄と保存ボタン */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
          <div className="flex-1">
            <Label htmlFor="quiz-title" className="mb-2 block">問題集タイトル</Label>
            <Input
              id="quiz-title"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="保存する問題集のタイトルを入力"
              className="w-full"
            />
          </div>
          <Button 
            onClick={saveQuiz} 
            disabled={isSaving || !quizTitle.trim()} 
            className="whitespace-nowrap"
          >
            {isSaving ? '問題を保存中...' : 'この問題集を保存する'}
          </Button>
        </div>
        
        {/* 保存メッセージ表示 */}
        {saveMessage && (
          <Alert className={saveMessage.type === 'success' ? 'bg-green-50 text-green-900 border-green-200' : 'bg-red-50 text-red-900 border-red-200'}>
            <AlertDescription>
              {saveMessage.text}
              {saveMessage.type === 'success' && savedQuizId && (
                <Button
                  variant="link"
                  onClick={navigateToQuizList}
                  className="ml-2 p-0 h-auto"
                >
                  保存した問題を見る →
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'overview' | 'quiz')}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="overview" className="flex-1">問題一覧</TabsTrigger>
          <TabsTrigger value="quiz" className="flex-1">問題解答モード</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">問題一覧</h2>
            <Button onClick={startQuiz}>問題に挑戦する</Button>
          </div>
          
          <div className="space-y-6">
            {processedQuestions.map((question, idx) => (
              <div key={question.id} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">問題 {idx + 1}</h3>
                  <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                    難易度: {question.difficulty || '中級'}
                  </span>
                </div>
                
                <p className="mb-4">{question.question}</p>
                
                {(question.type === 'multiple-choice' || question.type === 'true-false') && 
                 question.options && question.options.length > 0 ? (
                  <div className="ml-4 mb-4">
                    <p className="font-medium mb-2">選択肢:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      {question.options.map((option) => (
                        <li key={option.id} className={option.isCorrect ? 'font-medium text-green-600' : ''}>
                          {option.text} {option.isCorrect && '(正解)'}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="ml-4 mb-4">
                    <p className="font-medium mb-2">正解:</p>
                    <p>{getCorrectAnswerText(question)}</p>
                  </div>
                )}
                
                {question.explanation && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p className="font-medium mb-1">解説:</p>
                    <p className="text-sm">{question.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button onClick={onReset} variant="outline">戻る</Button>
            <Button onClick={startQuiz}>問題に挑戦する</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="quiz">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">問題 {currentQuestionIndex + 1}/{processedQuestions.length}</h2>
            <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
              難易度: {currentQuestion.difficulty || '中級'}
            </span>
          </div>
          
          <div className="mb-6">
            <p className="text-lg mb-4">{currentQuestion.question}</p>
            
            {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') && 
             currentQuestion.options && currentQuestion.options.length > 0 ? (
              <RadioGroup
                value={selectedAnswers[currentQuestion.id] || ''}
                onValueChange={handleAnswerSelect}
                className="space-y-2"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                    <Label htmlFor={`option-${option.id}`}>{option.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p className="text-sm text-gray-500">
                ※この問題は記述式または選択肢がありません。答えを考えてから「次へ」を押してください。
              </p>
            )}
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              前へ
            </Button>
            <Button onClick={nextQuestion}>
              {isLastQuestion ? '結果を見る' : '次へ'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}