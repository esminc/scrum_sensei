'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import UserNav from '@/components/user/UserNav';
import DevelopmentBanner from '@/components/ui/DevelopmentBanner';
import { 
  BookOpen, 
  FileQuestion, 
  Music, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Target,
  Award,
  PlayCircle,
  Brain,
  ChevronRight,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface DashboardStats {
  totalQuizzes: number;
  completedQuizzes: number;
  audioMaterials: number;
  studyStreak: number;
  totalScore: number;
  lastActivity: string;
}

export default function UserDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuizzes: 12,
    completedQuizzes: 8,
    audioMaterials: 5,
    studyStreak: 7,
    totalScore: 1250,
    lastActivity: '2024-12-20'
  });

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('おはようございます');
    } else if (hour < 18) {
      setGreeting('こんにちは');
    } else {
      setGreeting('こんばんは');
    }
  }, []);

  const completionRate = Math.round((stats.completedQuizzes / stats.totalQuizzes) * 100);

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
        <DevelopmentBanner type="dashboard" />
        
        {/* ウェルカムセクション */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 glass-card rounded-2xl shadow-lg float-animation">
              <Sparkles className="h-10 w-10 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {greeting}！
              </h1>
              <p className="mt-2 text-gray-600 text-lg">
                今日もScrum学習を頑張りましょう
              </p>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6 animate-in delay-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-600">{completionRate}%</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">学習進捗</h3>
            <p className="text-sm text-gray-600">{stats.completedQuizzes}/{stats.totalQuizzes} クイズ完了</p>
          </div>

          <div className="glass-card rounded-2xl p-6 animate-in delay-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.studyStreak}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">連続学習</h3>
            <p className="text-sm text-gray-600">日間継続中</p>
          </div>

          <div className="glass-card rounded-2xl p-6 animate-in delay-400">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Award className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-purple-600">{stats.totalScore}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">総合スコア</h3>
            <p className="text-sm text-gray-600">ポイント獲得</p>
          </div>

          <div className="glass-card rounded-2xl p-6 animate-in delay-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <Music className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-orange-600">{stats.audioMaterials}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">音声教材</h3>
            <p className="text-sm text-gray-600">利用可能</p>
          </div>
        </div>

        {/* メインコンテンツエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 学習メニュー */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl shadow-xl overflow-hidden animate-in delay-600">
              <div className="p-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  学習を続ける
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link href="/user/quiz" className="group">
                    <div className="glass-morphism-subtle rounded-xl p-6 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl pulse-glow">
                          <FileQuestion className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">クイズに挑戦</h3>
                          <p className="text-sm text-gray-600">Scrumの知識をテスト</p>
                        </div>
                      </div>
                      <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                        <span className="text-sm font-medium">開始する</span>
                        <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>

                  <Link href="/user/audio-materials" className="group">
                    <div className="glass-morphism-subtle rounded-xl p-6 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl pulse-glow">
                          <Music className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">音声教材</h3>
                          <p className="text-sm text-gray-600">聞いて学ぶScrum</p>
                        </div>
                      </div>
                      <div className="flex items-center text-purple-600 group-hover:text-purple-700 transition-colors">
                        <span className="text-sm font-medium">聞く</span>
                        <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>

                  <Link href="/user/advice" className="group">
                    <div className="glass-morphism-subtle rounded-xl p-6 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl pulse-glow">
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">AIアドバイス</h3>
                          <p className="text-sm text-gray-600">パーソナル指導</p>
                        </div>
                      </div>
                      <div className="flex items-center text-green-600 group-hover:text-green-700 transition-colors">
                        <span className="text-sm font-medium">相談する</span>
                        <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>

                  <div className="glass-morphism-subtle rounded-xl p-6 opacity-60">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-600">実践演習</h3>
                        <p className="text-sm text-gray-500">近日公開予定</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 今日の目標 */}
            <div className="glass-card rounded-2xl p-6 animate-in delay-700">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Target className="h-5 w-5 text-indigo-600 mr-2" />
                今日の目標
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600 line-through">クイズを1つ完了</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-4 w-4 border-2 border-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-700">音声教材を聞く</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-4 w-4 border-2 border-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-700">AIアドバイスを受ける</span>
                </div>
              </div>
            </div>

            {/* 最近の活動 */}
            <div className="glass-card rounded-2xl p-6 animate-in delay-800">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="h-5 w-5 text-purple-600 mr-2" />
                最近の活動
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">スプリント計画クイズ</span>
                  </div>
                  <span className="text-xs text-gray-500">2時間前</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">スクラム基礎音声</span>
                  </div>
                  <span className="text-xs text-gray-500">昨日</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">AIアドバイス受信</span>
                  </div>
                  <span className="text-xs text-gray-500">2日前</span>
                </div>
              </div>
            </div>

            {/* 学習のヒント */}
            <div className="glass-card rounded-2xl p-6 animate-in delay-900">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
                今日のヒント
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                スプリントレトロスペクティブでは、「何がうまくいったか」「何を改善できるか」「次に何をするか」の3つの観点で振り返りを行いましょう。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}