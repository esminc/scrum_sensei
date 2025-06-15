import { NextRequest, NextResponse } from 'next/server';
import { advisorAgent } from '@/lib/ai/agents';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // アドバイスを生成
    const advice = await advisorAgent.generateAdviceForUser(userId);

    return NextResponse.json({
      success: true,
      advice,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Advice generation error:', error);
    return NextResponse.json(
      { 
        error: 'Advice generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}