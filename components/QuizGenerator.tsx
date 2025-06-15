'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { get, post } from '@/lib/api/client';
import { QuizDifficulty, QuizQuestion } from '@/lib/models/quiz';

type QuizGeneratorProps = {
  onQuizGenerated: (questions: QuizQuestion[]) => void;
};

// PDFファイルの型定義
type PDFFile = {
  id: string;
  filename: string;
  url: string;
};

export default function QuizGenerator({ onQuizGenerated }: QuizGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // PDFファイル関連の状態
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const [isServerOnline, setIsServerOnline] = useState<boolean>(true);
  const [serverErrorDetails, setServerErrorDetails] = useState<{
    message?: string;
    action?: string;
  }>({});

  // コンポーネント初期化時にPDFファイル一覧を取得
  useEffect(() => {
    fetchPdfFiles();
    checkServerStatus();
  }, []);

  // PDFファイル一覧を取得する関数
  const fetchPdfFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const data = await get('admin/upload');
      if (data.success && Array.isArray(data.files)) {
        setPdfFiles(data.files);
      } else {
        console.error("PDFファイル一覧の取得に失敗しました");
      }
    } catch (error) {
      console.error("PDFファイル一覧の取得中にエラーが発生しました", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // サーバー状態をチェックする関数
  const checkServerStatus = async () => {
    try {
      await get('mastra/health');
      setIsServerOnline(true);
      setServerErrorDetails({});
    } catch (error) {
      console.error("サーバー状態チェックエラー:", error);
      setIsServerOnline(false);
      
      const errorMessage = "Mastraサーバーが応答していません";
      const errorAction = "サーバーの状態を確認してください";
      
      setServerErrorDetails({
        message: errorMessage,
        action: errorAction
      });
    }
  };

  const generateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('問題生成APIを呼び出しています...');
      console.log(`パラメータ: トピック=${topic}, 難易度=${difficulty}, 問題数=${questionCount}, PDF=${selectedFile || 'なし'}`);
      
      const data = await post('generate-quiz', {
        topic,
        difficulty,
        questionCount,
        // 選択されたPDFファイルのIDを送信
        pdfFileId: selectedFile || undefined
      });

      console.log('問題生成完了:', data);
      
      if (data.generationMethod === 'local-fallback') {
        console.warn('注意: Mastraエージェントでの生成に失敗したため、ローカル生成にフォールバックしました');
      }
      
      // APIから返された問題データを直接使用
      onQuizGenerated(data.questions || []);
    } catch (err) {
      console.error('問題生成エラー:', err);
      setError(err instanceof Error ? err.message : '問題生成中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">問題生成</h2>
      {error && (
        <Alert className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!isServerOnline && (
        <Alert className="mb-4">
          <AlertDescription>
            {serverErrorDetails.message}
            <br />
            {serverErrorDetails.action}
          </AlertDescription>
        </Alert>
      )}
      <form onSubmit={generateQuiz}>
        <div className="mb-4">
          <Label htmlFor="topic">トピック</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="問題を生成するトピックを入力"
            required
          />
        </div>
        
        {/* PDFファイル選択 */}
        <div className="mb-4">
          <Label htmlFor="pdfFile">使用するPDFファイル（オプション）</Label>
          <div className="relative">
            <select
              id="pdfFile"
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoadingFiles || pdfFiles.length === 0}
            >
              <option value="">選択なし（全コンテンツから生成）</option>
              {pdfFiles.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.filename}
                </option>
              ))}
            </select>
            {isLoadingFiles && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            PDFファイルを選択すると、選択したファイルの内容から問題が生成されます。選択しない場合は全てのコンテンツから生成されます。
          </p>
          <div className="flex justify-end mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchPdfFiles}
              disabled={isLoadingFiles}
              className="text-xs"
            >
              {isLoadingFiles ? '更新中...' : 'ファイル一覧を更新'}
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <Label htmlFor="difficulty">難易度</Label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="beginner">初級</option>
            <option value="intermediate">中級</option>
            <option value="advanced">上級</option>
          </select>
        </div>
        
        <div className="mb-6">
          <Label htmlFor="questionCount">問題数</Label>
          <Input
            id="questionCount"
            type="number"
            min={1}
            max={10}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
          />
        </div>
        
        <Button type="submit" disabled={isLoading || !topic || !isServerOnline} className="w-full">
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </>
          ) : (
            '問題を生成する'
          )}
        </Button>
      </form>
    </Card>
  );
}