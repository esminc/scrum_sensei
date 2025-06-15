'use client';

import { useEffect, useState } from 'react';
import AdminNav from '../../components/admin/AdminNav';
import AudioMaterialPreview from '@/components/admin/AudioMaterialPreview';
import QuizPreview from '@/components/admin/QuizPreview';
import DevelopmentBanner from '@/components/ui/DevelopmentBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ダッシュボード用の概要データ型
type DashboardStats = {
  totalContents: number;
  totalPdfs: number;
  totalQuizzes: number;
  recentActivities: Array<{
    id: string;
    action: string;
    date: string;
    type: string;
  }>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContents: 0,
    totalPdfs: 0,
    totalQuizzes: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [audioMaterials, setAudioMaterials] = useState([]);
  const [quizMaterials, setQuizMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  // 教材データを取得
  const fetchMaterials = async () => {
    setMaterialsLoading(true);
    try {
      const { getApiPath } = await import('@/lib/apiUtils');
      const [audioResponse, quizResponse] = await Promise.all([
        fetch(getApiPath('admin/audio-materials')),
        fetch(getApiPath('admin/quiz-materials'))
      ]);
      
      if (audioResponse.ok) {
        const audioData = await audioResponse.json();
        setAudioMaterials(audioData.materials || []);
      }
      
      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        setQuizMaterials(quizData.materials || []);
      }
    } catch (error) {
      console.error('教材データの取得に失敗しました:', error);
    } finally {
      setMaterialsLoading(false);
    }
  };

  // ダッシュボードのデータを取得
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // APIクライアントをインポート
        const { get } = await import('@/lib/api/client');
        
        // APIクライアントを使用してデータを取得
        const data = await get('admin/dashboard');
        
        if (data.success && data.stats) {
          setStats({
            totalContents: data.stats.totalContents || 0,
            totalPdfs: data.stats.totalPdfs || 0,
            totalQuizzes: data.stats.totalQuizzes || 0,
            recentActivities: data.stats.recentActivities || []
          });
        } else {
          console.error('ダッシュボードデータのフォーマットが不正です:', data);
          // エラー時はフォールバックデータを表示
          setStats({
            totalContents: 0,
            totalPdfs: 0,
            totalQuizzes: 0,
            recentActivities: []
          });
        }
      } catch (error) {
        console.error('ダッシュボードデータの取得に失敗しました:', error);
        // エラー時はフォールバックデータを表示
        setStats({
          totalContents: 0,
          totalPdfs: 0,
          totalQuizzes: 0,
          recentActivities: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchMaterials();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AdminNav />
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-br from-green-400/10 to-blue-500/10 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto py-8 pt-20 px-4 sm:px-6 lg:px-8">
        {/* 開発バナー */}
        <DevelopmentBanner type="dashboard" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 glass-card rounded-2xl shadow-lg float-animation">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                管理者ダッシュボード
              </h1>
              <p className="mt-2 text-gray-600 text-lg">
                Scrum Sensei の教材と学習コンテンツを管理
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="glass-morphism-subtle rounded-xl px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  最終更新: {new Date().toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="glass-card rounded-2xl p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-600 mx-auto"></div>
              <p className="text-gray-600 text-center mt-4">データを読み込み中...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="group">
              <div className="glass-card rounded-2xl p-6 animate-in delay-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.totalContents}</div>
                    <div className="text-xs text-gray-600 font-medium">+12% 前月比</div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">総コンテンツ数</h3>
                <p className="text-sm text-gray-600">アップロード済み教材</p>
              </div>
            </div>

            <div className="group">
              <div className="glass-morphism bg-white/40 border-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/50 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.totalPdfs}</div>
                    <div className="text-xs text-gray-600 font-medium">+8% 前月比</div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">PDF教材数</h3>
                <p className="text-sm text-gray-600">アップロード済みファイル</p>
              </div>
            </div>

            <div className="group">
              <div className="glass-morphism bg-white/40 border-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/50 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.totalQuizzes}</div>
                    <div className="text-xs text-gray-600 font-medium">+25% 前月比</div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">クイズ問題数</h3>
                <p className="text-sm text-gray-600">生成済み問題</p>
              </div>
            </div>
          </div>
        )}

        {/* タブレイアウト */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="glass-morphism bg-white/30 border-white/20 backdrop-blur-sm p-1 h-auto rounded-2xl">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-3 font-medium transition-all duration-200"
            >
              📊 ダッシュボード
            </TabsTrigger>
            <TabsTrigger 
              value="audio" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-3 font-medium transition-all duration-200"
            >
              🎵 音声教材
            </TabsTrigger>
            <TabsTrigger 
              value="quiz" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-3 font-medium transition-all duration-200"
            >
              🧩 クイズ教材
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="animate-in slide-in-from-top-5 duration-300">
            <div className="glass-morphism bg-white/40 border-white/20 backdrop-blur-sm rounded-2xl shadow-xl">
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">最近のアクティビティ</h2>
                </div>
                <div className="space-y-3">
                  {stats.recentActivities.map(activity => (
                    <div 
                      key={activity.id} 
                      className="glass-morphism bg-white/30 border-white/20 backdrop-blur-sm rounded-xl p-4 hover:bg-white/40 transition-all duration-200 hover:scale-105"
                    >
                      <div className="mr-4 flex-shrink-0">
                        {activity.type === 'add' && (
                          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {activity.type === 'upload' && (
                          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {activity.type === 'generate' && (
                          <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                            </svg>
                          </div>
                        )}
                        {activity.type === 'edit' && (
                          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{activity.action}</p>
                        <p className="text-xs text-gray-600 mt-1">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="audio" className="animate-in slide-in-from-top-5 duration-300">
            <div className="glass-morphism bg-white/40 border-white/20 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <AudioMaterialPreview 
                materials={audioMaterials} 
                onRefresh={fetchMaterials}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="quiz" className="animate-in slide-in-from-top-5 duration-300">
            <div className="glass-morphism bg-white/40 border-white/20 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <QuizPreview 
                materials={quizMaterials} 
                onRefresh={fetchMaterials}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}