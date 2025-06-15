'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UserNav from '@/components/user/UserNav';
import DevelopmentBanner from '@/components/ui/DevelopmentBanner';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProgress } from '@/lib/models/progress';
import { Content } from '@/lib/models/content';
import { BarChart, CheckCircle, Clock, FileText, FileQuestion, Star, Zap, Award, BookOpen, LineChart, Target, TrendingUp, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// レンダリング用のタイプ定義
interface QuestionTypeStats {
  type: string;
  totalAnswered: number;
  correctAnswers: number;
  averageTime: number; // 秒単位
  percentage: number;
}

// 難易度ごとの正解率
interface DifficultyStats {
  difficulty: string;
  totalAnswered: number;
  correctAnswers: number;
  percentage: number;
}

// 時系列データ
interface TimeSeriesData {
  date: string;
  score: number;
  correctCount: number;
  totalCount: number;
}

// 弱点分野データ
interface WeaknessArea {
  name: string;
  correctRate: number;
  questionCount: number;
  lastAttempted: string;
}

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [questionTypeStats, setQuestionTypeStats] = useState<QuestionTypeStats[]>([]);
  const [difficultyStats, setDifficultyStats] = useState<DifficultyStats[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [weaknessAreas, setWeaknessAreas] = useState<WeaknessArea[]>([]);
  
  // モックユーザーID
  const mockUserId = 'user-1';

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 進捗データを取得
        const { getApiPath } = await import('@/lib/apiUtils');
        const progressRes = await fetch(getApiPath(`user/progress?userId=${mockUserId}`));
        const progressData = await progressRes.json();
        
        if (progressData.progress && Array.isArray(progressData.progress)) {
          setProgress(progressData.progress);
        }
        
        // コンテンツデータを取得
        const contentsRes = await fetch(getApiPath('user/content'));
        const contentsData = await contentsRes.json();
        
        if (contentsData.contents && Array.isArray(contentsData.contents)) {
          setContents(contentsData.contents);
        }
        
        // 問題タイプ統計の計算
        calculateQuestionTypeStats(progressData.progress || []);
        calculateDifficultyStats(progressData.progress || [], contentsData.contents || []);
        
        // 時系列データと弱点分析の計算
        calculateTimeSeriesData(progressData.progress || []);
        calculateWeaknessAreas(progressData.progress || [], contentsData.contents || []);
        
      } catch (err) {
        console.error('データの取得に失敗しました:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // 問題タイプごとの統計を計算
  const calculateQuestionTypeStats = (progressData: UserProgress[]) => {
    const stats: Record<string, { correct: number; total: number; time: number }> = {
      'multiple-choice': { correct: 0, total: 0, time: 0 },
      'multiple-select': { correct: 0, total: 0, time: 0 },
      'short-answer': { correct: 0, total: 0, time: 0 }
    };
    
    // すべての進捗から問題タイプごとの統計を集計
    progressData.forEach(progress => {
      progress.quizResults?.forEach(result => {
        result.answers?.forEach(answer => {
          // TODO: 実際の問題のタイプを取得する処理を追加
          // 現在はモックデータでシミュレーション
          
          const questionType = answer.questionId.includes('multiple-choice') 
            ? 'multiple-choice'
            : answer.questionId.includes('multiple-select')
              ? 'multiple-select'
              : 'short-answer';
          
          if (!stats[questionType]) {
            stats[questionType] = { correct: 0, total: 0, time: 0 };
          }
          
          stats[questionType].total += 1;
          if (answer.isCorrect) {
            stats[questionType].correct += 1;
          }
          stats[questionType].time += answer.timeSpent || 0;
        });
      });
    });
    
    // 表示用の配列に変換
    const typesDisplay: QuestionTypeStats[] = Object.entries(stats).map(([type, data]) => ({
      type,
      totalAnswered: data.total,
      correctAnswers: data.correct,
      averageTime: data.total > 0 ? Math.round(data.time / data.total) : 0,
      percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
    }));
    
    setQuestionTypeStats(typesDisplay);
  };
  
  // 難易度ごとの統計を計算
  const calculateDifficultyStats = (progressData: UserProgress[], contentsData: Content[]) => {
    const stats: Record<string, { correct: number; total: number }> = {
      '初級': { correct: 0, total: 0 },
      '中級': { correct: 0, total: 0 },
      '上級': { correct: 0, total: 0 }
    };
    
    // すべての進捗から難易度ごとの統計を集計
    progressData.forEach(progress => {
      const content = contentsData.find(c => c.id === progress.contentId);
      const difficulty = content?.difficulty || '不明';
      
      progress.quizResults?.forEach(result => {
        result.answers?.forEach(answer => {
          if (!stats[difficulty]) {
            stats[difficulty] = { correct: 0, total: 0 };
          }
          
          stats[difficulty].total += 1;
          if (answer.isCorrect) {
            stats[difficulty].correct += 1;
          }
        });
      });
    });
    
    // 表示用の配列に変換
    const diffDisplay: DifficultyStats[] = Object.entries(stats)
      .map(([difficulty, data]) => ({
        difficulty,
        totalAnswered: data.total,
        correctAnswers: data.correct,
        percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
      }))
      .filter(item => item.totalAnswered > 0); // 回答がある難易度のみ表示
    
    setDifficultyStats(diffDisplay);
  };

  // 時系列データを計算
  const calculateTimeSeriesData = (progressData: UserProgress[]) => {
    // 日付ごとのデータを集計
    const dataByDate: Record<string, {
      scores: number[];
      correctCounts: number;
      totalCounts: number;
    }> = {};
    
    progressData.forEach(progress => {
      progress.quizResults?.forEach(result => {
        const date = new Date(result.completedAt).toISOString().split('T')[0];
        
        if (!dataByDate[date]) {
          dataByDate[date] = { scores: [], correctCounts: 0, totalCounts: 0 };
        }
        
        dataByDate[date].scores.push(result.score);
        dataByDate[date].correctCounts += result.correctAnswers;
        dataByDate[date].totalCounts += result.totalQuestions;
      });
    });
    
    // 日付順に並べ替え
    const sortedData = Object.entries(dataByDate)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, data]) => ({
        date,
        score: Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length),
        correctCount: data.correctCounts,
        totalCount: data.totalCounts
      }));
    
    setTimeSeriesData(sortedData);
  };
  
  // 弱点分野を計算
  const calculateWeaknessAreas = (progressData: UserProgress[], contentsData: Content[]) => {
    // タグ/カテゴリごとの集計
    const statsByTag: Record<string, {
      correct: number;
      total: number;
      lastAttempted: string;
    }> = {};
    
    progressData.forEach(progress => {
      const content = contentsData.find(c => c.id === progress.contentId);
      const tags = content?.tags || [];
      
      progress.quizResults?.forEach(result => {
        const completedAt = result.completedAt;
        
        // タグごとに集計
        tags.forEach(tag => {
          if (!statsByTag[tag]) {
            statsByTag[tag] = { correct: 0, total: 0, lastAttempted: completedAt };
          }
          
          statsByTag[tag].correct += result.correctAnswers;
          statsByTag[tag].total += result.totalQuestions;
          
          // 最新の挑戦日を更新
          if (new Date(completedAt) > new Date(statsByTag[tag].lastAttempted)) {
            statsByTag[tag].lastAttempted = completedAt;
          }
        });
      });
    });
    
    // 弱点分野を特定（正解率が60%未満のものを抽出）
    const weakAreas: WeaknessArea[] = Object.entries(statsByTag)
      .map(([name, data]) => ({
        name,
        correctRate: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        questionCount: data.total,
        lastAttempted: data.lastAttempted
      }))
      .filter(area => area.correctRate < 60 && area.questionCount >= 5)
      .sort((a, b) => a.correctRate - b.correctRate);
    
    setWeaknessAreas(weakAreas);
  };

  // 総学習時間を計算
  const getTotalLearningTime = () => {
    let totalSeconds = 0;
    
    progress.forEach(p => {
      // コンテンツ閲覧時間
      totalSeconds += p.timeSpent || 0;
      
      // クイズ解答時間
      p.quizResults?.forEach(result => {
        totalSeconds += result.timeSpent || 0;
      });
    });
    
    return formatTime(totalSeconds);
  };
  
  // 時間をフォーマット（時間、分、秒）
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    let result = '';
    if (hours > 0) result += `${hours}時間 `;
    if (minutes > 0 || hours > 0) result += `${minutes}分 `;
    result += `${remainingSeconds}秒`;
    
    return result;
  };
  
  // 短い時間形式（分:秒）
  const formatShortTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };
  
  // 平均スコアを計算
  const getAverageScore = () => {
    let totalScore = 0;
    let quizCount = 0;
    
    progress.forEach(p => {
      p.quizResults?.forEach(result => {
        totalScore += result.score;
        quizCount++;
      });
    });
    
    return quizCount > 0 ? Math.round(totalScore / quizCount) : 0;
  };

  // 合計正答数を計算
  const getTotalCorrectAnswers = () => {
    let correctAnswers = 0;
    
    progress.forEach(p => {
      p.quizResults?.forEach(result => {
        correctAnswers += result.correctAnswers;
      });
    });
    
    return correctAnswers;
  };
  
  // 合計回答数を計算
  const getTotalQuestions = () => {
    let totalQuestions = 0;
    
    progress.forEach(p => {
      p.quizResults?.forEach(result => {
        totalQuestions += result.totalQuestions;
      });
    });
    
    return totalQuestions;
  };
  
  // 総合正解率
  const getOverallAccuracy = () => {
    const totalQuestions = getTotalQuestions();
    const correctAnswers = getTotalCorrectAnswers();
    
    return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  };
  
  // 完了したコンテンツ数
  const getCompletedContents = () => {
    return progress.filter(p => p.completionPercentage === 100).length;
  };
  
  // 進行中のコンテンツ数
  const getInProgressContents = () => {
    return progress.filter(p => p.completionPercentage < 100).length;
  };
  
  // 総合学習進捗率
  const getOverallProgress = () => {
    const totalContents = contents.length;
    const completedContents = getCompletedContents();
    
    return totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;
  };
  
  // 問題タイプを表示用にフォーマット
  const formatQuestionType = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return '単一選択問題';
      case 'multiple-select':
        return '複数選択問題';
      case 'short-answer':
        return '記述問題';
      default:
        return type;
    }
  };
  
  // 問題タイプのアイコンを取得
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return <CheckCircle className="h-5 w-5" />;
      case 'multiple-select':
        return <FileText className="h-5 w-5" />;
      case 'short-answer':
        return <BookOpen className="h-5 w-5" />;
      default:
        return <FileQuestion className="h-5 w-5" />;
    }
  };
  
  // 正解率によるカラークラスの取得
  const getAccuracyColorClass = (percentage: number) => {
    if (percentage >= 80) {
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        progress: 'bg-green-500'
      };
    } else if (percentage >= 60) {
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-800 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        progress: 'bg-amber-500'
      };
    } else {
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        progress: 'bg-red-500'
      };
    }
  };
  
  // 時系列グラフの描画（シンプルな実装）
  const renderTimeSeriesGraph = () => {
    if (timeSeriesData.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          データが不足しています。もっと問題を解いてグラフを表示しましょう。
        </div>
      );
    }
    
    const maxScore = 100;
    const height = 150;
    const width = timeSeriesData.length * 50;
    
    return (
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${Math.max(width, 300)}px` }}>
          {/* 棒グラフの代わりにシンプルなコンポーネントで実装 */}
          <div className="relative h-[150px] mt-8">
            {/* スコアラインのレンダリング */}
            <div className="absolute top-0 w-full h-full flex items-end">
              {timeSeriesData.map((item, index) => (
                <div 
                  key={index}
                  className="relative flex-1 mx-1"
                >
                  <div 
                    className={`${getAccuracyColorClass(item.score).bg} ${getAccuracyColorClass(item.score).border} border rounded`}
                    style={{ 
                      height: `${(item.score / maxScore) * height}px`,
                    }}
                    title={`${item.score}%`}
                  ></div>
                  <div className="text-xs text-center mt-2 text-muted-foreground transform -rotate-45 origin-top-left">
                    {new Date(item.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Y軸の目盛り */}
            <div className="absolute top-0 left-0 h-full flex flex-col justify-between">
              <div className="text-xs text-muted-foreground">100%</div>
              <div className="text-xs text-muted-foreground">50%</div>
              <div className="text-xs text-muted-foreground">0%</div>
            </div>
            
            {/* グリッドライン */}
            <div className="absolute top-0 w-full border-b border-dashed border-muted-foreground opacity-20"></div>
            <div className="absolute top-1/2 w-full border-b border-dashed border-muted-foreground opacity-20"></div>
            <div className="absolute bottom-0 w-full border-b border-dashed border-muted-foreground opacity-20"></div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <UserNav />
      <div className="container mx-auto px-4 py-8">
        {/* 開発バナー */}
        <DevelopmentBanner type="dashboard" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">学習統計</h1>
            <p className="text-muted-foreground">あなたの学習進捗とパフォーマンス</p>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* タブ切り替え */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid grid-cols-3 sm:grid-cols-5 md:w-[600px] mb-6">
                <TabsTrigger value="overview">概要</TabsTrigger>
                <TabsTrigger value="progress">進捗</TabsTrigger>
                <TabsTrigger value="questions">問題分析</TabsTrigger>
                <TabsTrigger value="time">時間分析</TabsTrigger>
                <TabsTrigger value="recommendations">推奨</TabsTrigger>
              </TabsList>
              
              {/* 概要タブ */}
              <TabsContent value="overview">
                {/* カードのグリッド */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg">
                          <BarChart className="h-5 w-5 mr-2" />
                          全体進捗
                        </CardTitle>
                        <CardDescription>学習の進捗状況</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-sm">コンテンツ完了率</span>
                          <span className="text-xl font-bold">{getOverallProgress()}%</span>
                        </div>
                        <Progress value={getOverallProgress()} className="h-2" />
                        
                        <div className="pt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-sm">完了</span>
                            </div>
                            <span className="font-medium">{getCompletedContents()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-sm">進行中</span>
                            </div>
                            <span className="font-medium">{getInProgressContents()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                              <span className="text-sm">未着手</span>
                            </div>
                            <span className="font-medium">{contents.length - (getCompletedContents() + getInProgressContents())}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg">
                          <Star className="h-5 w-5 mr-2" />
                          クイズ成績
                        </CardTitle>
                        <CardDescription>正解率と問題解決</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center mb-2">
                          <div className="mb-2">
                            <span className="text-3xl font-bold">{getOverallAccuracy()}%</span>
                            <span className="text-sm text-muted-foreground ml-2">正解率</span>
                          </div>
                          <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{getTotalCorrectAnswers()}/{getTotalQuestions()} 問正解</span>
                          </div>
                        </div>
                        
                        <Progress 
                          value={getOverallAccuracy()} 
                          className="h-2"
                          indicatorClassName={`${getAccuracyColorClass(getOverallAccuracy()).progress}`}
                        />
                        
                        <div className="pt-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">平均スコア</span>
                            <span className="font-medium">{getAverageScore()}%</span>
                          </div>
                          <Progress 
                            value={getAverageScore()}
                            className="h-2"
                            indicatorClassName={`${getAccuracyColorClass(getAverageScore()).progress}`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg">
                          <Zap className="h-5 w-5 mr-2" />
                          学習時間
                        </CardTitle>
                        <CardDescription>総学習時間と効率</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center mb-2">
                          <div className="mb-2">
                            <span className="text-3xl font-bold">{getTotalLearningTime()}</span>
                            <span className="text-sm text-muted-foreground ml-2">総学習時間</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-muted rounded-md">
                            <h3 className="font-semibold mb-2">平均クイズ解答時間</h3>
                            <p className="text-xl font-bold">
                              {formatShortTime(timeSeriesData.reduce((sum, item) => {
                                return sum + (item.correctCount + (item.totalCount - item.correctCount) * 1.5);
                              }, 0) / (timeSeriesData.reduce((sum, item) => sum + item.totalCount, 0) || 1))}
                              <span className="text-sm font-normal text-muted-foreground ml-2">/ 問</span>
                            </p>
                          </div>
                          
                          <div className="p-4 bg-muted rounded-md">
                            <h3 className="font-semibold mb-2">最も効率的な問題タイプ</h3>
                            {questionTypeStats.length > 0 ? (
                              <p className="text-xl font-bold">
                                {formatQuestionType(
                                  [...questionTypeStats]
                                    .sort((a, b) => (a.percentage / a.averageTime) - (b.percentage / b.averageTime))
                                    .pop()?.type || ''
                                )}
                              </p>
                            ) : (
                              <p className="text-muted-foreground">データがありません</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              {/* 進捗タブ */}
              <TabsContent value="progress">
                <div className="space-y-8">
                  {/* 時間推移グラフ */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <LineChart className="h-5 w-5 mr-2" />
                        学習スコアの推移
                      </CardTitle>
                      <CardDescription>時間経過による学習成績の変化</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[200px]">
                      {renderTimeSeriesGraph()}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* 問題分析タブ */}
              <TabsContent value="questions">
                <div className="space-y-8">
                  {/* 問題種別ごとの成績 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        問題タイプ別分析
                      </CardTitle>
                      <CardDescription>問題種別ごとの成績と学習効率</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {questionTypeStats.map((stat) => {
                          const colors = getAccuracyColorClass(stat.percentage);
                          return (
                            <div key={stat.type} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  {getQuestionTypeIcon(stat.type)}
                                  <span className="ml-2 font-medium">{formatQuestionType(stat.type)}</span>
                                </div>
                                <Badge className={`${colors.bg} ${colors.text} ${colors.border}`}>
                                  {stat.percentage}%
                                </Badge>
                              </div>
                              
                              <Progress 
                                value={stat.percentage} 
                                className="h-2"
                                indicatorClassName={colors.progress}
                              />
                              
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>回答数: {stat.totalAnswered}問</span>
                                <span>平均解答時間: {formatShortTime(stat.averageTime)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* 難易度別分析 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        難易度別分析
                      </CardTitle>
                      <CardDescription>難易度ごとの正解率</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {difficultyStats.map((stat) => {
                          const colors = getAccuracyColorClass(stat.percentage);
                          return (
                            <div key={stat.difficulty} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  {stat.difficulty === '上級' ? (
                                    <Award className="h-5 w-5 text-amber-500" />
                                  ) : stat.difficulty === '中級' ? (
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">中級</Badge>
                                  ) : (
                                    <Badge className="bg-green-100 text-green-800 border-green-200">初級</Badge>
                                  )}
                                  <span className="ml-2 font-medium">{stat.difficulty}</span>
                                </div>
                                <Badge className={`${colors.bg} ${colors.text} ${colors.border}`}>
                                  {stat.percentage}%
                                </Badge>
                              </div>
                              
                              <Progress 
                                value={stat.percentage} 
                                className="h-2"
                                indicatorClassName={colors.progress}
                              />
                              
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>回答数: {stat.totalAnswered}問</span>
                                <span>正解数: {stat.correctAnswers}問</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* 時間分析タブ */}
              <TabsContent value="time">
                <div className="space-y-8">
                  {/* 学習時間分析 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        学習時間分析
                      </CardTitle>
                      <CardDescription>時間効率と学習パターン</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="p-4 bg-muted rounded-md">
                          <h3 className="font-semibold mb-2">総学習時間</h3>
                          <p className="text-2xl font-bold mb-2">{getTotalLearningTime()}</p>
                          <p className="text-sm text-muted-foreground">
                            これまでに費やした総学習時間です。コンテンツの閲覧時間とクイズの解答時間を含みます。
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-muted rounded-md">
                            <h3 className="font-semibold mb-2">平均クイズ解答時間</h3>
                            <p className="text-xl font-bold">
                              {formatShortTime(timeSeriesData.reduce((sum, item) => {
                                return sum + (item.correctCount + (item.totalCount - item.correctCount) * 1.5);
                              }, 0) / (timeSeriesData.reduce((sum, item) => sum + item.totalCount, 0) || 1))}
                              <span className="text-sm font-normal text-muted-foreground ml-2">/ 問</span>
                            </p>
                          </div>
                          
                          <div className="p-4 bg-muted rounded-md">
                            <h3 className="font-semibold mb-2">最も効率的な問題タイプ</h3>
                            {questionTypeStats.length > 0 ? (
                              <p className="text-xl font-bold">
                                {formatQuestionType(
                                  [...questionTypeStats]
                                    .sort((a, b) => (a.percentage / a.averageTime) - (b.percentage / b.averageTime))
                                    .pop()?.type || ''
                                )}
                              </p>
                            ) : (
                              <p className="text-muted-foreground">データがありません</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* 推奨タブ */}
              <TabsContent value="recommendations">
                <div className="space-y-8">
                  {/* 弱点分野 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Flag className="h-5 w-5 mr-2" />
                        集中学習すべき分野
                      </CardTitle>
                      <CardDescription>正答率が低く、さらなる学習が推奨される分野</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {weaknessAreas.length > 0 ? (
                        <div className="space-y-4">
                          {weaknessAreas.map((area, index) => (
                            <div key={index} className="p-4 border rounded-md hover:bg-muted/50 transition-all">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{area.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    正答率: {area.correctRate}% ({Math.round(area.correctRate * area.questionCount / 100)}/{area.questionCount}問正解)
                                  </p>
                                </div>
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                  要復習
                                </Badge>
                              </div>
                              <div className="mt-2">
                                <Progress 
                                  value={area.correctRate} 
                                  className="h-2"
                                  indicatorClassName="bg-red-500"
                                />
                              </div>
                              <div className="flex justify-between mt-2">
                                <p className="text-xs text-muted-foreground">
                                  最後の挑戦: {formatDate(area.lastAttempted)}
                                </p>
                                <Button variant="link" size="sm" className="p-0 h-auto">
                                  関連問題を解く
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <div className="inline-block p-3 rounded-full bg-green-100 text-green-800 mb-4">
                            <CheckCircle className="h-8 w-8" />
                          </div>
                          <h3 className="text-lg font-medium">素晴らしい進捗です！</h3>
                          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                            現在、特に弱点となる分野は見つかりませんでした。引き続き学習を続けてください。
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* 次のステップ推奨 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="h-5 w-5 mr-2" />
                        次のステップ
                      </CardTitle>
                      <CardDescription>あなたのスキルを向上させるための推奨コンテンツ</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {contents
                          .filter(content => {
                            // 完了していないコンテンツの中で、ユーザーのレベルに合ったものを表示
                            const userProgress = progress.find(p => p.contentId === content.id);
                            return !userProgress || userProgress.completionPercentage < 100;
                          })
                          .slice(0, 4)
                          .map((content, index) => (
                            <div
                              key={content.id}
                              className="border rounded-md p-4 hover:shadow-md transition-all"
                            >
                              <h3 className="font-medium">{content.title}</h3>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <span className="flex items-center">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {content.type}
                                </span>
                                <span className="mx-2">•</span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  15分
                                </span>
                              </div>
                              <div className="mt-3">
                                <a href={`/user/content/${content.id}`}>
                                  <Button size="sm" variant="outline" className="w-full">
                                    コンテンツを見る
                                  </Button>
                                </a>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </>
  );
}
