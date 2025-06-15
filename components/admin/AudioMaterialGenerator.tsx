import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TTSService } from '@/lib/ttsService';

interface AudioGeneratorProps {
  materialId?: string;
  initialText?: string;
  initialTitle?: string;
  onAudioGenerated?: (audioUrl: string) => void;
}

/**
 * Gemini 2.5のTTSを使用して音声教材を生成するコンポーネント
 */
export function AudioMaterialGenerator({
  materialId = '',
  initialText = '',
  initialTitle = '',
  onAudioGenerated
}: AudioGeneratorProps) {
  const [text, setText] = useState(initialText);
  const [title, setTitle] = useState(initialTitle);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    audioUrl?: string;
  } | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setResult({
        success: false,
        message: 'テキストを入力してください'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = materialId ? 
        await TTSService.generateMaterialAudio({
          materialId,
          materialText: text,
          title: title || '無題の音声教材'
        }) :
        await TTSService.generateTTS({ text });

      setResult({
        success: response.success,
        message: response.message,
        audioUrl: response.audioUrl
      });

      if (response.success && response.audioUrl) {
        setAudioUrl(response.audioUrl);
        if (onAudioGenerated) {
          onAudioGenerated(response.audioUrl);
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: '音声生成中にエラーが発生しました'
      });
      console.error('音声生成エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg border-t-4 border-t-purple-500 p-8">
      {/* タイトル・説明文は外側で表示するため削除 */}
      <div className="space-y-8">
        <div>
          <label htmlFor="title" className="text-lg font-semibold block mb-3 text-gray-800">
            タイトル
          </label>
          <Input 
            id="title"
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="音声教材のタイトル" 
            className="w-full text-lg py-6 px-4 border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" 
          />
        </div>
        <div>
          <label htmlFor="text" className="text-lg font-semibold block mb-3 text-gray-800">
            テキスト
          </label>
          <Textarea 
            id="text"
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="音声に変換するテキストを入力してください" 
            className="w-full min-h-[300px] text-lg p-5 border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 leading-relaxed rounded-lg" 
          />
        </div>
        {result && (
          <Alert className={`p-5 ${result.success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            <AlertDescription className="text-lg">
              {result.message}
            </AlertDescription>
          </Alert>
        )}
        {audioUrl && (
          <div className="mt-6 p-6 bg-indigo-100 rounded-lg border-2 border-indigo-300 shadow-sm">
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
              お使いのブラウザは音声再生をサポートしていません
            </audio>
          </div>
        )}
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !text.trim()} 
          className="w-full text-xl py-7 bg-purple-600 hover:bg-purple-700 font-semibold shadow-md"
        >
          {isLoading ? '生成中...' : '音声を生成'}
        </Button>
      </div>
    </div>
  );
}
