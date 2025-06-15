'use client';

import React, { useState, useEffect } from 'react';
import UserNav from '@/components/user/UserNav';
import AiAdvice from '@/components/user/AiAdvice';
import DevelopmentBanner from '@/components/ui/DevelopmentBanner';
import { Sparkles, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UserAdvicePage() {
  const [latestAdvice, setLatestAdvice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchLatestAdvice = async () => {
      try {
        setLoading(true);
        const { getApiPath } = await import('@/lib/apiUtils');
        const response = await fetch(getApiPath('user/advice'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.advice) {
            setLatestAdvice(data.advice);
          }
        }
      } catch (error) {
        console.error('アドバイス取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestAdvice();
  }, []);

  const generateAdvice = async () => {
    try {
      setIsGenerating(true);
      
      const { getApiPath } = await import('@/lib/apiUtils');
      const response = await fetch(getApiPath('user/advice/generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current-user',
          context: 'スクラム学習の進捗確認'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.advice) {
          setLatestAdvice(data.advice);
        }
      } else {
        throw new Error('アドバイス生成に失敗しました');
      }
    } catch (error) {
      console.error('アドバイス生成エラー:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdviceGenerated = (advice: any) => {
    setLatestAdvice(advice);
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
        {/* 開発バナー */}
        <DevelopmentBanner type="ai-advice" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 glass-card rounded-2xl shadow-lg float-animation">
              <Sparkles className="h-10 w-10 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AIアドバイス
              </h1>
              <p className="mt-2 text-gray-600 text-lg">
                あなたの学習進捗に合わせたパーソナライズされたAIアドバイス
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button
              onClick={() => setShowHistory(!showHistory)}
              disabled={loading}
              className="glass-button text-gray-700 font-medium px-6 py-3 rounded-xl flex items-center space-x-2"
            >
              <History className="h-4 w-4" />
              <span>履歴</span>
            </Button>
            <Button
              onClick={generateAdvice}
              disabled={isGenerating}
              className="glass-button bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium px-6 py-3 rounded-xl flex items-center space-x-2 pulse-glow"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>アドバイスを取得</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* AIアドバイスコンポーネント */}
        <div className="glass-card rounded-2xl shadow-xl overflow-hidden animate-in delay-200">
          <div className="p-8">
            <AiAdvice userId="default-user" />
          </div>
        </div>
      </div>
    </div>
  );
}