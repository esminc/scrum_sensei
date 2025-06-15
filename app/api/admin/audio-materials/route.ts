import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbUtils';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    // materialsテーブルから音声タイプの教材を取得
    const materials = await db.all(`
      SELECT 
        id,
        title,
        description,
        file_path as audio_path,
        created_at,
        content
      FROM materials
      WHERE type = 'audio'
      ORDER BY created_at DESC
    `);
    
    // contentからoriginalMaterialIdを抽出
    const processedMaterials = materials.map(material => {
      let originalMaterialId = null;
      let materialTitle = null;
      
      try {
        if (material.content) {
          const contentData = JSON.parse(material.content);
          originalMaterialId = contentData.originalMaterialId;
          materialTitle = contentData.originalTitle;
        }
      } catch (error) {
        console.warn('Content parsing warning:', error);
      }
      
      return {
        id: material.id,
        title: material.title,
        description: material.description,
        audio_path: material.audio_path,
        created_at: material.created_at,
        materialId: originalMaterialId,
        materialTitle: materialTitle
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      materials: processedMaterials || [],
      count: processedMaterials.length
    });
    
  } catch (error) {
    console.error('音声教材取得エラー:', error);
    return NextResponse.json(
      { error: '音声教材の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}