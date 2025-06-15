'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, Download, Eye, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AudioMaterial {
  id: number;
  title: string;
  description: string;
  audio_path: string;
  created_at: string;
  materialId: number;
  materialTitle: string;
}

interface AudioMaterialPreviewProps {
  materials: AudioMaterial[];
  onRefresh: () => void;
}

export default function AudioMaterialPreview({ materials, onRefresh }: AudioMaterialPreviewProps) {
  const [playing, setPlaying] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<{ [key: number]: number }>({});
  const [duration, setDuration] = useState<{ [key: number]: number }>({});
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement }>({});

  // 音声ファイルの削除
  const deleteMaterial = async (id: number) => {
    if (!confirm('この音声教材を削除してもよろしいですか？')) return;
    
    try {
      const response = await fetch(`/scrum_sensei/api/admin/audio-materials/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('音声教材の削除に失敗しました');
      }
      
      alert('音声教材が削除されました');
      onRefresh();
    } catch (error) {
      console.error('削除エラー:', error);
      alert(error instanceof Error ? error.message : '削除に失敗しました');
    }
  };

  // 音声再生/停止
  const togglePlayback = (id: number) => {
    const audio = audioRefs.current[id];
    if (!audio) return;

    if (playing === id) {
      audio.pause();
      setPlaying(null);
    } else {
      // 他の音声を停止
      Object.values(audioRefs.current).forEach(a => a.pause());
      setPlaying(id);
      audio.play();
    }
  };

  // 音声要素のセットアップ
  const setupAudio = (id: number, audioPath: string) => {
    if (audioRefs.current[id]) return;

    const audio = new Audio(`/uploads/${audioPath}`);
    audioRefs.current[id] = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(prev => ({ ...prev, [id]: audio.duration }));
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(prev => ({ ...prev, [id]: audio.currentTime }));
    });

    audio.addEventListener('ended', () => {
      setPlaying(null);
    });
  };

  // 時間フォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">音声教材一覧</h3>
        <Button onClick={onRefresh} variant="outline" size="sm">
          更新
        </Button>
      </div>

      {materials.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            音声教材がありません
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {materials.map((material) => {
            setupAudio(material.id, material.audio_path);
            const isPlaying = playing === material.id;
            const progress = duration[material.id] 
              ? (currentTime[material.id] || 0) / duration[material.id] * 100 
              : 0;

            return (
              <Card key={material.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{material.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                      <Badge variant="outline" className="mt-2">
                        元教材: {material.materialTitle}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{material.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium">説明</h4>
                              <p className="text-gray-600">{material.description}</p>
                            </div>
                            <div>
                              <h4 className="font-medium">作成日</h4>
                              <p className="text-gray-600">
                                {new Date(material.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium">元となった教材</h4>
                              <p className="text-gray-600">{material.materialTitle}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `/uploads/${material.audio_path}`;
                          link.download = `${material.title}.wav`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMaterial(material.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* 音声コントロール */}
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePlayback(material.id)}
                        className="flex items-center space-x-1"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isPlaying ? '停止' : '再生'}</span>
                      </Button>
                      
                      <Volume2 className="w-4 h-4 text-gray-500" />
                      
                      <div className="flex-1 text-sm text-gray-600">
                        {formatTime(currentTime[material.id] || 0)} / {formatTime(duration[material.id] || 0)}
                      </div>
                    </div>

                    {/* プログレスバー */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* メタデータ */}
                    <div className="text-xs text-gray-500">
                      作成日: {new Date(material.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}