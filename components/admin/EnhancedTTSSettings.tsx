'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, BarChart3, Mic, Volume2, Zap } from 'lucide-react';

export interface TTSSettings {
  voice: string;
  model: string;
  language: string;
  style: string;
}

interface TTSSettingsProps {
  settings: TTSSettings;
  onChange: (settings: TTSSettings) => void;
}

const voiceOptions = [
  { value: 'Kore', label: 'Kore - 明るい' },
  { value: 'Fenrir', label: 'Fenrir - 興奮しやすい' },
  { value: 'Orus', label: 'Orus - 企業向け' },
  { value: 'Autonoe', label: 'Autonoe - 明るい' },
  { value: 'Umbriel', label: 'Umbriel - 気楽な' },
  { value: 'Erinome', label: 'Erinome - クリア' },
  { value: 'Laomedeia', label: 'Laomedeia - アップビート' },
  { value: 'Schedar', label: 'Schedar - 均等' },
  { value: 'Achird', label: 'Achird - フレンドリー' },
  { value: 'Sadachbia', label: 'Sadachbia - 活発' },
  { value: 'Zephyr', label: 'Zephyr - 明るい' },
  { value: 'Charon', label: 'Charon - 情報提供' },
  { value: 'Leda', label: 'Leda - 若々しい' },
  { value: 'Aoede', label: 'Aoede - 爽やか' },
  { value: 'Callirrhoe', label: 'Callirrhoe - おおらか' },
  { value: 'Enceladus', label: 'Enceladus - 息づかい' },
  { value: 'Iapetus', label: 'Iapetus - クリア' },
  { value: 'Algieba', label: 'Algieba - スムーズ' },
  { value: 'Despina', label: 'Despina - スムーズ' },
  { value: 'Algenib', label: 'Algenib - 砂利' },
  { value: 'Rasalgethi', label: 'Rasalgethi - 情報に富む' },
  { value: 'Alnilam', label: 'Alnilam - 確実' },
  { value: 'Gacrux', label: 'Gacrux - 大人向け' },
  { value: 'Pulcherrima', label: 'Pulcherrima - 前向き' },
  { value: 'Zubenelgenubi', label: 'Zubenelgenubi - カジュアル' },
  { value: 'Vindemiatrix', label: 'Vindemiatrix - 優しい' },
  { value: 'Sadaltager', label: 'Sadaltager - 知識豊富' },
  { value: 'Sulafat', label: 'Sulafat - 温かい' },
  { value: 'Puck', label: 'Puck - アップビート' },
];

const modelOptions = [
  { value: 'gemini-2.5-flash-preview-tts', label: 'Gemini 2.5 Flash TTS (推奨)' },
  { value: 'gemini-2.5-pro-preview-tts', label: 'Gemini 2.5 Pro TTS (高品質)' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (非TTS)' },
];

const languageOptions = [
  { value: 'ja-JP', label: '日本語' },
  { value: 'en-US', label: '英語 (米国)' },
  { value: 'en-GB', label: '英語 (英国)' },
];

const styleOptions = [
  { value: 'clear and friendly', label: 'クリアでフレンドリー' },
  { value: 'calm and professional', label: '落ち着いたプロフェッショナル' },
  { value: 'enthusiastic and engaging', label: '熱心で魅力的' },
  { value: 'warm and encouraging', label: '温かく励ます' },
  { value: 'confident and authoritative', label: '自信に満ちた権威的' },
  { value: 'conversational and relaxed', label: '会話的でリラックス' },
];

export default function EnhancedTTSSettings({ settings, onChange }: TTSSettingsProps) {
  const [realtimePreview, setRealtimePreview] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'voice' | 'model' | 'style'>('voice');
  
  const updateSetting = (key: keyof TTSSettings, value: any) => {
    onChange({
      ...settings,
      [key]: value,
    });
    
    // Real-time preview notification
    if (realtimePreview) {
      console.log(`🔄 TTS設定更新: ${key} = ${value}`);
    }
  };

  // Categorize voice options for better organization
  const voiceCategories = {
    bright: voiceOptions.filter(v => v.label.includes('明るい') || v.label.includes('アップビート') || v.label.includes('活発')),
    professional: voiceOptions.filter(v => v.label.includes('企業向け') || v.label.includes('確実') || v.label.includes('権威')),
    friendly: voiceOptions.filter(v => v.label.includes('フレンドリー') || v.label.includes('温かい') || v.label.includes('優しい')),
    clear: voiceOptions.filter(v => v.label.includes('クリア') || v.label.includes('スムーズ') || v.label.includes('情報')),
    other: voiceOptions.filter(v => !v.label.includes('明るい') && !v.label.includes('アップビート') && !v.label.includes('活発') && !v.label.includes('企業向け') && !v.label.includes('確実') && !v.label.includes('権威') && !v.label.includes('フレンドリー') && !v.label.includes('温かい') && !v.label.includes('優しい') && !v.label.includes('クリア') && !v.label.includes('スムーズ') && !v.label.includes('情報'))
  };

  const getVoiceCategory = (voiceName: string) => {
    for (const [category, voices] of Object.entries(voiceCategories)) {
      if (voices.some(v => v.value === voiceName)) {
        return category;
      }
    }
    return 'other';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'voice': return <Mic className="h-4 w-4" />;
      case 'model': return <Zap className="h-4 w-4" />;
      case 'style': return <BarChart3 className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'voice': return 'from-blue-500 to-cyan-600';
      case 'model': return 'from-purple-500 to-pink-600';
      case 'style': return 'from-green-500 to-teal-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Category Tabs */}
      <div className="flex space-x-2">
        {(['voice', 'model', 'style'] as const).map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={`glass-morphism transition-all duration-200 ${
              selectedCategory === category
                ? `bg-gradient-to-r ${getCategoryColor(category)} text-white border-white/20`
                : 'border-white/20 hover:bg-white/20'
            }`}
          >
            {getCategoryIcon(category)}
            <span className="ml-2 capitalize">
              {category === 'voice' ? '音声' : category === 'model' ? 'モデル' : 'スタイル'}
            </span>
          </Button>
        ))}
      </div>

      {/* Real-time Preview Toggle */}
      <div className="flex items-center justify-between glass-morphism bg-white/30 border-white/20 backdrop-blur-sm rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">リアルタイムプレビュー</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRealtimePreview(!realtimePreview)}
          className={`glass-morphism transition-all duration-200 ${
            realtimePreview
              ? 'bg-green-500/20 border-green-300/50 text-green-700'
              : 'border-white/20 hover:bg-white/20'
          }`}
        >
          {realtimePreview ? 'オン' : 'オフ'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* AIモデル選択 */}
        {(selectedCategory === 'model' || selectedCategory === 'voice') && (
          <div className="space-y-3 animate-in slide-in-from-top-5 duration-300">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <Label htmlFor="model" className="text-sm font-semibold text-gray-700">AIモデル</Label>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                最新
              </Badge>
            </div>
            <Select value={settings.model} onValueChange={(value) => updateSetting('model', value)}>
              <SelectTrigger className="glass-morphism bg-white/70 border-white/30 backdrop-blur-sm hover:bg-white/80 transition-all duration-200">
                <SelectValue placeholder="モデルを選択" />
              </SelectTrigger>
              <SelectContent className="glass-morphism bg-white/90 border-white/30 backdrop-blur-md shadow-xl">
                {modelOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value} 
                    className="hover:bg-white/50 transition-colors duration-150"
                  >
                    <div className="flex items-center space-x-2">
                      <span>{option.label}</span>
                      {option.value.includes('2.5') && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          推奨
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 音声選択 */}
        {(selectedCategory === 'voice' || selectedCategory === 'model') && (
          <div className="space-y-3 animate-in slide-in-from-top-5 duration-300 delay-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mic className="h-4 w-4 text-blue-600" />
                <Label htmlFor="voice" className="text-sm font-semibold text-gray-700">音声キャラクター</Label>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                  {Object.keys(voiceCategories).length}カテゴリー
                </Badge>
              </div>
              <Badge variant="outline" className="text-xs">
                現在: {getVoiceCategory(settings.voice)}
              </Badge>
            </div>
            <Select value={settings.voice} onValueChange={(value) => updateSetting('voice', value)}>
              <SelectTrigger className="glass-morphism bg-white/70 border-white/30 backdrop-blur-sm hover:bg-white/80 transition-all duration-200">
                <SelectValue placeholder="音声を選択" />
              </SelectTrigger>
              <SelectContent className="glass-morphism bg-white/90 border-white/30 backdrop-blur-md shadow-xl max-h-80 overflow-y-auto">
                {Object.entries(voiceCategories).map(([categoryName, voices]) => (
                  voices.length > 0 && (
                    <div key={categoryName}>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50/50">
                        {categoryName === 'bright' ? '明るい・活発' :
                         categoryName === 'professional' ? 'プロフェッショナル' :
                         categoryName === 'friendly' ? 'フレンドリー・温かい' :
                         categoryName === 'clear' ? 'クリア・情報的' : 'その他'}
                      </div>
                      {voices.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value} 
                          className="hover:bg-white/50 transition-colors duration-150 ml-2"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </div>
                  )
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 言語選択 */}
        {(selectedCategory === 'voice' || selectedCategory === 'style') && (
          <div className="space-y-3 animate-in slide-in-from-top-5 duration-300 delay-200">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🌐</span>
              <Label htmlFor="language" className="text-sm font-semibold text-gray-700">言語</Label>
            </div>
            <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
              <SelectTrigger className="glass-morphism bg-white/70 border-white/30 backdrop-blur-sm hover:bg-white/80 transition-all duration-200">
                <SelectValue placeholder="言語を選択" />
              </SelectTrigger>
              <SelectContent className="glass-morphism bg-white/90 border-white/30 backdrop-blur-md shadow-xl">
                {languageOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value} 
                    className="hover:bg-white/50 transition-colors duration-150"
                  >
                    <div className="flex items-center space-x-2">
                      <span>{option.label}</span>
                      {option.value === 'ja-JP' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          推奨
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 音声スタイル選択 */}
        {(selectedCategory === 'style' || selectedCategory === 'voice') && (
          <div className="space-y-3 animate-in slide-in-from-top-5 duration-300 delay-300">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-green-600" />
              <Label htmlFor="style" className="text-sm font-semibold text-gray-700">音声スタイル</Label>
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                教育特化
              </Badge>
            </div>
            <Select value={settings.style} onValueChange={(value) => updateSetting('style', value)}>
              <SelectTrigger className="glass-morphism bg-white/70 border-white/30 backdrop-blur-sm hover:bg-white/80 transition-all duration-200">
                <SelectValue placeholder="スタイルを選択" />
              </SelectTrigger>
              <SelectContent className="glass-morphism bg-white/90 border-white/30 backdrop-blur-md shadow-xl">
                {styleOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value} 
                    className="hover:bg-white/50 transition-colors duration-150"
                  >
                    <div className="flex items-center space-x-2">
                      <span>{option.label}</span>
                      {option.value === 'clear and friendly' && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                          デフォルト
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* プリセット */}
      <div className="glass-morphism bg-white/40 border-white/20 backdrop-blur-sm rounded-xl p-5">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="h-4 w-4 text-gray-600" />
          <Label className="text-sm font-semibold text-gray-700">クイック設定プリセット</Label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => onChange({
              voice: 'Kore',
              model: 'gemini-2.5-flash-preview-tts',
              language: 'ja-JP',
              style: 'clear and friendly'
            })}
            className="glass-morphism bg-blue-500/10 hover:bg-blue-500/20 border-blue-200/50 backdrop-blur-sm rounded-lg p-3 text-left transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-blue-700 text-sm">標準設定</span>
            </div>
            <p className="text-xs text-blue-600">バランスの取れた設定</p>
          </button>
          <button
            onClick={() => onChange({
              voice: 'Charon',
              model: 'gemini-2.5-pro-preview-tts',
              language: 'ja-JP',
              style: 'calm and professional'
            })}
            className="glass-morphism bg-green-500/10 hover:bg-green-500/20 border-green-200/50 backdrop-blur-sm rounded-lg p-3 text-left transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-700 text-sm">高品質</span>
            </div>
            <p className="text-xs text-green-600">プロフェッショナル向け</p>
          </button>
          <button
            onClick={() => onChange({
              voice: 'Puck',
              model: 'gemini-2.5-flash-preview-tts',
              language: 'ja-JP',
              style: 'enthusiastic and engaging'
            })}
            className="glass-morphism bg-orange-500/10 hover:bg-orange-500/20 border-orange-200/50 backdrop-blur-sm rounded-lg p-3 text-left transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="font-medium text-orange-700 text-sm">授業向け</span>
            </div>
            <p className="text-xs text-orange-600">教育コンテンツ専用</p>
          </button>
        </div>
      </div>
    </div>
  );
}