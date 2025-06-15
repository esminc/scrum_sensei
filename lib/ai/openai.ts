import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

console.log('🔑 OpenAI API Key Status:', {
  configured: !!apiKey,
  keyPrefix: apiKey?.substring(0, 30) || 'undefined',
  keySuffix: apiKey?.substring(apiKey.length - 10) || 'undefined',
  keyLength: apiKey?.length || 0
});

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY environment variable is not set');
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

if (!apiKey.startsWith('sk-')) {
  console.error('❌ Invalid OpenAI API key format');
  throw new Error('Invalid OpenAI API key format');
}

const openai = new OpenAI({
  apiKey: apiKey,
});

console.log('✅ OpenAI client initialized successfully');

// ChatMessage interface for type safety
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * OpenAI Chat Completions APIを使用してレスポンスを生成
 */
export async function generateChatResponse(
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  try {
    const {
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      maxTokens = 2000
    } = options;

    console.log('🤖 OpenAI API call:', {
      model,
      temperature,
      maxTokens,
      messageCount: messages.length
    });

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('OpenAI APIから有効なレスポンスが返されませんでした');
    }

    console.log('✅ OpenAI API response received:', {
      usage: response.usage,
      responseLength: content.length
    });

    return content;
  } catch (error) {
    console.error('❌ OpenAI API error:', error);
    
    if (error instanceof Error) {
      throw new Error(`OpenAI API呼び出しエラー: ${error.message}`);
    }
    
    throw new Error('OpenAI API呼び出し中に不明なエラーが発生しました');
  }
}

export default openai;
export { openai };
