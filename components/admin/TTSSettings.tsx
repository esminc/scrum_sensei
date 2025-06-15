'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function TTSSettings({ settings, onChange }: TTSSettingsProps) {
  const updateSetting = (key: keyof TTSSettings, value: any) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          音声合成設定
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 音声モデル選択 */}
        <div className="space-y-2">
          <Label htmlFor="model">AIモデル</Label>
          <Select value={settings.model} onValueChange={(value) => updateSetting('model', value)}>
            <SelectTrigger>
              <SelectValue placeholder="モデルを選択" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              {modelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 音声選択 */}
        <div className="space-y-2">
          <Label htmlFor="voice">音声</Label>
          <Select value={settings.voice} onValueChange={(value) => updateSetting('voice', value)}>
            <SelectTrigger>
              <SelectValue placeholder="音声を選択" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg max-h-60 overflow-y-auto">
              {voiceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 言語選択 */}
        <div className="space-y-2">
          <Label htmlFor="language">言語</Label>
          <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
            <SelectTrigger>
              <SelectValue placeholder="言語を選択" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 音声スタイル選択 */}
        <div className="space-y-2">
          <Label htmlFor="style">音声スタイル</Label>
          <Select value={settings.style} onValueChange={(value) => updateSetting('style', value)}>
            <SelectTrigger>
              <SelectValue placeholder="スタイルを選択" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              {styleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>


        {/* プリセット */}
        <div className="border-t pt-4">
          <Label className="text-sm font-medium">プリセット</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => onChange({
                voice: 'Kore',
                model: 'gemini-2.5-flash-preview-tts',
                language: 'ja-JP',
                style: 'clear and friendly'
              })}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              標準設定
            </button>
            <button
              onClick={() => onChange({
                voice: 'Charon',
                model: 'gemini-2.5-pro-preview-tts',
                language: 'ja-JP',
                style: 'calm and professional'
              })}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
            >
              高品質
            </button>
            <button
              onClick={() => onChange({
                voice: 'Puck',
                model: 'gemini-2.5-flash-preview-tts',
                language: 'ja-JP',
                style: 'enthusiastic and engaging'
              })}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200"
            >
              授業向け
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}