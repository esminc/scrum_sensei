import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, AlertCircle } from 'lucide-react';

interface AudioPlayerProps {
  title: string;
  audioUrl: string;
  sourceText?: string;
}

/**
 * 音声教材プレーヤーコンポーネント
 */
export function AudioPlayer({ title, audioUrl, sourceText }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [useWebSpeech, setUseWebSpeech] = useState(false);
  const [speechInitialized, setSpeechInitialized] = useState(false);

  useEffect(() => {
    // 音声ファイルの種類を確認
    if (audioUrl && audioUrl.endsWith('.json')) {
      // JSONファイルの場合はWeb Speech APIを使用
      setUseWebSpeech(true);
      setAudioAvailable('speechSynthesis' in window);
    } else if (audioUrl && (audioUrl.endsWith('.mp3') || audioUrl.endsWith('.wav'))) {
      // 実際の音声ファイルかどうかを確認
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        setUseWebSpeech(false);
        setAudioAvailable(true);
      };
      audio.onerror = () => {
        // 音声ファイルの読み込みに失敗した場合、Web Speech APIにフォールバック
        if (sourceText && 'speechSynthesis' in window) {
          setUseWebSpeech(true);
          setAudioAvailable(true);
        } else {
          setAudioAvailable(false);
        }
      };
      audio.src = audioUrl;
    } else {
      // ファイル拡張子が不明な場合、sourceTextがあればWeb Speech APIを使用
      if (sourceText && 'speechSynthesis' in window) {
        setUseWebSpeech(true);
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }
    }
  }, [audioUrl, sourceText]);

  // Speech synthesis初期化
  const initializeSpeechSynthesis = () => {
    if (!speechInitialized && 'speechSynthesis' in window) {
      console.log('Initializing speech synthesis');
      // 音声合成を初期化（最初のユーザーインタラクションで実行）
      const utterance = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(utterance);
      window.speechSynthesis.cancel();
      setSpeechInitialized(true);
    }
  };

  const handleWebSpeechPlay = () => {
    console.log('handleWebSpeechPlay called');
    console.log('sourceText:', sourceText ? sourceText.substring(0, 100) + '...' : 'undefined');
    console.log('speechSynthesis available:', 'speechSynthesis' in window);
    
    // 初期化していない場合は初期化
    if (!speechInitialized) {
      initializeSpeechSynthesis();
    }
    
    if (!sourceText || !('speechSynthesis' in window)) {
      console.log('Early return: no sourceText or speechSynthesis');
      return;
    }

    if (isPlaying) {
      console.log('Stopping speech');
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch (error) {
        console.warn('Error stopping speech synthesis:', error);
      }
      setIsPlaying(false);
    } else {
      console.log('Starting speech with text length:', sourceText.length);
      
      // 安全に音声合成を停止して、前の音声をクリア
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch (error) {
        console.warn('Cancel previous speech warning:', error);
      }
      
      // 少し待ってから新しい音声を開始
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(sourceText);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => {
          console.log('Speech started');
          setIsPlaying(true);
        };
        
        utterance.onend = () => {
          console.log('Speech ended');
          setIsPlaying(false);
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsPlaying(false);
          
          // 'interrupted'エラーは正常な停止として扱う
          if (event.error === 'interrupted') {
            console.log('Speech was interrupted (normal stop)');
          } else if (event.error === 'synthesis-failed') {
            console.warn('Speech synthesis failed, trying again...');
            // 短時間後に再試行
            setTimeout(() => {
              if (sourceText && !isPlaying) {
                handleWebSpeechPlay();
              }
            }, 1000);
          } else {
            console.error('Unhandled speech synthesis error:', event.error);
          }
        };
        
        console.log('Starting to speak...');
        window.speechSynthesis.speak(utterance);
      }, 100);
    }
  };

  return (
    <Card className="w-full shadow-md border-2 border-indigo-100">
      <CardHeader className="bg-indigo-100 py-5">
        <h3 className="font-bold text-2xl text-indigo-900">{title}</h3>
      </CardHeader>
      <CardContent className="pt-8 pb-6 px-6">
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-8">
          {audioAvailable ? (
            useWebSpeech ? (
              <div className="text-center">
                <Button
                  onClick={() => {
                    console.log('Button clicked, useWebSpeech:', useWebSpeech, 'audioAvailable:', audioAvailable);
                    handleWebSpeechPlay();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg"
                  disabled={!sourceText || sourceText.length === 0}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-6 h-6 mr-2" />
                      停止
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 mr-2" />
                      音声で聞く
                    </>
                  )}
                </Button>
                <p className="text-sm text-indigo-600 mt-2">
                  ブラウザの音声合成機能を使用します
                </p>
              </div>
            ) : (
              <audio controls className="w-full h-14">
                <source src={audioUrl} type="audio/mpeg" />
                お使いのブラウザは音声再生をサポートしていません
              </audio>
            )
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">音声が利用できません</p>
              <p className="text-sm text-gray-500">
                音声教材の生成処理が完了していない可能性があります
              </p>
            </div>
          )}
        </div>
        
        {sourceText && (
          <div className="mt-8 border-2 border-indigo-200 rounded-lg shadow-sm">
            <details>
              <summary className="font-semibold cursor-pointer p-5 text-lg text-indigo-800 bg-indigo-50 rounded-t-lg hover:bg-indigo-100 transition-colors flex items-center">
                <Volume2 className="h-6 w-6 mr-2" />
                音声のテキスト原稿を表示
              </summary>
              <div className="p-6 bg-white rounded-b-lg">
                <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
                  {sourceText}
                </p>
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
