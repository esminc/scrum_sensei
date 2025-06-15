import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { mkdir } from 'fs/promises';
import { handleApiError } from '@/lib/apiUtils';

// アップロードディレクトリのパス
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// ディレクトリが存在することを確認する関数
async function ensureDirectoryExists(directory: string) {
  try {
    await fs.promises.access(directory);
  } catch {
    // ディレクトリが存在しない場合は作成
    await mkdir(directory, { recursive: true });
    console.log(`Directory created: ${directory}`);
  }
}

// PDF一覧を取得するハンドラー
export async function GET() {
  try {
    // アップロードディレクトリが存在することを確認
    await ensureDirectoryExists(UPLOAD_DIR);

    // ディレクトリ内のファイル一覧を取得
    const files = await fs.promises.readdir(UPLOAD_DIR);
    
    // PDFファイルのみをフィルタリング
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

    // レスポンスデータを構築
    const fileData = pdfFiles.map(filename => ({
      id: filename,
      filename,
      url: `/uploads/${filename}`
    }));

    return NextResponse.json({ success: true, files: fileData });
  } catch (error) {
    return handleApiError(error, 'PDFファイルの取得に失敗しました');
  }
}

// PDFアップロードハンドラー
export async function POST(request: NextRequest) {
  try {
    // アップロードディレクトリが存在することを確認
    await ensureDirectoryExists(UPLOAD_DIR);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'ファイルが送信されていません' },
        { status: 400 }
      );
    }

    // PDFファイル形式チェック
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, message: 'PDFファイルのみアップロード可能です' },
        { status: 400 }
      );
    }

    // ユニークなファイル名を生成
    const fileExt = path.extname(file.name);
    const fileName = path.basename(file.name, fileExt);
    const uniqueFileName = `${fileName}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}${fileExt}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFileName);

    // ファイルの内容を取得
    const buffer = Buffer.from(await file.arrayBuffer());

    // ファイルを保存
    await fs.promises.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      message: 'アップロード成功',
      file: {
        id: uniqueFileName,
        filename: file.name,
        url: `/uploads/${uniqueFileName}`
      }
    });
  } catch (error) {
    return handleApiError(error, 'ファイルアップロードに失敗しました');
  }
}

// ファイル削除ハンドラー
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { success: false, message: 'ファイル名が指定されていません' },
        { status: 400 }
      );
    }

    // セキュリティ対策: パスインジェクションを防ぐ
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, sanitizedFilename);

    // ファイルが存在するか確認
    try {
      await fs.promises.access(filePath);
    } catch {
      return NextResponse.json(
        { success: false, message: '指定されたファイルが見つかりません' },
        { status: 404 }
      );
    }

    // ファイルを削除
    await fs.promises.unlink(filePath);

    return NextResponse.json({
      success: true,
      message: 'ファイルが削除されました'
    });
  } catch (error) {
    return handleApiError(error, 'ファイル削除に失敗しました');
  }
}