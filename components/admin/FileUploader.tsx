'use client';

import { useState, useRef, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api/client';

type FileUploaderProps = {
  onUploadComplete?: (result: { url: string, documentId?: string, chunkCount?: number }) => void;
};

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [type, setType] = useState<'principle' | 'framework' | 'practice' | 'guide'>('guide');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [processingResult, setProcessingResult] = useState<{ documentId?: string, chunkCount?: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイル検証とセット
  const handleFiles = useCallback((files: FileList) => {
    setError(null);
    
    if (files.length === 0) return;
    
    const file = files[0];
    
    // PDFファイルかどうか確認
    if (file.type !== 'application/pdf') {
      setError('PDFファイルのみアップロード可能です');
      return;
    }
    
    // ファイルサイズ制限 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('ファイルサイズは10MB以下にしてください');
      return;
    }
    
    setFile(file);
    setUploadComplete(false);
    // ファイル名からタイトルを設定（拡張子なし）
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    setTitle(fileName);
  }, []);

  // ドラッグ&ドロップイベントハンドラー
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [handleFiles]);

  // ファイル選択イベントハンドラー
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  // アップロードボタンクリック処理
  const handleUpload = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setProcessingResult(null);
    
    try {
      // FormDataの作成
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      if (tags) formData.append('tags', tags);
      formData.append('type', type);
      
      // シミュレートされたプログレス更新（実際の実装では XHR や fetch の進行状況を使用）
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);
      
      // アップロードAPIを呼び出す
      const response = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'アップロード中にエラーが発生しました');
      }
      
      const data = await response.json();
      
      setUploadProgress(100);
      setUploadComplete(true);
      
      if (data.documentId) {
        setProcessingResult({
          documentId: data.documentId,
          chunkCount: data.chunkCount
        });
      } else if (data.processingError) {
        setError(`RAGへの追加中にエラーが発生しました: ${data.processingError}`);
      }
      
      // 親コンポーネントに完了を通知
      if (onUploadComplete) {
        onUploadComplete({
          url: data.url,
          documentId: data.documentId,
          chunkCount: data.chunkCount
        });
      }
      
      // 完了メッセージを表示して3秒後にリセット
      setTimeout(() => {
        setFile(null);
        setTitle('');
        setTags('');
        setUploadProgress(0);
        setProcessingResult(null);
      }, 3000);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'アップロード中に予期せぬエラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  }, [file, title, tags, type, onUploadComplete]);

  // ファイル選択をトリガー
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // ファイルサイズのフォーマット
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!file ? triggerFileSelect : undefined}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf"
          onChange={handleFileSelect}
        />

        {!file ? (
          <div className="space-y-4">
            <svg 
              className="mx-auto h-16 w-16 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-700">
              PDFファイルをドラッグ&ドロップ
            </h3>
            <p className="text-sm text-gray-500">
              または<span className="text-blue-500">クリックして選択</span>
            </p>
            <p className="text-xs text-gray-400">
              最大ファイルサイズ: 10MB
            </p>
          </div>
        ) : (
          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center">
              <svg
                className="h-10 w-10 text-red-500" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>
            
            {/* メタデータ入力フィールド */}
            <div className="space-y-3 text-left">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="ドキュメントのタイトル"
                />
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  タグ (カンマ区切り)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="タグ1, タグ2, タグ3"
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  タイプ
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as 'principle' | 'framework' | 'practice' | 'guide')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="principle">原則</option>
                  <option value="framework">フレームワーク</option>
                  <option value="practice">プラクティス</option>
                  <option value="guide">ガイド</option>
                </select>
              </div>
            </div>
            
            {isUploading ? (
              <div className="w-full">
                <div className="bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {uploadProgress}% 完了
                </p>
              </div>
            ) : uploadComplete ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center text-green-500">
                  <svg 
                    className="h-5 w-5 mr-1"
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                  <span>アップロード完了</span>
                </div>
                
                {processingResult && (
                  <div className="text-xs text-gray-600">
                    <p>ドキュメントID: {processingResult.documentId}</p>
                    <p>チャンク数: {processingResult.chunkCount}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleUpload}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm transition-colors"
                  disabled={!title}
                >
                  アップロード
                </button>
                <button
                  onClick={() => setFile(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded text-sm transition-colors"
                >
                  キャンセル
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}