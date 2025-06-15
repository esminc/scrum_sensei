'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AudioMaterialGenerator } from '@/components/admin/AudioMaterialGenerator';
import { Card, CardContent } from '@/components/ui/card';

type Material = {
  id: string;
  title: string;
  content: string;
};

export default function AudioMaterialsClient() {
  const searchParams = useSearchParams();
  const materialId = searchParams.get('materialId');
  
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // materialIdがある場合、教材データを取得
    if (materialId) {
      fetchMaterial(materialId);
    }
  }, [materialId]);
  
  const fetchMaterial = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { getApiPath } = await import('@/lib/apiUtils');
      const res = await fetch(getApiPath(`materials/${id}`));
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setMaterial(data);
    } catch (err) {
      console.error('教材取得エラー:', err);
      setError('教材の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAudioGenerated = (audioUrl: string) => {
    // 音声生成完了時の処理
    console.log('音声生成完了:', audioUrl);
    // 必要に応じて教材に音声URLを関連付ける処理を追加
  };
  
  return (
    <div>
      {loading ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">読み込み中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 p-6 rounded-lg text-lg">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {material ? (
            <Card className="shadow-lg border-2 border-indigo-100">
              <CardContent className="p-6">
                <AudioMaterialGenerator
                  materialId={material.id}
                  initialText={material.content}
                  initialTitle={`${material.title}（音声版）`}
                  onAudioGenerated={handleAudioGenerated}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-2 border-indigo-100">
              <CardContent className="p-6">
                <AudioMaterialGenerator 
                  onAudioGenerated={handleAudioGenerated}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
