'use client';

import React, { useEffect, useState } from 'react';
import UserNav from '@/components/user/UserNav';
import { AudioPlayer } from '@/components/user/AudioPlayer';
import { Music, Play, Clock, Calendar } from 'lucide-react';

type AudioMaterial = {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  sourceText?: string;
  createdAt: string;
};

export default function AudioMaterialsPage() {
  const [audioMaterials, setAudioMaterials] = useState<AudioMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudioMaterials = async () => {
      try {
        setLoading(true);
        const { getApiPath } = await import('@/lib/apiUtils');
        const response = await fetch(getApiPath('user/audio-materials'));
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '音声教材の取得に失敗しました');
        }
        
        setAudioMaterials(data.materials || []);
        setError(null);
      } catch (error) {
        console.error('音声教材取得エラー:', error);
        setError('音声教材の取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAudioMaterials();
  }, []);

  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP');
    } catch (error) {
      return dateString;
    }
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
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-4 glass-card rounded-2xl shadow-lg float-animation">
            <Music className="h-10 w-10 text-purple-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              音声教材
            </h1>
            <p className="mt-2 text-gray-600 text-lg">
              学習を支援するための音声教材を聴くことができます
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="glass-morphism bg-white/30 border-white/20 backdrop-blur-sm rounded-2xl p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/30 border-t-purple-600 mx-auto"></div>
              <p className="text-gray-600 text-center mt-4">音声教材を読み込み中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass-morphism bg-red-100/80 border-red-200/50 backdrop-blur-sm text-red-700 px-6 py-4 rounded-2xl">
            <strong className="font-bold">エラー: </strong>
            <span>{error}</span>
          </div>
        ) : audioMaterials.length === 0 ? (
          <div className="text-center p-12 glass-card rounded-2xl shadow-xl animate-in">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Music className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
              音声教材がまだありません
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              管理者が音声教材を作成するまでお待ちください。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {audioMaterials.map((material) => (
              <div 
                key={material.id} 
                className="glass-card rounded-2xl overflow-hidden animate-in delay-300"
              >
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
                    {/* 左側: 音声プレイヤー */}
                    <div className="lg:w-1/2 mb-6 lg:mb-0">
                      <div className="glass-morphism-subtle rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="ml-4 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {material.title}
                          </h3>
                        </div>
                        <AudioPlayer 
                          audioUrl={material.audioUrl} 
                          title={material.title}
                          sourceText={material.sourceText}
                        />
                      </div>
                    </div>
                    
                    {/* 右側: 教材情報 */}
                    <div className="lg:w-1/2">
                      <div className="glass-morphism-subtle rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-800">教材情報</h4>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(material.createdAt)}</span>
                          </div>
                        </div>
                        
                        {material.description && (
                          <div className="mb-6">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">説明</h5>
                            <p className="text-gray-600 leading-relaxed">{material.description}</p>
                          </div>
                        )}
                        
                        {material.sourceText && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-3">テキスト内容</h5>
                            <div className="glass-input rounded-lg p-4 max-h-64 overflow-y-auto">
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {material.sourceText}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}