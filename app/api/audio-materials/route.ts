import { NextRequest, NextResponse } from 'next/server';

// この実装はモックです。実際の実装では、データベースから音声教材のデータを取得します。
const mockAudioMaterials = [
  {
    id: 'audio-1',
    title: 'スクラム入門',
    description: 'スクラム開発の基礎について学ぶための音声教材',
    audioUrl: '/audio/sample-1.mp3',
    sourceText: 'スクラムは、複雑な製品開発のためのフレームワークです。スクラムの定義としては、スクラムガイドに記述されているとおりです。この定義は、スクラムの目的、コンポーネント、ルール、およびそれらがどのように連携して機能するかについて説明しています。',
    createdAt: '2025-06-01T12:00:00Z'
  },
  {
    id: 'audio-2',
    title: 'アジャイル基礎',
    description: 'アジャイル開発の基礎と原則',
    audioUrl: '/audio/sample-2.mp3',
    sourceText: 'アジャイルソフトウェア開発の価値観として、プロセスやツールよりも個人と対話を、包括的なドキュメントよりも動くソフトウェアを、契約交渉よりも顧客との協調を、計画に従うことよりも変化への対応を重視します。',
    createdAt: '2025-06-02T14:30:00Z'
  }
];

/**
 * 音声教材の一覧を取得するAPIエンドポイント
 * GET /api/audio-materials
 */
export async function GET(request: NextRequest) {
  try {
    // クエリパラメータからフィルタリング条件を取得（必要に応じて）
    const searchParams = request.nextUrl.searchParams;
    const materialId = searchParams.get('materialId');
    
    let materials = mockAudioMaterials;
    
    // 特定のIDが指定されている場合はフィルタリング
    if (materialId) {
      materials = materials.filter(material => material.id === materialId);
      
      if (materials.length === 0) {
        return NextResponse.json(
          { error: '指定されたIDの音声教材が見つかりませんでした' },
          { status: 404 }
        );
      }
      
      // 単一のアイテムの場合はオブジェクトとして返す
      return NextResponse.json(materials[0]);
    }
    
    // すべてのアイテムを配列として返す
    return NextResponse.json({ materials });
    
  } catch (error) {
    console.error('音声教材取得エラー:', error);
    
    return NextResponse.json(
      { error: '音声教材の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
