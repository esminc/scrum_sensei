// filepath: /Users/y-matsushima/work/mastra/next-app/components/user/ProgressTracker.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { UserProgress } from '@/lib/models/progress';
import { Content } from '@/lib/models/content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Clock,
  ActivitySquare,
  Award,
  BookOpen,
  CheckCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface ProgressTrackerProps {
  userId: string;
  title?: string;
  showCharts?: boolean;
  showRecommendations?: boolean;
  className?: string;
}

export function ProgressTracker({
  userId,
  title = '学習進捗',
  showCharts = true,
  showRecommendations = true,
  className,
}: ProgressTrackerProps) {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [stats, setStats] = useState({
    completedContents: 0,
    inProgressContents: 0,
    totalTimeSpent: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);

  // 進捗データとコンテンツデータの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // APIクライアントをインポート
        const { get } = await import('@/lib/api/client');
        
        // 進捗データの取得
        const progressData = await get(`user/progress?userId=${userId}`);
        
        if (progressData.progress && Array.isArray(progressData.progress)) {
          setProgress(progressData.progress);
        }
        
        if (progressData.stats) {
          setStats(progressData.stats);
        }
        
        // コンテンツデータの取得
        const contentsData = await get('user/content');
        
        if (contentsData.contents && Array.isArray(contentsData.contents)) {
          setContents(contentsData.contents);
        }
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);

  // 過去7日間の学習進捗データを作成
  const getLast7DaysActivity = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        count: 0,
        minutes: 0,
      };
    }).reverse();
    
    // 日付ごとのアクセス回数・時間を集計
    progress.forEach(p => {
      const accessDate = p.lastAccessed.split('T')[0];
      const dayIndex = last7Days.findIndex(d => d.date === accessDate);
      
      if (dayIndex !== -1) {
        last7Days[dayIndex].count += 1;
        last7Days[dayIndex].minutes += Math.round(p.timeSpent / 60);
      }
    });
    
    return last7Days;
  };

  // おすすめのコンテンツを取得
  const getRecommendations = () => {
    // 進行中のコンテンツID
    const inProgressIds = progress
      .filter(p => p.status === 'in-progress')
      .map(p => p.contentId);
    
    // 完了したコンテンツID
    const completedIds = progress
      .filter(p => p.status === 'completed')
      .map(p => p.contentId);
    
    // 未開始のコンテンツから推奨
    const notStartedContents = contents.filter(
      c => !inProgressIds.includes(c.id) && !completedIds.includes(c.id)
    );
    
    // 進行中コンテンツの取得
    const inProgressContents = contents.filter(
      c => inProgressIds.includes(c.id)
    );
    
    return {
      continue: inProgressContents.slice(0, 3),
      discover: notStartedContents.slice(0, 3)
    };
  };

  if (loading) {
    return <div className="p-8 text-center">進捗データを読み込み中...</div>;
  }

  const activityData = getLast7DaysActivity();
  const recommendations = getRecommendations();

  return (
    <div className={className}>
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {progress.length === 0 ? (
            <div className="p-6 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">学習履歴がまだありません</h3>
              <p className="text-sm text-muted-foreground mt-1">
                コンテンツを選択して学習を開始しましょう。
              </p>
            </div>
          ) : (
            <>
              {/* 統計サマリー */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
                <div className="p-3 bg-slate-50 rounded-lg border flex flex-col items-center">
                  <BookOpen className="h-5 w-5 text-primary mb-1" />
                  <span className="text-xs text-muted-foreground">学習中</span>
                  <span className="text-lg font-semibold">{stats.inProgressContents}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border flex flex-col items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
                  <span className="text-xs text-muted-foreground">完了</span>
                  <span className="text-lg font-semibold">{stats.completedContents}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border flex flex-col items-center">
                  <Clock className="h-5 w-5 text-amber-500 mb-1" />
                  <span className="text-xs text-muted-foreground">学習時間</span>
                  <span className="text-lg font-semibold">{Math.floor(stats.totalTimeSpent / 60)}分</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border flex flex-col items-center">
                  <Award className="h-5 w-5 text-purple-500 mb-1" />
                  <span className="text-xs text-muted-foreground">平均スコア</span>
                  <span className="text-lg font-semibold">{Math.round(stats.averageScore)}%</span>
                </div>
              </div>
              
              {showCharts && (
                <Tabs defaultValue="activity">
                  <TabsList>
                    <TabsTrigger value="activity">活動履歴</TabsTrigger>
                    <TabsTrigger value="completion">完了状況</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="activity" className="mt-3">
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={activityData}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="minutes"
                            name="学習時間（分）"
                            stroke="#3b82f6"
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            name="アクセス数"
                            stroke="#10b981"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="completion" className="mt-3">
                    <div className="space-y-4">
                      {progress
                        .sort((a, b) => b.completionPercentage - a.completionPercentage)
                        .slice(0, 5)
                        .map(p => {
                          const content = contents.find(c => c.id === p.contentId);
                          if (!content) return null;
                          
                          return (
                            <div key={p.id} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{content.title}</span>
                                <span className="text-sm">{p.completionPercentage}%</span>
                              </div>
                              <Progress value={p.completionPercentage} className="h-2" />
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                  <Clock className="inline h-3 w-3 mr-1" />
                                  {Math.floor(p.timeSpent / 60)}分
                                </span>
                                <span>
                                  <Calendar className="inline h-3 w-3 mr-1" />
                                  {new Date(p.lastAccessed).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
              
              {showRecommendations && (
                <div className="mt-6 space-y-4">
                  {recommendations.continue.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-3 flex items-center">
                        <ActivitySquare className="h-4 w-4 mr-2 text-blue-500" />
                        続きから学習
                      </h3>
                      <div className="space-y-2">
                        {recommendations.continue.map(content => (
                          <div 
                            key={content.id}
                            className="p-3 rounded-md border bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            <div className="font-medium text-sm">{content.title}</div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {content.description}
                            </div>
                            <div className="mt-2">
                              <Progress 
                                value={
                                  progress.find(p => p.contentId === content.id)?.completionPercentage || 0
                                }
                                className="h-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {recommendations.discover.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-3 flex items-center">
                        <Award className="h-4 w-4 mr-2 text-amber-500" />
                        おすすめコンテンツ
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {recommendations.discover.map(content => (
                          <div 
                            key={content.id}
                            className="p-3 rounded-md border hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <div className="font-medium text-sm">{content.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {content.type === 'lesson' ? 'レッスン' : 
                               content.type === 'quiz' ? 'クイズ' :
                               content.type === 'article' ? '記事' : 
                               content.type === 'video' ? '動画' : 'その他'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}