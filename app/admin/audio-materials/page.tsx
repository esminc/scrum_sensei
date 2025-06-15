'use client';

import React from 'react';
import AdminNav from '@/components/admin/AdminNav';
import dynamic from 'next/dynamic';

// クライアントコンポーネントを動的インポート
const AudioMaterialsClient = dynamic(() => import('./client'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function CreateAudioMaterialPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="container mx-auto px-6 py-10">
        {/* タイトル・説明文 */}
        <div className="mb-8 border-l-4 border-purple-500 pl-6">
          <h1 className="text-4xl font-bold mb-4 text-purple-900">音声教材の作成</h1>
          <p className="text-xl text-purple-700 max-w-3xl">Gemini 2.5のテキスト読み上げ機能を使用して、高品質な音声教材を簡単に作成できます</p>
        </div>
        
        {/* クライアントコンポーネントを表示 */}
        <AudioMaterialsClient />
      </main>
    </div>
  );
}
