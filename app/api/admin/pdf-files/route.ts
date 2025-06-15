import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbUtils';
import path from 'path';
import fs from 'fs/promises';

/**
 * PDFファイル一覧を取得するAPIエンドポイント
 * GET /api/admin/pdf-files
 */
export async function GET() {
  try {
    const db = await getDb();
    
    // materialsテーブルからPDFタイプのファイルを取得
    const pdfMaterials = await db.all(`
      SELECT id, title, description, file_path, created_at, updated_at
      FROM materials 
      WHERE type = 'pdf' AND file_path IS NOT NULL
      ORDER BY created_at DESC
    `);

    // ファイルの存在確認とURL生成
    const pdfFiles = await Promise.all(
      pdfMaterials.map(async (material) => {
        try {
          const filePath = path.join(process.cwd(), 'public', material.file_path);
          await fs.access(filePath);
          
          return {
            id: material.id.toString(),
            filename: path.basename(material.file_path),
            title: material.title,
            description: material.description,
            url: material.file_path,
            created_at: material.created_at,
            updated_at: material.updated_at
          };
        } catch (error) {
          // ファイルが存在しない場合はnullを返す
          return null;
        }
      })
    );

    // nullを除外
    const validPdfFiles = pdfFiles.filter(file => file !== null);

    return NextResponse.json({
      success: true,
      files: validPdfFiles
    });

  } catch (error) {
    console.error('PDFファイル一覧取得エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'PDFファイル一覧の取得中にエラーが発生しました' 
      },
      { status: 500 }
    );
  }
}

/**
 * PDFファイルを削除するAPIエンドポイント
 * DELETE /api/admin/pdf-files?id=<material_id>
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const materialId = searchParams.get('id');

    if (!materialId) {
      return NextResponse.json(
        { success: false, error: '教材IDが必要です' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // 教材情報を取得
    const material = await db.get(`
      SELECT id, file_path, title
      FROM materials 
      WHERE id = ? AND type = 'pdf'
    `, materialId);

    if (!material) {
      return NextResponse.json(
        { success: false, error: '指定されたPDF教材が見つかりません' },
        { status: 404 }
      );
    }

    // ファイルの削除
    if (material.file_path) {
      try {
        const filePath = path.join(process.cwd(), 'public', material.file_path);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn('ファイル削除警告:', fileError);
        // ファイルが既に存在しない場合は警告のみ
      }
    }

    // データベースから削除
    await db.run('DELETE FROM materials WHERE id = ?', materialId);

    return NextResponse.json({
      success: true,
      message: `PDF教材「${material.title}」を削除しました`
    });

  } catch (error) {
    console.error('PDF削除エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'PDFファイルの削除中にエラーが発生しました' 
      },
      { status: 500 }
    );
  }
}