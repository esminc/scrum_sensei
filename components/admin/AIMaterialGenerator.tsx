import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TTSService } from '@/lib/ttsService';
import { AudioMaterialGenerator } from './AudioMaterialGenerator';
import { get } from '@/lib/api/client';

interface Material {
  id: string;
  title: string;
  content: string;
}

interface AIMaterialGeneratorProps {
  onAudioGenerated?: (audioUrl: string) => void;
}

/**
 * アップロードされた教材とトピックからAIコンテンツを生成し、音声に変換するコンポーネント
 */
export function AIMaterialGenerator({ onAudioGenerated }: AIMaterialGeneratorProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [audioTitle, setAudioTitle] = useState('');
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [step, setStep] = useState<'select' | 'generate' | 'audio'>('select');

  // 教材一覧を取得
  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoadingMaterials(true);
      try {
        const data = await get('admin/materials');
        setMaterials(data.materials || []);
      } catch (error) {
        console.error('教材取得エラー:', error);
      } finally {
        setIsLoadingMaterials(false);
      }
    };

    fetchMaterials();
  }, []);

  // 選択した教材の詳細を取得
  const handleMaterialSelect = async (materialId: string) => {
    if (!materialId) {
      setSelectedMaterial(null);
      return;
    }

    const found = materials.find(m => m.id === materialId);
    if (found) {
      setSelectedMaterial(found);
      setAudioTitle(`${found.title}（音声版）`);
    } else {
      try {
        const material = await get(`admin/materials/${materialId}`);
        setSelectedMaterial(material);
        setAudioTitle(`${material.title}（音声版）`);
      } catch (error) {
        console.error('教材詳細取得エラー:', error);
        setSelectedMaterial(null);
      }
    }
  };

  // AI生成の処理
  const handleGenerate = async () => {
    if (!selectedMaterial || !topic) {
      setResult({
        success: false,
        message: '教材とトピックを選択してください'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await TTSService.generateMaterialAudio({
        materialId: selectedMaterial.id,
        materialText: selectedMaterial.content,
        title: selectedMaterial.title
      });

      if (response.success && response.audioUrl) {
        // ここで必要に応じてオーディオURLを設定
        setResult({
          success: true,
          message: '音声コンテンツの生成が完了しました'
        });
        setStep('generate');
      } else {
        setResult({
          success: false,
          message: response.message || 'コンテンツの生成に失敗しました'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'コンテンツの生成中にエラーが発生しました'
      });
      console.error('AI生成エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === 'select' && (
        <Card className="w-full shadow-lg border-t-4 border-t-indigo-500">
          <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100 pb-6">
            <CardTitle className="text-2xl text-indigo-900 font-bold">AI音声教材の作成</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 px-6">
            <div className="space-y-2">
              <label className="text-lg font-semibold block mb-3 text-gray-800">
                教材を選択
              </label>
              <Select 
                value={selectedMaterialId} 
                onValueChange={(value: string) => {
                  setSelectedMaterialId(value);
                  handleMaterialSelect(value);
                }}
              >
                <SelectTrigger className="w-full text-lg py-6 px-4 border-2 border-gray-300">
                  <SelectValue placeholder="教材を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingMaterials ? (
                    <SelectItem value="loading" disabled>読み込み中...</SelectItem>
                  ) : materials.length > 0 ? (
                    materials.map(material => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>利用可能な教材がありません</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {selectedMaterial && (
              <div className="space-y-2">
                <label className="text-lg font-semibold block mb-3 text-gray-800">
                  音声タイトル
                </label>
                <Input 
                  value={audioTitle}
                  onChange={(e) => setAudioTitle(e.target.value)}
                  placeholder="音声教材のタイトルを入力"
                  className="w-full text-lg py-6 px-4 border-2 border-gray-300"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-lg font-semibold block mb-3 text-gray-800">
                トピック
              </label>
              <Textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="取り上げたいトピックを具体的に記述してください（例: スクラムの基本概念と実践方法）"
                className="w-full min-h-[100px] text-lg p-4 border-2 border-gray-300"
              />
            </div>

            {result && (
              <Alert className={`p-5 ${result.success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                <AlertDescription className="text-lg">
                  {result.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter className="bg-gray-100 px-6 py-6 border-t-2 border-gray-200">
            <Button 
              onClick={handleGenerate}
              disabled={isLoading || !selectedMaterial || !topic}
              className="w-full text-xl py-7 bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-md"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  コンテンツ生成中...
                </span>
              ) : 'コンテンツを生成する'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'generate' && (
        <Card className="w-full shadow-lg border-t-4 border-t-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 pb-6">
            <CardTitle className="text-2xl text-purple-900 font-bold">生成されたコンテンツの確認</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 px-6">
            <div className="space-y-2">
              <label className="text-lg font-semibold block mb-3 text-gray-800">
                音声教材のタイトル
              </label>
              <Input 
                value={audioTitle}
                onChange={(e) => setAudioTitle(e.target.value)}
                className="w-full text-lg py-6 px-4 border-2 border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-lg font-semibold block mb-3 text-gray-800">
                生成されたテキスト
              </label>
              <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-300">
                <Textarea 
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="w-full min-h-[300px] text-lg p-4 border-2 border-gray-200"
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="bg-gray-100 px-6 py-6 border-t-2 border-gray-200 flex justify-between">
            <Button 
              onClick={() => setStep('select')}
              variant="outline"
              className="text-lg py-5 px-6"
            >
              戻る
            </Button>
            <Button 
              onClick={() => setStep('audio')}
              className="text-lg py-5 px-10 bg-purple-600 hover:bg-purple-700"
            >
              音声に変換する
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'audio' && (
        <div>
          <Button 
            onClick={() => setStep('generate')}
            variant="outline"
            className="mb-6 text-lg py-4 px-6"
          >
            テキスト編集に戻る
          </Button>
          
          <AudioMaterialGenerator
            initialTitle={audioTitle}
            initialText={generatedContent}
            onAudioGenerated={onAudioGenerated}
          />
        </div>
      )}
    </div>
  );
}
