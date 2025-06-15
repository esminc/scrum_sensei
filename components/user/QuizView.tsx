'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { QuizResult, AnswerDetail, UserProgress } from '@/lib/models/progress';
import { Quiz, QuizQuestion } from '@/lib/models/quiz';
import { ArrowDown, ArrowUp, CheckCircle, HelpCircle, Timer, XCircle } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface QuizViewProps {
  quiz: Quiz;
  userId: string;
  contentId?: string;
  onComplete?: (result: QuizResult) => void;
}

export function QuizView({ quiz, userId, contentId, onComplete }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz?.timeLimit ?? 0);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedExplanations, setExpandedExplanations] = useState<string[]>([]);
  // 個別の問題に対応する経過時間を記録
  const [questionTimeSpent, setQuestionTimeSpent] = useState<Record<string, number>>({});
  // 復習モードの状態
  const [isReviewMode, setIsReviewMode] = useState(false);
  // 復習対象の問題ID一覧
  const [reviewQuestions, setReviewQuestions] = useState<string[]>([]);
  // 結果保存状態
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // 現在の問題
  const currentQuestion = isReviewMode && reviewQuestions.length > 0
    ? quiz.questions.find(q => q.id === reviewQuestions[currentQuestionIndex])
    : quiz.questions[currentQuestionIndex];
  
  // 解答が正解かチェック
  const isAnswerCorrect = (question: QuizQuestion, answer: string | string[] | undefined): boolean => {
    if (!answer) return false;
    
    switch(question.type) {
      case 'multiple-choice':
        if (typeof answer === 'string') {
          const option = question.options?.find(opt => opt.id === answer);
          return option?.isCorrect || false;
        }
        return false;
        
      case 'multiple-select':
        if (Array.isArray(answer) && Array.isArray(question.options)) {
          const correctOptionIds = question.options
            .filter(opt => opt.isCorrect)
            .map(opt => opt.id);
          
          // 選択された全ての選択肢が正解で、かつ正解の選択肢がすべて選ばれているか確認
          return correctOptionIds.length === answer.length && 
            correctOptionIds.every(id => answer.includes(id)) &&
            answer.every(id => correctOptionIds.includes(id));
        }
        return false;
        
      case 'short-answer':
        // 短答式の場合、部分一致でもOK
        if (typeof answer === 'string' && question.correctAnswer) {
          return answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        }
        return false;
        
      default:
        return false;
    }
  };
  
  // クイズ結果を保存
  const saveQuizResult = async (result: QuizResult) => {
    if (!progress || !contentId) {
      console.error('進捗データまたはコンテンツIDがありません');
      return;
    }
    
    try {
      setIsSaving(true);
      setIsSaved(false);
      
      console.log('保存処理を開始します...');
      console.log('保存するデータ:', JSON.stringify({quizResult: result}));
      
      // 進捗を更新（明示的にfetchとJSON.stringifyを使用）
      const response = await fetch(`/scrum_sensei/api/user/progress?id=${progress.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ quizResult: result })
      });
      
      console.log('API応答ステータス:', response.status);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('API応答データ:', responseData);
      
      setIsSaved(true);
      console.log('保存が完了しました');
    } catch (error) {
      console.error('クイズ結果の保存に失敗しました:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // クイズを終了して結果を表示
  const finishQuiz = useCallback(() => {
    // 採点
    let correctCount = 0;
    let totalPoints = 0;
    
    // すべての問題に対する回答詳細を記録
    const answerDetails: AnswerDetail[] = [];
    
    // 評価する問題リスト
    const questionsToEvaluate = isReviewMode 
      ? quiz.questions.filter(q => reviewQuestions.includes(q.id))
      : quiz.questions;
    
    questionsToEvaluate.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = isAnswerCorrect(question, userAnswer);
      
      if (isCorrect) {
        correctCount++;
        totalPoints += question.points;
      }

      // 回答詳細を追加
      answerDetails.push({
        questionId: question.id,
        userAnswer: userAnswer || '',
        isCorrect,
        timeSpent: questionTimeSpent[question.id] || 0
      });
    });
    
    // スコア計算（100点満点）
    const maxPoints = questionsToEvaluate.reduce((sum, q) => sum + q.points, 0);
    const scorePercentage = Math.round((totalPoints / maxPoints) * 100);
    
    // 結果オブジェクト作成
    const result: QuizResult = {
      quizId: quiz.id,
      score: scorePercentage,
      totalQuestions: questionsToEvaluate.length,
      correctAnswers: correctCount,
      completedAt: new Date().toISOString(),
      timeSpent: timeSpent,
      answers: answerDetails,
      isReviewMode: isReviewMode // 復習モードかどうかを記録
    };
    
    setQuizResult(result);
    setQuizCompleted(true);
    
    // コールバックを呼び出す
    if (onComplete) {
      onComplete(result);
    }
    
    // 自動保存を行わない（ボタン押下時に保存する）
    // 既存のコードを削除
    
  }, [quiz, answers, timeSpent, onComplete, questionTimeSpent, isReviewMode, reviewQuestions]);
  
  // タイマー処理
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
      
      // 現在の問題の経過時間も更新
      if (!quizCompleted && currentQuestion) {
        setQuestionTimeSpent(prev => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1
        }));
      }
      
      // 制限時間が設定されている場合
      if (quiz?.timeLimit && !quizCompleted && !isReviewMode) {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // 時間切れで強制終了
            clearInterval(timer);
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz?.timeLimit, quizCompleted, finishQuiz, currentQuestion, isReviewMode]);
  
  // 新しい進捗データを作成
  const createNewProgress = useCallback(async () => {
    if (!userId || !contentId) {
      console.error('新規進捗データの作成に必要な情報がありません: userId または contentId が未指定');
      return;
    }

    try {
      console.log('新規進捗データを作成します');
      // APIクライアントをインポート
      const { post } = await import('@/lib/api/client');
      
      // APIクライアントを使用してデータを作成
      const data = await post('user/progress', { userId, contentId });
      console.log('作成された進捗データ:', data);
      
      if (data && data.id) {
        setProgress(data);
        console.log('新規進捗データをセットしました');
      }
    } catch (error) {
      console.error('進捗データの作成に失敗しました:', error);
    }
  }, [userId, contentId]);
  
  // 進捗データのロード
  useEffect(() => {
    const loadProgress = async () => {
      if (!contentId) {
        console.warn('contentId が指定されていません');
        setLoading(false);
        return;
      }

      console.log(`進捗データを読み込みます: userId=${userId}, contentId=${contentId}`);
      
      try {
        const res = await fetch(`/scrum_sensei/api/user/progress?userId=${userId}&contentId=${contentId}`);
        
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('取得した進捗データ:', data);
        
        if (data && data.id) {
          setProgress(data);
          console.log('進捗データをセットしました');
          
          // 過去のクイズ結果があれば取得
          if (data.quizResults) {
            const prevResult = data.quizResults.find(
              (result: QuizResult) => result.quizId === quiz.id
            );
            if (prevResult) {
              setQuizResult(prevResult);
              console.log('過去のクイズ結果を見つけました');
            }
          }
        } else {
          // 進捗データが存在しない場合は新規作成
          console.log('進捗データが存在しないため、作成します');
          await createNewProgress();
        }
      } catch (error) {
        console.error('進捗データの取得に失敗しました:', error);
        // エラー発生時も進捗データの作成を試みる
        await createNewProgress();
      } finally {
        setLoading(false);
      }
    };
    
    loadProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, contentId, quiz.id]);

  // 回答を記録
  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // 次の問題へ
  const nextQuestion = () => {
    const questionsCount = isReviewMode ? reviewQuestions.length : quiz.questions.length;
    if (currentQuestionIndex < questionsCount - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // 前の問題へ
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // 時間を表示用にフォーマット
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // 解説の展開/折りたたみ
  const toggleExplanation = (questionId: string) => {
    setExpandedExplanations(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // 復習モードの開始
  const startReviewMode = () => {
    if (!quizResult || !quizResult.answers) return;
    
    // 間違えた問題のIDを抽出
    const incorrectQuestionIds = quizResult.answers
      .filter(answer => !answer.isCorrect)
      .map(answer => answer.questionId);
    
    if (incorrectQuestionIds.length === 0) {
      // すべて正解の場合は、全問題を対象にする
      setReviewQuestions(quiz.questions.map(q => q.id));
    } else {
      setReviewQuestions(incorrectQuestionIds);
    }
    
    // 復習モード開始
    setIsReviewMode(true);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setTimeSpent(0);
    setQuestionTimeSpent({});
    setAnswers({});
  };

  // 通常モードのリスタート
  const restartNormalMode = () => {
    // 通常モードに戻す
    setIsReviewMode(false);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setTimeSpent(0);
    setTimeLeft(quiz?.timeLimit ?? 0);
    setQuestionTimeSpent({});
    setAnswers({});
  };

  // 問題表示
  const renderQuestion = () => {
    if (!currentQuestion) return null;
    
    // 処理する問題の総数
    const questionsCount = isReviewMode ? reviewQuestions.length : quiz.questions.length;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              問題 {currentQuestionIndex + 1}/{questionsCount}
            </div>
            {isReviewMode && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                復習モード
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm flex items-center">
              <Timer className="h-4 w-4 mr-1 inline" />
              <span>{formatTime(timeSpent)}</span>
            </div>
            {(quiz?.timeLimit ?? 0) > 0 && !isReviewMode && (
              <div className="text-sm flex items-center">
                <Timer className="h-4 w-4 mr-1 inline" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>

        <Card className="p-6 mb-4">
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
          {renderAnswerOptions()}
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            前の問題
          </Button>

          {currentQuestionIndex < questionsCount - 1 ? (
            <Button onClick={nextQuestion}>次の問題</Button>
          ) : (
            <Button onClick={finishQuiz}>完了</Button>
          )}
        </div>
      </div>
    );
  };

  // 回答オプションを表示
  const renderAnswerOptions = () => {
    if (!currentQuestion) return null;
    
    const question = currentQuestion;
    const userAnswer = answers[question.id];
    
    switch(question.type) {
      case 'multiple-choice':
        return (
          <RadioGroup
            value={userAnswer as string}
            onValueChange={(value) => handleAnswer(question.id, value)}
          >
            <div className="space-y-3">
              {question.options?.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <label htmlFor={option.id} className="text-sm font-medium">
                    {option.text}
                  </label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );
        
      case 'multiple-select':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const isChecked = Array.isArray(userAnswer) && userAnswer.includes(option.id);
              return (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const newValue = Array.isArray(userAnswer) ? [...userAnswer] : [];
                      if (checked) {
                        newValue.push(option.id);
                      } else {
                        const index = newValue.indexOf(option.id);
                        if (index !== -1) {
                          newValue.splice(index, 1);
                        }
                      }
                      handleAnswer(question.id, newValue);
                    }}
                  />
                  <label htmlFor={option.id} className="text-sm font-medium">
                    {option.text}
                  </label>
                </div>
              );
            })}
          </div>
        );
        
      case 'short-answer':
        return (
          <Input
            placeholder="回答を入力してください"
            value={userAnswer as string || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
          />
        );
        
      default:
        return <div>不明な問題タイプです</div>;
    }
  };

  // 結果画面での解説表示
  const renderExplanations = () => {
    if (!quizCompleted && !quizResult) return null;
    
    // 表示する問題（通常モード：全問題、復習モード完了時：復習した問題のみ）
    const questionsToShow = quizCompleted && isReviewMode 
      ? quiz.questions.filter(q => reviewQuestions.includes(q.id))
      : quiz.questions;
    
    return (
      <div className="space-y-4 my-6">
        <h3 className="text-lg font-semibold">各問題の詳細</h3>
        {questionsToShow.map(question => {
          const userAnswer = answers[question.id] || 
            (quizResult?.answers?.find(a => a.questionId === question.id)?.userAnswer);
          
          // 正誤判定
          let isCorrect = false;
          if (quizResult?.answers && !quizCompleted) {
            // 過去の結果から正誤を取得
            const answerDetail = quizResult.answers.find(a => a.questionId === question.id);
            isCorrect = answerDetail?.isCorrect || false;
          } else {
            // 現在の回答から正誤を判定
            isCorrect = isAnswerCorrect(question, userAnswer);
          }
          
          const isExpanded = expandedExplanations.includes(question.id);
          
          return (
            <Card key={question.id} className={`p-4 border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className="font-medium">{question.question}</span>
                  </div>
                  
                  <div className="mt-2 ml-7 text-sm">
                    {question.type === 'multiple-choice' && (
                      <div>
                        <p>あなたの回答: {
                          question.options?.find(opt => opt.id === userAnswer)?.text || '未回答'
                        }</p>
                        <p>正解: {
                          question.options?.find(opt => opt.isCorrect)?.text
                        }</p>
                      </div>
                    )}
                    
                    {question.type === 'multiple-select' && (
                      <div>
                        <p>あなたの回答: {
                          Array.isArray(userAnswer) 
                            ? question.options
                                ?.filter(opt => userAnswer.includes(opt.id))
                                .map(opt => opt.text)
                                .join(', ') || '未回答'
                            : '未回答'
                        }</p>
                        <p>正解: {
                          question.options
                            ?.filter(opt => opt.isCorrect)
                            .map(opt => opt.text)
                            .join(', ')
                        }</p>
                      </div>
                    )}
                    
                    {question.type === 'short-answer' && (
                      <div>
                        <p>あなたの回答: {userAnswer as string || '未回答'}</p>
                        <p>正解: {question.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExplanation(question.id)}
                >
                  {isExpanded ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {isExpanded && question.explanation && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <h4 className="text-sm font-semibold mb-1">解説:</h4>
                  <p className="text-sm text-muted-foreground">{question.explanation}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  // 保存ボタン用のイベントハンドラ
  const handleSaveResult = async () => {
    console.log('保存ボタンがクリックされました');
    console.log('QuizResult:', quizResult);
    console.log('Progress:', progress);
    
    if (!quizResult) {
      console.error('クイズ結果がありません');
      return;
    }
    
    if (isSaving || isSaved) {
      console.log('すでに保存中または保存済みです');
      return;
    }

    if (!progress || !contentId) {
      console.log('進捗データがない、または作成されていないため、新規作成します');
      await createNewProgress();
      if (!progress) {
        console.error('進捗データの作成に失敗しました');
        return;
      }
    }
    
    // 保存処理を実行
    saveQuizResult(quizResult);
  };

  // 結果表示
  const renderResult = () => {
    if (!quizResult) return null;

    const isPassed = quiz.passingScore ? quizResult.score >= quiz.passingScore : quizResult.score >= 60;
    
    // 間違えた問題の数
    const incorrectCount = quizResult.totalQuestions - quizResult.correctAnswers;
    const hasIncorrectQuestions = incorrectCount > 0;
    
    return (
      <div className="space-y-6">
        <Card className={`p-6 border-t-8 ${isPassed ? 'border-t-green-500' : 'border-t-amber-500'}`}>
          <h2 className="text-2xl font-bold text-center mb-6">
            {isReviewMode ? '復習完了！' : isPassed ? 'クリア！' : 'もう少し！'}
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">スコア</p>
              <p className="text-3xl font-bold">{quizResult.score}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">正解数</p>
              <p className="text-3xl font-bold">{quizResult.correctAnswers}/{quizResult.totalQuestions}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>進捗</span>
              <span>{quizResult.score}%</span>
            </div>
            <Progress value={quizResult.score} className="h-2" />
            {quiz.passingScore && (
              <div className="text-xs text-muted-foreground mt-1 text-right">
                合格ライン: {quiz.passingScore}%
              </div>
            )}
          </div>
          
          <div className="flex justify-between text-sm">
            <div>
              <Timer className="inline-block h-4 w-4 mr-1" />
              所要時間: {formatTime(quizResult.timeSpent)}
            </div>
            <div>
              完了日時: {new Date(quizResult.completedAt).toLocaleString()}
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleSaveResult} 
              disabled={isSaving || isSaved}
              className={`w-full max-w-xs ${isSaved ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {isSaving ? '保存中...' : isSaved ? '保存済み' : '結果を保存する'}
            </Button>
          </div>
        </Card>

        {renderExplanations()}
        
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {isReviewMode ? (
            <>
              <Button variant="outline" onClick={restartNormalMode}>
                通常モードで解き直す
              </Button>
              
              <Button onClick={() => startReviewMode()}>
                復習をもう一度
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={restartNormalMode}>
                もう一度挑戦する
              </Button>
              
              {hasIncorrectQuestions && (
                <Button onClick={() => startReviewMode()}>
                  間違えた問題を復習する
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-4 text-muted-foreground">ロード中...</p>
      </div>
    );
  }

  // 過去の結果がある場合は表示する
  if (!quizCompleted && quizResult && !isReviewMode) {
    // 間違えた問題の数
    const incorrectCount = quizResult.totalQuestions - quizResult.correctAnswers;
    const hasIncorrectQuestions = incorrectCount > 0;
    
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">前回の結果</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">スコア</p>
              <p className="text-2xl font-bold">{quizResult.score}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">正解数</p>
              <p className="text-2xl font-bold">{quizResult.correctAnswers}/{quizResult.totalQuestions}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
            <p className="text-sm">
              {new Date(quizResult.completedAt).toLocaleDateString()}に完了
            </p>
            <div className="flex gap-2">
              {hasIncorrectQuestions && (
                <Button 
                  variant="outline" 
                  onClick={() => startReviewMode()}
                >
                  間違えた問題のみ復習
                </Button>
              )}
              <Button onClick={() => setQuizCompleted(false)}>再チャレンジ</Button>
            </div>
          </div>
        </Card>
        
        {renderExplanations()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isReviewMode && reviewQuestions.length === 0 && (
        <Alert>
          <HelpCircle className="h-5 w-5" />
          <AlertTitle>復習対象の問題がありません</AlertTitle>
          <AlertDescription>
            前回は全問正解でした！おめでとうございます。
          </AlertDescription>
        </Alert>
      )}
    
      {isReviewMode && reviewQuestions.length > 0 && (
        <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          <HelpCircle className="h-5 w-5" />
          <AlertTitle>復習モード</AlertTitle>
          <AlertDescription>
            前回間違えた{reviewQuestions.length}問を復習しています
          </AlertDescription>
        </Alert>
      )}
      
      {!quizCompleted ? (
        renderQuestion()
      ) : (
        renderResult()
      )}
    </div>
  );
}