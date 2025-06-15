'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Content } from '@/lib/models/content';
import { post } from '@/lib/api/client';
import { useCallback } from 'react';
import {
  Bot,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  SendHorizonal,
  Sparkles
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface InteractiveChatProps {
  userId: string;
  content?: Content;
}

export function InteractiveChat({
  userId,
  content
}: InteractiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reflectionQuestions, setReflectionQuestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 初期メッセージ
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = content
        ? `こんにちは！「${content.title}」の学習をサポートします。質問や疑問があればお気軽にお聞きください。`
        : 'こんにちは！学習に関する質問やサポートが必要であればお気軽にお尋ねください。';
      
      setMessages([{
        id: '0',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [content, messages.length]);
  
  // 振り返り質問の生成
  const generateReflectionQuestions = useCallback(async () => {
    if (!content || isLoading) return;
    setIsLoading(true);
    try {
      const data = await post('user/reflection', {
        userId,
        contentId: content.id,
      });
      if (data.questions && Array.isArray(data.questions)) {
        setReflectionQuestions(data.questions);
      }
    } catch (error) {
      console.error('Reflection questions error:', error);
      // デフォルトの質問を設定
      setReflectionQuestions([
        'この内容で最も重要なポイントは何でしたか？',
        '学んだ内容をどのように実践できますか？',
        '理解が難しかった部分はありますか？',
        'この内容と以前に学んだことをどのように関連づけられますか？',
        'さらに深く学びたい点はありますか？'
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [content, isLoading, userId]);
  
  // メッセージが追加されたらスクロールを最下部に
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // メッセージ送信処理
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // ユーザーメッセージを追加
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    const userInput = input; // 入力をキャプチャ
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // AIからの応答を取得
      const data = await post('user/chat', {
        userId,
        contentId: content?.id,
        message: userInput,
      });
      
      // AIメッセージを追加
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message || 'すみません、回答を生成できませんでした。',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // エラーメッセージを追加
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'すみません、エラーが発生しました。しばらくしてからもう一度お試しください。',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // クイック質問の送信
  const sendQuickQuestion = (question: string) => {
    // 入力欄に設定
    setInput(question);
    
    // タブを切り替え
    setActiveTab('chat');
    
    // メッセージを送信
    setTimeout(() => {
      const e = { preventDefault: () => {} } as React.FormEvent;
      sendMessage(e);
    }, 100);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          学習サポートAI
        </CardTitle>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mx-4 grid w-auto grid-cols-3">
          <TabsTrigger value="chat">
            <HelpCircle className="h-4 w-4 mr-1" />
            チャット
          </TabsTrigger>
          <TabsTrigger value="reflection">
            <Lightbulb className="h-4 w-4 mr-1" />
            振り返り
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <Sparkles className="h-4 w-4 mr-1" />
            ヒント
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat">
          <CardContent>
            <div className="h-80 overflow-y-auto space-y-4 py-4 px-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className="flex items-start gap-2 max-w-[80%]">
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/bot-avatar.png" />
                        <AvatarFallback className="bg-primary/10">AI</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          message.role === 'user'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/user-avatar.png" />
                        <AvatarFallback className="bg-primary">U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          <CardFooter>
            <form onSubmit={sendMessage} className="flex w-full items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="質問を入力してください..."
                className="min-h-[80px]"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizonal className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="reflection">
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    これらの質問について考えることで理解を深めることができます。質問をクリックすると、AIアシスタントに質問できます。
                  </p>
                  <div className="space-y-3">
                    {reflectionQuestions.map((question, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 rounded-md border hover:bg-muted/50 cursor-pointer"
                        onClick={() => sendQuickQuestion(question)}
                      >
                        <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{question}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={generateReflectionQuestions}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              新しい質問を生成
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="suggestions">
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {/* 学習アドバイス */}
                <div className="p-3 rounded-md border bg-blue-50">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 mb-2">
                    学習のコツ
                  </Badge>
                  <h4 className="text-sm font-medium">能動的に学ぶ</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    内容を読むだけでなく、自分の言葉で説明したり、メモを取ったりすることで、理解度が大幅に向上します。
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs"
                    onClick={() => sendQuickQuestion("能動的な学習方法について詳しく教えてください。")}
                  >
                    <HelpCircle className="mr-1 h-3 w-3" />
                    詳細を質問
                  </Button>
                </div>
                
                {/* 関連コンテンツの提案 */}
                {content && (
                  <div className="p-3 rounded-md border bg-amber-50">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 mb-2">
                      関連コンテンツ
                    </Badge>
                    <h4 className="text-sm font-medium">理解を深めるための補助資料</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      このトピックについて、補足資料や実践的な例があります。AIに詳細を尋ねてみましょう。
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs"
                      onClick={() => sendQuickQuestion(`「${content.title}」についての補足資料や実践例を教えてください。`)}
                    >
                      <HelpCircle className="mr-1 h-3 w-3" />
                      資料について質問
                    </Button>
                  </div>
                )}
                
                {/* つまずきやすい点 */}
                {content && (
                  <div className="p-3 rounded-md border bg-purple-50">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 mb-2">
                      つまずきやすいポイント
                    </Badge>
                    <h4 className="text-sm font-medium">よくある誤解や難しい概念</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      このコンテンツで多くの学習者が混乱しがちなポイントについて確認しましょう。
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs"
                      onClick={() => sendQuickQuestion(`「${content.title}」でつまずきやすいポイントや誤解されやすい部分を教えてください。`)}
                    >
                      <HelpCircle className="mr-1 h-3 w-3" />
                      詳細を質問
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}