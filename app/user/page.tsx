'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserPage() {
  const router = useRouter();
  
  useEffect(() => {
    // /user/dashboard へリダイレクト
    router.push('/user/dashboard');
  }, [router]);
  
  // リダイレクト中はローディング表示
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">ダッシュボードにリダイレクト中...</p>
      </div>
    </div>
  );
}