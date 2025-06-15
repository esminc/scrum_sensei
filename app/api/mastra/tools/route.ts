import { NextRequest, NextResponse } from 'next/server';
import { 
  generateQuiz, 
  processPdf, 
  trackProgress, 
  findResources 
} from '@/lib/ai/tools';

export async function POST(request: NextRequest) {
  try {
    const { toolName, context } = await request.json();

    let result: any;
    switch (toolName) {
      case 'quiz-generator':
        result = await generateQuiz(context);
        break;
      case 'pdf-processor':
        result = await processPdf(context);
        break;
      case 'progress-tracker':
        result = await trackProgress(context);
        break;
      case 'resource-finder':
        result = await findResources(context);
        break;
      default:
        return NextResponse.json(
          { error: 'Unknown tool' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
      metadata: {
        toolName,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Tool execution error:', error);
    return NextResponse.json(
      { 
        error: 'Tool execution failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    tools: [
      { name: 'quiz-generator', description: '問題生成ツール' },
      { name: 'pdf-processor', description: 'PDFプロセッサツール' },
      { name: 'progress-tracker', description: '進捗追跡ツール' },
      { name: 'resource-finder', description: 'リソース検索ツール' }
    ]
  });
}