'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Brain, Lightbulb, TrendingUp, AlertTriangle, MessageCircle, RefreshCw } from 'lucide-react';
import { Card } from '../ui/card';
import { ClientAdvice, generateRandomAdvice } from '../../lib/clientAdviceGenerator';
import { get, post } from '@/lib/api/client';

// Adviceインターフェースを上記でインポートしたClientAdviceに置き換え
type Advice = ClientAdvice;

interface AiAdviceProps {
  userId: string;
  className?: string;
}

export default function AiAdvice({ userId, className = '' }: AiAdviceProps) {
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState<'helpful' | 'not_helpful' | null>(null);

  // コンポーネントの初期化時に、Mastra AIエージェントからアドバイスを取得
  useEffect(() => {
    // Mastra APIからアドバイスを取得する関数
    const fetchAdviceFromMastra = async () => {
      setLoading(true);
      try {
        // バックエンドのMastra APIを呼び出し
        const data = await get(`mastra/advisor/latest-advice?userId=${userId}`);
        setAdvice(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching advice from Mastra:', err);
        setError('アドバイスを読み込めませんでした。後でもう一度お試しください。');
        
        // エラー時はクライアントサイドでフォールバック生成
        try {
          const fallbackAdvice = generateRandomAdvice();
          setAdvice(fallbackAdvice);
          setError(null);
        } catch (e) {
          setError('アドバイスの生成に失敗しました。更新ボタンで再試行してください。');
          console.error('Fallback advice generation failed:', e);
        }
      } finally {
        setLoading(false);
      }
    };

    // コンポーネントマウント時にMastraからアドバイスを取得
    fetchAdviceFromMastra();
  }, [userId]);

  const sendFeedback = async (feedback: 'helpful' | 'not_helpful') => {
    if (!advice) return;
    
    // UI上でフィードバックを即時反映
    setUserFeedback(feedback);
    
    try {
      // バックエンドにフィードバックを送信
      await post('mastra/advisor/feedback', {
        adviceId: advice.id,
        userId,
        feedback
      });
    } catch (err) {
      // エラー表示はしないが、コンソールには記録
      console.error('Error sending feedback to Mastra:', err);
    }
  };

  const getIcon = () => {
    if (!advice) return <Brain className="h-5 w-5" />;
    
    switch (advice.type) {
      case 'motivation':
        return <Sparkles className="h-5 w-5 text-yellow-400" />;
      case 'weakness':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'strategy':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'progress':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-purple-500" />;
    }
  };

  const getCardStyle = () => {
    if (!advice) return 'border-gray-300 bg-gray-50';
    
    switch (advice.type) {
      case 'motivation':
        return 'border-yellow-200 bg-yellow-50';
      case 'weakness':
        return 'border-orange-200 bg-orange-50';
      case 'strategy':
        return 'border-green-200 bg-green-50';
      case 'progress':
        return 'border-blue-200 bg-blue-50';
      case 'alert':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-purple-200 bg-purple-50';
    }
  };

  const getAdviceTitle = () => {
    if (!advice) return 'AIアドバイス';
    
    switch (advice.type) {
      case 'motivation':
        return 'モチベーションアップ';
      case 'weakness':
        return '弱点強化のヒント';
      case 'strategy':
        return '学習戦略のアドバイス';
      case 'progress':
        return '進捗状況アップデート';
      case 'alert':
        return '注意点';
      default:
        return 'AIからのアドバイス';
    }
  };

  // 新しいアドバイスを要求するハンドラ
  const handleRequestNewAdvice = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Mastra APIを使用して新しいアドバイスを生成
      const data = await post('mastra/advisor/generate-advice', { 
        userId,
        // ユーザーコンテキスト情報があれば追加（学習状況など）
        context: {
          timestamp: new Date().toISOString(),
          requestSource: 'user-initiated'
        }
      });
      
      setAdvice(data);
      setError(null);
      setUserFeedback(null);
    } catch (err) {
      console.error('Error generating new advice from Mastra:', err);
      setError('新しいアドバイスを生成できませんでした。もう一度お試しください。');
      
      // エラー時はクライアントサイドで生成
      try {
        const fallbackAdvice = generateRandomAdvice();
        setAdvice(fallbackAdvice);
        setError(null);
        setUserFeedback(null);
      } catch (e) {
        console.error('Fallback advice generation failed:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div>
          <Card
            className={`overflow-hidden ${getCardStyle()} border-2 shadow-lg`}
          >
            {loading ? (
              <div className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                <div className="animate-pulse flex space-x-2">
                  <div className="rounded-full bg-indigo-400 h-3 w-3 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="rounded-full bg-indigo-400 h-3 w-3 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="rounded-full bg-indigo-400 h-3 w-3 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="mt-4 text-sm text-gray-500">AIがアドバイスを考え中...</p>
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="flex items-center text-red-500 mb-2">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <h3 className="text-lg font-medium">エラーが発生しました</h3>
                </div>
                <p className="text-gray-600">{error}</p>
              </div>
            ) : advice ? (
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="mr-3 p-2 rounded-full bg-white shadow-sm">
                    {getIcon()}
                  </div>
                  <h3 className="text-lg font-medium">{getAdviceTitle()}</h3>
                </div>
                <div className="mb-6">
                  <p className="text-gray-700 whitespace-pre-line">{advice.content}</p>
                </div>
                
                <div className="flex justify-between items-center border-t pt-4 mt-2">
                  <div className="text-xs text-gray-500">
                    {new Date(advice.createdAt).toLocaleDateString('ja-JP')}
                  </div>
                  
                  <div className="flex space-x-2">
                    {!userFeedback ? (
                      <>
                        <button
                          onClick={() => sendFeedback('helpful')}
                          className="text-xs px-2 py-1 rounded border border-green-300 text-green-700 hover:bg-green-50"
                        >
                          役に立った
                        </button>
                        <button
                          onClick={() => sendFeedback('not_helpful')}
                          className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          改善の余地あり
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-gray-500 mr-2">
                          {userFeedback === 'helpful' ? 'フィードバックありがとうございます！' : '改善に役立てます'}
                        </span>
                        <button
                          onClick={handleRequestNewAdvice}
                          className="text-xs px-2 py-1 rounded border border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> 新しいアドバイス
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                <MessageCircle className="h-8 w-8 text-gray-400 mb-3" />
                <p className="text-gray-500">まだアドバイスはありません</p>
              </div>
            )}
          </Card>
      </div>
    </div>
  );
}
