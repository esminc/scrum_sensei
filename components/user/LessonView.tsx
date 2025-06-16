// filepath: /Users/y-matsushima/work/mastra/next-app/components/user/LessonView.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Content } from '@/lib/models/content';
import { UserProgress, SectionProgress } from '@/lib/models/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle,
  Clock
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface LessonViewProps {
  content: Content;
  userId: string;
  onComplete?: (progress: UserProgress) => void;
}

// 進捗状態の拡張型（UIで使用）
interface SectionProgressWithStatus extends SectionProgress {
  status?: 'not-started' | 'in-progress' | 'completed';
}

export function LessonView({ content, userId, onComplete }: LessonViewProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [sectionProgress, setSectionProgress] = useState<Record<string, SectionProgressWithStatus>>({});
  const [loading, setLoading] = useState(true);

  // 表示するセクション
  const sections = useMemo(() => content.sections || [], [content.sections]);
  const currentSection = sections[currentSectionIndex];

  // セクションの進捗状態を更新する
  const updateSectionProgress = useCallback(async (sectionId: string, status: 'not-started' | 'in-progress' | 'completed') => {
    if (!progress) return;
    
    // 現在のセクション進捗をコピー
    const updatedSectionProgress = [...(progress.sectionProgress || [])];
    
    // 既存のセクション進捗を探す
    const existingIndex = updatedSectionProgress.findIndex(s => s.sectionId === sectionId);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // 既存のセクション進捗を更新
      updatedSectionProgress[existingIndex] = {
        ...updatedSectionProgress[existingIndex],
        completed: status === 'completed',
        lastAccessed: now
      };
    } else {
      // 新しいセクション進捗を追加
      updatedSectionProgress.push({
        sectionId,
        completed: status === 'completed',
        timeSpent: 0,
        lastAccessed: now
      });
    }

    // UIで使用するステータス付きの新しいマップを作成
    const newSectionProgress: Record<string, SectionProgressWithStatus> = {};
    updatedSectionProgress.forEach(section => {
      newSectionProgress[section.sectionId] = {
        ...section,
        status: section.completed ? 'completed' : 'in-progress'
      };
    });

    // まだ開始していないセクションにステータスを設定
    sections.forEach(section => {
      if (!newSectionProgress[section.id]) {
        newSectionProgress[section.id] = {
          sectionId: section.id,
          completed: false,
          timeSpent: 0,
          status: 'not-started'
        };
      }
    });

    setSectionProgress(newSectionProgress);

    // セクションの進捗状況から全体の進捗率を計算
    const completedSections = updatedSectionProgress.filter(s => s.completed).length;
    const completionPercentage = Math.round((completedSections / sections.length) * 100);

    // コンテンツの状態を更新
    let contentStatus: 'not-started' | 'in-progress' | 'completed' = 'in-progress';
    if (completionPercentage === 0) {
      contentStatus = 'not-started';
    } else if (completionPercentage === 100) {
      contentStatus = 'completed';
    }

    // 進捗データを更新
    const updatedProgress = {
      ...progress,
      status: contentStatus,
      completionPercentage,
      sectionProgress: updatedSectionProgress,
      lastAccessedAt: now
    };

    setProgress(updatedProgress);

    // APIに進捗を保存
    try {
      // APIクライアントをインポート
      const { put } = await import('@/lib/api/client');
      
      // APIクライアントを使用してデータを更新
      await put(`user/progress?id=${progress.id}`, updatedProgress);

      // 完了コールバックを呼び出す
      if (contentStatus === 'completed' && onComplete) {
        onComplete(updatedProgress);
      }
    } catch (error) {
      console.error('進捗の更新に失敗しました:', error);
    }
  }, [progress, sections, onComplete]);

  // 新しい進捗を作成
  const createNewProgress = useCallback(async () => {
    try {
      // APIクライアントをインポート
      const { post } = await import('@/lib/api/client');
      
      // APIクライアントを使用してデータを作成
      const data = await post('user/progress', { userId, contentId: content.id });
      setProgress(data);

      // 最初のセクションを「開始」状態にする
      if (sections.length > 0) {
        updateSectionProgress(sections[0].id, 'in-progress');
      }
    } catch (error) {
      console.error('進捗データの作成に失敗しました:', error);
    }
  }, [userId, content.id, sections, updateSectionProgress]);

  // 進捗データのロード
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const { getApiPath } = await import('@/lib/apiUtils');
        const res = await fetch(getApiPath(`user/progress?userId=${userId}&contentId=${content.id}`));
        const data = await res.json();

        if (data && data.id) {
          setProgress(data);

          // セクション進捗をマップに変換
          const sectionMap: Record<string, SectionProgressWithStatus> = {};
          if (data.sectionProgress) {
            data.sectionProgress.forEach((section: SectionProgress) => {
              // UIで使用するステータスを追加
              const status = section.completed ? 'completed' : 'in-progress';
              sectionMap[section.sectionId] = { 
                ...section,
                status 
              };
            });
          }
          setSectionProgress(sectionMap);

          // 現在進行中のセクションを特定
          const inProgressSection = data.sectionProgress?.find(
            (s: SectionProgress) => !s.completed
          );
          
          if (inProgressSection) {
            // 現在進行中のセクションのインデックスを取得
            const index = sections.findIndex(s => s.id === inProgressSection.sectionId);
            if (index !== -1) {
              setCurrentSectionIndex(index);
            }
          }
        } else {
          // 新しい進捗を作成
          await createNewProgress();
        }
      } catch (error) {
        console.error('進捗データの取得に失敗しました:', error);
        // 新しい進捗を作成
        await createNewProgress();
      } finally {
        setLoading(false);
      }
    };

    if (userId && content.id) {
      loadProgress();
    }
  }, [userId, content.id, createNewProgress, sections]);

  // 次のセクションに移動
  const nextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      // 現在のセクションを完了に
      if (currentSection) {
        updateSectionProgress(currentSection.id, 'completed');
      }
      
      // 次のセクションに移動して「開始」状態にする
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);
      
      if (sections[nextIndex]) {
        updateSectionProgress(sections[nextIndex].id, 'in-progress');
      }
    } else {
      // 最後のセクションを完了
      if (currentSection) {
        updateSectionProgress(currentSection.id, 'completed');
      }
    }
  };

  // 前のセクションに移動
  const prevSection = () => {
    if (currentSectionIndex > 0) {
      const prevIndex = currentSectionIndex - 1;
      setCurrentSectionIndex(prevIndex);
      
      if (sections[prevIndex]) {
        updateSectionProgress(sections[prevIndex].id, 'in-progress');
      }
    }
  };

  // セクションを直接選択
  const selectSection = (index: number) => {
    setCurrentSectionIndex(index);
    
    if (sections[index]) {
      updateSectionProgress(sections[index].id, 'in-progress');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">読み込み中...</div>;
  }

  if (!sections || sections.length === 0) {
    return <div className="p-4">このレッスンにはコンテンツがありません。</div>;
  }

  const completed = progress?.completionPercentage === 100;

  return (
    <div className="flex flex-col gap-6">
      {/* 進捗バー */}
      <div className="flex items-center gap-2">
        <Progress value={progress?.completionPercentage || 0} className="h-2" />
        <span className="text-sm font-medium">{progress?.completionPercentage || 0}%</span>
      </div>

      {/* レッスンコンテンツ */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>{currentSection.title}</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none dark:prose-invert">
          <ReactMarkdown>{currentSection.content}</ReactMarkdown>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevSection} 
            disabled={currentSectionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            前へ
          </Button>
          {currentSectionIndex < sections.length - 1 ? (
            <Button onClick={nextSection}>
              次へ
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={() => updateSectionProgress(currentSection.id, 'completed')}
              variant={completed ? "outline" : "default"}
              disabled={completed}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {completed ? "完了済み" : "完了する"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* セクション選択 */}
      <Tabs defaultValue="sections">
        <TabsList>
          <TabsTrigger value="sections">セクション一覧</TabsTrigger>
          <TabsTrigger value="info">レッスン情報</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sections">
          <div className="grid gap-2 mt-2">
            {sections.map((section, index) => {
              const sectionProg = sectionProgress[section.id];
              const status = sectionProg?.status || 'not-started';
              
              return (
                <div 
                  key={section.id}
                  onClick={() => selectSection(index)}
                  className={`p-3 rounded-md cursor-pointer flex items-center gap-2 ${
                    currentSectionIndex === index 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-muted'
                  }`}
                >
                  {status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : status === 'in-progress' ? (
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  ) : (
                    <span className="h-5 w-5 rounded-full border flex items-center justify-center">
                      {index + 1}
                    </span>
                  )}
                  <span className={status === 'completed' ? 'line-through opacity-70' : ''}>
                    {section.title}
                  </span>
                </div>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="info">
          <div className="space-y-4 mt-2">
            <div>
              <h3 className="font-medium">レッスンの詳細</h3>
              <p className="text-sm text-muted-foreground">{content.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  経過時間: {Math.floor((progress?.timeSpent || 0) / 60)}分
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  セクション数: {sections.length}
                </span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}