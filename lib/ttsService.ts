import { apiRequest } from './apiUtils';

// TTS関連の型定義
export interface TTSRequest {
  text: string;
  voiceName?: string;
}

export interface TTSResponse {
  success: boolean;
  message: string;
  audioUrl?: string;
  sourceText?: string;
  error?: string;
}

export interface MaterialAudioRequest {
  materialId: string;
  materialText: string;
  title?: string;
}

export interface MaterialAudioResponse {
  success: boolean;
  message: string;
  materialId?: string;
  title?: string;
  audioUrl?: string;
  sourceText?: string;
  error?: string;
}

/**
 * TTS関連のAPI呼び出しを管理するサービスクラス
 */
export class TTSService {
  /**
   * テキストから音声を生成する
   * @param request テキストと音声設定
   * @returns 音声URL等のレスポンス
   */
  static async generateTTS(request: TTSRequest): Promise<TTSResponse> {
    try {
      const response = await apiRequest<TTSResponse>('/api/tts/generate', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      
      return response;
    } catch (error) {
      console.error('TTS生成エラー:', error);
      return {
        success: false,
        message: '音声生成中にエラーが発生しました',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 教材のテキストから音声教材を生成する
   * @param request 教材情報
   * @returns 音声教材情報
   */
  static async generateMaterialAudio(request: MaterialAudioRequest): Promise<MaterialAudioResponse> {
    try {
      const response = await apiRequest<MaterialAudioResponse>('/api/tts/material-audio', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      
      return response;
    } catch (error) {
      console.error('音声教材生成エラー:', error);
      return {
        success: false,
        message: '音声教材生成中にエラーが発生しました',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
