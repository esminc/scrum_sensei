import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import fs from 'fs/promises';

// Node.js環境に必要なpolyfillを追加
if (typeof globalThis.DOMMatrix === 'undefined') {
  // 簡易的なDOMMatrix polyfill
  // @ts-expect-error - 簡易的なpolyfillのため型チェックをスキップ
  globalThis.DOMMatrix = class DOMMatrix {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(transform?: string | number[]) { /* 空の実装 */ }
  };
}

// pdfjsはクライアント側でのみimportする
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjs: any;
if (typeof window === 'undefined') {
  // サーバー側では動的importを使用
  import('pdfjs-dist').then((module) => {
    pdfjs = module;
    // Worker Sourcesの設定
    const pdfjsWorker = join(process.cwd(), 'node_modules/pdfjs-dist/build/pdf.worker.js');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  });
} else {
  // ブラウザ側
  import('pdfjs-dist').then((module) => {
    pdfjs = module;
  });
}

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

// PDFJSライブラリの型を回避するためのインターフェース
interface TextItem {
  str: string;
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const { fileName } = await req.json();
    
    if (!fileName) {
      return NextResponse.json(
        { error: 'ファイル名が指定されていません' },
        { status: 400 }
      );
    }
    
    const filePath = join(UPLOAD_DIR, fileName);
    
    // ファイルの存在確認
    try {
      await fs.access(filePath);
    } catch {
      // エラーの詳細は不要
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 404 }
      );
    }
    
    // ファイルを読み込む
    const data = await fs.readFile(filePath);
    const pdfData = new Uint8Array(data);
    
    // PDFJSモジュールが読み込まれていない場合は読み込む
    if (!pdfjs) {
      pdfjs = await import('pdfjs-dist');
      // Worker Sourcesの設定
      const pdfjsWorker = join(process.cwd(), 'node_modules/pdfjs-dist/build/pdf.worker.js');
      pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    }
    
    // PDFドキュメントの読み込み
    const loadingTask = pdfjs.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // 各ページからテキストを抽出
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      // 型アサーションを使用してPDFJSの複雑な型を回避
      const items = textContent.items as unknown as TextItem[];
      const pageText = items
        .map(item => item.str || '')
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    // テキストを整形（余分な空白や改行を削除）
    fullText = fullText
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
    
    return NextResponse.json({ 
      text: fullText,
      pageCount: pdf.numPages,
      fileName: fileName 
    });
    
  } catch (error) {
    console.error('PDFテキスト抽出エラー:', error);
    return NextResponse.json(
      { error: 'PDFからテキストの抽出に失敗しました' },
      { status: 500 }
    );
  }
}
