import { NextRequest, NextResponse } from 'next/server';
import { contentCreator, simpleCoach } from '@/lib/ai/agents';

export async function POST(request: NextRequest) {
  try {
    const { agentName, messages, context } = await request.json();

    let result: string;
    switch (agentName) {
      case 'content-creator':
        result = await contentCreator.generateContent(messages[0]?.content || '', context);
        break;
      case 'simple-coach':
        result = await simpleCoach.generateResponse(messages);
        break;
      default:
        return NextResponse.json(
          { error: 'Unknown agent' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
      metadata: {
        agentName,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Agent execution error:', error);
    return NextResponse.json(
      { 
        error: 'Agent execution failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    agents: [
      { name: 'content-creator', description: 'コンテンツ生成エージェント' },
      { name: 'simple-coach', description: 'シンプルなコーチエージェント' }
    ]
  });
}