'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { BarChart3, Lightbulb, TrendingUp, AlertTriangle, ArrowUpRight, Book } from 'lucide-react';
import { Progress } from '../ui/progress';
import { fetchAiAdviceStats } from '@/lib/api/advice';

interface AiAdviceStatsProps {
  userId: string;
  className?: string;
}

interface AdviceStats {
  adviceCount: number;
  helpfulRate: number;
  adviceByType: {
    motivation: number;
    weakness: number;
    strategy: number;
    progress: number;
    alert: number;
    general: number;
  };
  topRecommendations: string[];
  lastAdviceDate: string | null;
}

export default function AiAdviceStats({ userId, className = '' }: AiAdviceStatsProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdviceStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ユーザー向けにモックデータをuseMemoでラップ
  const mockStats = useMemo(() => ({
    adviceCount: 12,
    helpfulRate: 83,
    adviceByType: {
      motivation: 3,
      weakness: 4,
      strategy: 2,
      progress: 2,
      alert: 1,
      general: 0
    },
    topRecommendations: [
      'アジャイルマニフェストの基本原則を復習する',
      'スクラムマスターの役割について詳しく学ぶ',
      'プロダクトバックログの管理手法を練習する'
    ],
    lastAdviceDate: new Date().toISOString()
  }), []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        // 実際のAPIから統計データを取得
        const statsData = await fetchAiAdviceStats(userId);
        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error('Error loading advice stats:', err);
        setError('統計データを読み込めませんでした');
        // エラー時はモックデータをフォールバックとして使用
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userId, mockStats]);

  // モックデータを使用
  const displayStats = stats || mockStats;

  return (
    <Card className={`${className} border shadow-md`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">AIアドバイス分析</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>学習アドバイスの統計と推奨事項</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-pulse flex space-x-2">
              <div className="rounded-full bg-indigo-400 h-2 w-2 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="rounded-full bg-indigo-400 h-2 w-2 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="rounded-full bg-indigo-400 h-2 w-2 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 p-4">{error}</div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">受け取ったアドバイス</div>
                  <div className="text-2xl font-bold">{displayStats.adviceCount}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">役立ち度</div>
                  <div className="flex items-end gap-1">
                    <div className="text-2xl font-bold">{displayStats.helpfulRate}%</div>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">アドバイスタイプ分布</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center"><Lightbulb className="h-3 w-3 text-yellow-500 mr-1" /> モチベーション</span>
                    <span>{displayStats.adviceByType.motivation}件</span>
                  </div>
                  <Progress value={displayStats.adviceByType.motivation / displayStats.adviceCount * 100} className="h-1.5" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center"><AlertTriangle className="h-3 w-3 text-orange-500 mr-1" /> 弱点強化</span>
                    <span>{displayStats.adviceByType.weakness}件</span>
                  </div>
                  <Progress value={displayStats.adviceByType.weakness / displayStats.adviceCount * 100} className="h-1.5" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center"><TrendingUp className="h-3 w-3 text-green-500 mr-1" /> 戦略</span>
                    <span>{displayStats.adviceByType.strategy}件</span>
                  </div>
                  <Progress value={displayStats.adviceByType.strategy / displayStats.adviceCount * 100} className="h-1.5" />
                </div>
              </div>
              
              {displayStats.topRecommendations.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">トップ推奨事項</div>
                  <ul className="text-xs space-y-1">
                    {displayStats.topRecommendations.slice(0, 2).map((rec, i) => (
                      <li key={i} className="flex">
                        <Book className="h-3 w-3 text-blue-500 mr-1 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
