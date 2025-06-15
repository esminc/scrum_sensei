'use client';

import React, { useEffect, useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Volume2, FileQuestion, Plus, Filter, BookOpen, Play, Edit, Trash2 } from 'lucide-react';

type Material = {
  id: number;
  title: string;
  description?: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  questionCount: number;
  quizzes: any[];
  sections: any[];
};

export default function MaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const { getApiPath } = await import('@/lib/apiUtils');
      const response = await fetch(getApiPath('admin/materials'));
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'サーバーエラーが発生しました');
      }
      setMaterials(data.materials || []);
      setError(null);
    } catch (error) {
      console.error('教材取得エラー:', error);
      setError('教材一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      const { getApiPath } = await import('@/lib/apiUtils');
      const res = await fetch(getApiPath(`admin/materials/${id}`), { method: 'DELETE' });
      if (res.ok) {
        await fetchMaterials();
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      alert('削除時にエラーが発生しました');
      console.error('削除エラー:', error);
    }
  };

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP');
    } catch (error) {
      console.error('日付のフォーマットエラー:', error);
      return dateString;
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AdminNav />
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-br from-green-400/10 to-blue-500/10 rounded-full blur-2xl"></div>
      </div>
      
      <main className="relative container mx-auto px-4 py-8 pt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-4 glass-card rounded-2xl shadow-lg float-animation">
              <BookOpen className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                教材管理
              </h1>
              <p className="mt-2 text-gray-600 text-lg">
                学習コンテンツの作成と管理
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => router.push('/admin/quiz-generator')}
              className="glass-button text-green-700 font-medium px-6 py-3 rounded-xl flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>クイズ生成</span>
            </Button>
            <Button
              onClick={() => router.push('/admin/audio-materials/create')}
              className="glass-button bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium px-6 py-3 rounded-xl flex items-center space-x-2 pulse-glow"
            >
              <Volume2 className="h-4 w-4" />
              <span>音声教材作成</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="glass-card rounded-2xl p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-600 mx-auto"></div>
              <p className="text-gray-600 text-center mt-4">教材データを読み込み中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass-morphism bg-red-100/80 border-red-200/50 backdrop-blur-sm text-red-700 px-6 py-4 rounded-2xl relative mb-4">
            <strong className="font-bold">エラー: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center p-12 glass-card rounded-2xl shadow-xl animate-in">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">教材がまだありません</h3>
            <p className="text-gray-600 mb-8 text-lg">
              クイズ生成または音声教材作成から最初の教材を作成しましょう。
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => router.push('/admin/quiz-generator')}
                className="glass-morphism bg-white/30 border-white/20 backdrop-blur-sm hover:bg-white/40 text-green-700 font-medium px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>クイズを生成</span>
              </Button>
              <Button
                onClick={() => router.push('/admin/audio-materials/create')}
                className="glass-morphism bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-2"
              >
                <Volume2 className="h-5 w-5" />
                <span>音声教材を作成</span>
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full space-y-6">
            <TabsList className="glass-morphism bg-white/30 border-white/20 backdrop-blur-sm p-1 h-auto rounded-2xl grid grid-cols-3">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-3 font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>すべて ({materials.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="quiz"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-3 font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <FileQuestion className="h-4 w-4" />
                <span>クイズ ({materials.filter(m => m.type === 'quiz').length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="audio"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-3 font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <Volume2 className="h-4 w-4" />
                <span>音声教材 ({materials.filter(m => m.type === 'audio').length})</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="animate-in slide-in-from-top-5 duration-300">
              <MaterialGrid materials={materials} onDelete={handleDelete} router={router} formatDate={formatDate} />
            </TabsContent>
            
            <TabsContent value="quiz" className="animate-in slide-in-from-top-5 duration-300">
              <MaterialGrid 
                materials={materials.filter(m => m.type === 'quiz')} 
                onDelete={handleDelete} 
                router={router} 
                formatDate={formatDate} 
              />
            </TabsContent>
            
            <TabsContent value="audio" className="animate-in slide-in-from-top-5 duration-300">
              <MaterialGrid 
                materials={materials.filter(m => m.type === 'audio')} 
                onDelete={handleDelete} 
                router={router} 
                formatDate={formatDate} 
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

// MaterialGrid コンポーネント
interface MaterialGridProps {
  materials: Material[];
  onDelete: (id: number) => void;
  router: any;
  formatDate: (dateString: string) => string;
}

function MaterialGrid({ materials, onDelete, router, formatDate }: MaterialGridProps) {
  if (materials.length === 0) {
    return (
      <div className="text-center p-8 glass-morphism bg-white/30 border-white/20 backdrop-blur-sm rounded-2xl shadow-xl">
        <p className="text-gray-500">教材がありません。新しい教材を作成してください。</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {materials.map((material) => (
        <div
          key={material.id}
          className="group glass-morphism bg-white/40 border-white/20 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:bg-white/50 transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300 ${
                material.type === 'audio' 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                  : 'bg-gradient-to-br from-green-500 to-teal-600'
              }`}>
                {material.type === 'audio' ? (
                  <Volume2 className="h-5 w-5 text-white" />
                ) : (
                  <FileQuestion className="h-5 w-5 text-white" />
                )}
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                material.type === 'audio' 
                  ? 'glass-morphism bg-purple-500/20 text-purple-700 border border-purple-200/50'
                  : 'glass-morphism bg-green-500/20 text-green-700 border border-green-200/50'
              }`}>
                {material.type === 'audio' ? '音声教材' : 'クイズ'}
              </span>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              material.status === 'published' 
                ? 'glass-morphism bg-emerald-500/20 text-emerald-700 border border-emerald-200/50'
                : 'glass-morphism bg-amber-500/20 text-amber-700 border border-amber-200/50'
            }`}>
              {material.status === 'published' ? '公開' : '下書き'}
            </span>
          </div>
          
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
            {material.title}
          </h3>
          
          {material.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {material.description}
            </p>
          )}
          
          <div className="glass-morphism bg-white/30 border-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">問題数</span>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{material.questionCount}問</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">作成日</span>
              <span className="text-sm text-gray-600">{formatDate(material.created_at)}</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              size="sm"
              onClick={() => router.push(`/admin/materials/${material.id}/edit`)}
              className="flex-1 glass-morphism bg-white/30 border-white/20 backdrop-blur-sm hover:bg-white/40 text-blue-700 font-medium rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>編集</span>
            </Button>
            <Button
              size="sm"
              onClick={() => onDelete(material.id)}
              className="flex-1 glass-morphism bg-red-500/20 border-red-200/50 backdrop-blur-sm hover:bg-red-500/30 text-red-700 font-medium rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>削除</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
