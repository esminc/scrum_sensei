export const AI_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    maxTokens: 4000,
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    model: process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts',
    voice: process.env.GEMINI_TTS_VOICE || 'Kore',
    language: process.env.GEMINI_TTS_LANGUAGE || 'ja-JP',
  },
};

console.log('🛠️  AI Config Status:', {
  openaiConfigured: !!AI_CONFIG.openai.apiKey,
  googleConfigured: !!AI_CONFIG.google.apiKey,
  openaiKeyValid: AI_CONFIG.openai.apiKey?.startsWith('sk-') || false,
  googleKeyValid: AI_CONFIG.google.apiKey?.startsWith('AIza') || false
});

if (AI_CONFIG.openai.apiKey && AI_CONFIG.google.apiKey) {
  console.log('✅ All AI services configured successfully');
}

// 後方互換性のため（削除予定）
export const openAIConfig = AI_CONFIG.openai;
