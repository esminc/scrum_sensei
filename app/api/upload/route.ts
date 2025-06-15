import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { safeJsonParse } from '@/lib/jsonUtils';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch {}
}

export async function POST(req: NextRequest) {
  await ensureUploadDir();
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'PDFファイルがありません' }, { status: 400 });
  }
  const ext = extname(file.name) || '.pdf';
  const fileName = `${file.name.replace(/\.[^/.]+$/, '')}_${randomUUID()}${ext}`;
  const savePath = join(UPLOAD_DIR, fileName);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  try {
    await writeFile(savePath, buffer);
    
    // DB保存（materialsテーブルに保存）
    const { getDb } = await import('@/lib/dbUtils');
    const db = await getDb();
    
    const now = new Date().toISOString();
    const result = await db.run(
      `INSERT INTO materials (title, description, content, type, file_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      file.name.replace(/\.[^/.]+$/, ''), // タイトル（拡張子除去）
      `アップロードされたPDFファイル: ${file.name}`, // 説明
      JSON.stringify([]), // コンテンツ（チャンク）
      'pdf', // タイプ
      `/uploads/${fileName}`, // ファイルパス
      now,
      now
    );
    
    const materialId = result.lastID;
    
    return NextResponse.json({ 
      success: true, 
      materialId,
      fileName,
      questions: [],
      chunks: [],
      metadata: {}
    });
  } catch (e) {
    console.error('UPLOAD API ERROR:', e);
    return NextResponse.json({ error: 'ファイル保存またはMastra連携に失敗しました' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'GETメソッドは許可されていません' }, { status: 405 });
}
