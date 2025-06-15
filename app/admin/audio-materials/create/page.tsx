'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Loader2, Volume2, FileAudio, CheckCircle, Play, Pause, Download, BarChart3, Settings, Sparkles } from 'lucide-react';
import EnhancedTTSSettings, { TTSSettings as TTSSettingsType } from '@/components/admin/EnhancedTTSSettings';

interface QuizMaterial {
  id: number;
  title: string;
  description: string;
  questionCount: number;
  created_at: string;
}

interface AudioPreview {
  url: string;
  duration: number;
  isPlaying: boolean;
}

export default function CreateAudioMaterialPage() {
  const router = useRouter();
  const [quizMaterials, setQuizMaterials] = useState<QuizMaterial[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ttsSettings, setTtsSettings] = useState<TTSSettingsType>({
    voice: 'Kore',
    model: 'gemini-2.5-flash-preview-tts',
    language: 'ja-JP',
    style: 'clear and friendly'
  });
  const [audioPreview, setAudioPreview] = useState<AudioPreview | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchQuizMaterials();
  }, []);

  // 選択された教材が変更された時にタイトルと説明を自動設定
  useEffect(() => {
    if (selectedMaterialId) {
      const selectedMaterial = quizMaterials.find(m => m.id.toString() === selectedMaterialId);
      if (selectedMaterial) {
        setTitle(`${selectedMaterial.title} - 解説授業`);
        setDescription(`${selectedMaterial.description}に関する解説授業形式の音声教材です。重要なポイントを分かりやすく解説します。`);
        // トークン数を推定
        estimateTokenUsage(selectedMaterial);
      }
    }
  }, [selectedMaterialId, quizMaterials]);

  const estimateTokenUsage = (material: QuizMaterial) => {
    // 簡易的なトークン推定（実際の文字数 * 1.5）
    const textLength = material.title.length + material.description.length + (material.questionCount * 200);
    setEstimatedTokens(Math.ceil(textLength * 1.5));
  };

  const fetchQuizMaterials = async () => {
    try {
      setLoading(true);
      const { getApiPath } = await import('@/lib/apiUtils');
      const response = await fetch(getApiPath('admin/create-audio-material'));
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        throw new Error(data.error || `API エラー: ${response.status}`);
      }
      
      console.log('Quiz materials fetched successfully:', data);
      setQuizMaterials(data.quizMaterials || []);
      setError(null);
    } catch (error) {
      console.error('クイズ教材取得エラー:', error);
      setError(`クイズ教材の取得に失敗しました: ${error instanceof Error ? error.message : error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAudioMaterial = async () => {
    if (!selectedMaterialId) {
      setError('クイズ教材を選択してください');
      return;
    }

    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      setGenerationProgress(0);
      
      // プログレス更新をシミュレート
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);
      
      const { getApiPath } = await import('@/lib/apiUtils');
      const response = await fetch(getApiPath('admin/create-audio-material'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId: parseInt(selectedMaterialId),
          title: title.trim(),
          description: description.trim(),
          ttsSettings
        }),
      });

      const data = await response.json();
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      if (!response.ok) {
        throw new Error(data.error || '音声教材の作成に失敗しました');
      }
      
      setSuccess('音声教材を正常に作成しました');
      
      // 音声プレビューを設定
      if (data.audioUrl) {
        setAudioPreview({
          url: data.audioUrl,
          duration: data.duration || 0,
          isPlaying: false
        });
      }
      
      // 3秒後に教材一覧にリダイレクト
      setTimeout(() => {
        router.push('/admin/materials');
      }, 3000);
      
    } catch (error) {
      console.error('音声教材作成エラー:', error);
      setError(error instanceof Error ? error.message : '音声教材の作成に失敗しました');
      setGenerationProgress(0);
    } finally {
      setCreating(false);
    }
  };

  const toggleAudioPreview = () => {
    if (!audioRef.current || !audioPreview) return;
    
    if (audioPreview.isPlaying) {
      audioRef.current.pause();
      setAudioPreview(prev => prev ? { ...prev, isPlaying: false } : null);
    } else {
      audioRef.current.play();
      setAudioPreview(prev => prev ? { ...prev, isPlaying: true } : null);
    }
  };

  const downloadAudio = () => {
    if (!audioPreview) return;
    const link = document.createElement('a');
    link.href = audioPreview.url;
    link.download = `${title}.wav`;
    link.click();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ja-JP');
    } catch {
      return dateString;
    }
  };

  if (loading) {
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
          <div className="flex justify-center items-center h-64">
            <div className="glass-morphism bg-white/30 border-white/20 backdrop-blur-sm rounded-2xl p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-600 mx-auto"></div>
              <p className="text-gray-600 text-center mt-4">データを読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 glass-morphism bg-white/30 border-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
              <Sparkles className="h-10 w-10 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                AI音声教材作成
              </h1>
              <p className="mt-2 text-gray-600 text-lg">
                Gemini 2.5を使って高品質な解説授業を生成
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/materials')}
              className="glass-morphism border-white/20 hover:bg-white/20 backdrop-blur-sm"
            >
              教材一覧に戻る
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 glass-morphism bg-red-500/10 text-red-800 border-red-200/50 backdrop-blur-sm">
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 glass-morphism bg-green-500/10 text-green-800 border-green-200/50 backdrop-blur-sm">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">{success}</AlertDescription>
          </Alert>
        )}

        {/* Token Usage Estimator */}
        {estimatedTokens > 0 && (
          <Card className="mb-6 glass-morphism bg-white/40 border-white/20 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-800">推定使用量</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{estimatedTokens.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">トークン</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* 機能説明 */}
          <Card className="glass-morphism bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center space-x-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Volume2 className="h-5 w-5" />
                </div>
                <span>AI音声教材について</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4 leading-relaxed">
                最新のGemini 2.5 TTSを使用して、選択したクイズをベースに解説授業形式の高品質な音声コンテンツを生成します。
                単純な読み上げではなく、理解を深める教育的な解説を提供します。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-800">🎯 コンテンツ特徴</h4>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• クイズの内容を基に講義形式の解説を生成</li>
                    <li>• 関連するPDF資料も参考にして内容を充実化</li>
                    <li>• 自然な話し言葉での分かりやすい解説</li>
                    <li>• 15-20分程度の音声授業として構成</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-800">🚀 AI機能</h4>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• 28種類の音声から選択可能</li>
                    <li>• リアルタイム音声スタイル調整</li>
                    <li>• 高品質WAV形式で出力</li>
                    <li>• プレビュー機能付き</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: クイズ教材選択 */}
          <Card className="glass-morphism bg-white/50 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white font-bold text-sm">
                  1
                </div>
                <FileAudio className="h-5 w-5 text-blue-600" />
                <span>解説授業のベースとなるクイズ教材を選択</span>
              </CardTitle>
              <CardDescription className="ml-11 text-gray-600">
                クイズの内容を基に解説授業形式の音声教材を生成します
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quizMaterials.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  利用可能なクイズ教材がありません。
                  <br />
                  まず問題生成ツールでクイズを作成してください。
                </div>
              ) : (
                <RadioGroup value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                  <div className="space-y-3">
                    {quizMaterials.map((material) => (
                      <div key={material.id} className="group">
                        <div className="flex items-center space-x-3 p-5 glass-morphism bg-white/30 border-white/20 backdrop-blur-sm rounded-xl hover:bg-white/40 transition-all duration-200 hover:shadow-lg hover:scale-105">
                          <RadioGroupItem value={material.id.toString()} id={`material-${material.id}`} className="text-blue-600" />
                          <Label htmlFor={`material-${material.id}`} className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{material.title}</h3>
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{material.description}</p>
                              </div>
                              <div className="flex items-center space-x-3 ml-4">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                                  {material.questionCount}問
                                </Badge>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {formatDate(material.created_at)}
                                </span>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          {/* Step 2: 音声教材の詳細設定 */}
          {selectedMaterialId && (
            <Card className="glass-morphism bg-white/50 border-white/20 backdrop-blur-sm animate-in slide-in-from-top-5 duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full text-white font-bold text-sm">
                    2
                  </div>
                  <Volume2 className="h-5 w-5 text-purple-600" />
                  <span>解説授業の詳細設定</span>
                </CardTitle>
                <CardDescription className="ml-11 text-gray-600">
                  生成する解説授業のタイトルと説明を設定します。関連PDFがある場合は自動的に参考資料として活用されます。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-gray-700">タイトル *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="音声教材のタイトルを入力..."
                    className="glass-morphism bg-white/70 border-white/30 backdrop-blur-sm focus:bg-white/90 transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">説明</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="音声教材の説明を入力..."
                    rows={3}
                    className="glass-morphism bg-white/70 border-white/30 backdrop-blur-sm focus:bg-white/90 transition-all duration-200 resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: 音声合成設定 */}
          {selectedMaterialId && title && (
            <div className="animate-in slide-in-from-top-5 duration-300 delay-200">
              <Card className="glass-morphism bg-white/50 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full text-white font-bold text-sm">
                      3
                    </div>
                    <Settings className="h-5 w-5 text-green-600" />
                    <span>AI音声合成設定</span>
                  </CardTitle>
                  <CardDescription className="ml-11 text-gray-600">
                    Gemini 2.5の高度な音声合成パラメータを調整できます
                  </CardDescription>
                </CardHeader>
                <CardContent className="ml-11">
                  <EnhancedTTSSettings
                    settings={ttsSettings}
                    onChange={setTtsSettings}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: 解説授業生成 */}
          {selectedMaterialId && title && (
            <Card className="glass-morphism bg-white/50 border-white/20 backdrop-blur-sm animate-in slide-in-from-top-5 duration-300 delay-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full text-white font-bold text-sm">
                    4
                  </div>
                  <Sparkles className="h-5 w-5 text-orange-600" />
                  <span>AI解説授業を生成</span>
                </CardTitle>
                <CardDescription className="ml-11 text-gray-600">
                  Gemini 2.5を使用して解説授業形式の音声教材を生成します。
                  クイズの内容と関連PDF資料を基に、分かりやすい授業スクリプトを作成します。
                </CardDescription>
              </CardHeader>
              <CardContent className="ml-11 space-y-6">
                <div className="glass-morphism bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-amber-200/50 backdrop-blur-sm rounded-xl p-5">
                  <h4 className="font-semibold text-amber-800 mb-3 flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>生成される内容</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="text-sm text-amber-700 space-y-2">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                        <span>導入部分で学習目標を明確化</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                        <span>各トピックの論理的な解説</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                        <span>具体例や実例を交えた説明</span>
                      </li>
                    </ul>
                    <ul className="text-sm text-amber-700 space-y-2">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                        <span>重要ポイントの強調と繰り返し</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                        <span>最後に要点をまとめた振り返り</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                        <span>自然な話し言葉で構成</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Generation Progress */}
                {creating && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">生成進捗</span>
                      <span className="text-blue-600 font-medium">{Math.round(generationProgress)}%</span>
                    </div>
                    <Progress value={generationProgress} className="h-2 bg-gray-200" />
                    {generationProgress > 0 && generationProgress < 100 && (
                      <p className="text-sm text-gray-600 animate-pulse">
                        AIが解説授業スクリプトを作成中...
                      </p>
                    )}
                  </div>
                )}

                {/* Audio Preview */}
                {audioPreview && (
                  <div className="glass-morphism bg-white/70 border-white/30 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">音声プレビュー</h4>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={toggleAudioPreview}
                          className="glass-morphism border-white/30"
                        >
                          {audioPreview.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={downloadAudio}
                          className="glass-morphism border-white/30"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <audio
                      ref={audioRef}
                      src={audioPreview.url}
                      onEnded={() => setAudioPreview(prev => prev ? { ...prev, isPlaying: false } : null)}
                      className="w-full"
                      controls
                    />
                  </div>
                )}

                <Button
                  onClick={handleCreateAudioMaterial}
                  disabled={creating}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      AI解説授業を生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-3 h-5 w-5" />
                      AI解説授業を生成する
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}