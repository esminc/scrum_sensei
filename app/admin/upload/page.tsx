"use client";

import React, { useRef, useState, useEffect } from "react";
import AdminNav from "@/components/admin/AdminNav";


type PDFFile = {
  id: string;
  filename: string;
  url: string;
};

// 削除確認モーダルコンポーネント
const DeleteConfirmationModal = ({ 
  file, 
  onClose, 
  onConfirm, 
  isDeleting 
}: { 
  file: PDFFile | null; 
  onClose: () => void; 
  onConfirm: () => void;
  isDeleting: boolean;
}) => {
  // モーダル外側をクリックした時の処理
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">ファイルを削除しますか？</h3>
          <p className="text-gray-600 mb-1">以下のファイルを削除します：</p>
          <p className="text-sm font-medium text-gray-800 mb-6 break-all px-4">{file?.id}</p>
          <p className="text-gray-500 text-sm mb-6">この操作は元に戻せません</p>
          
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  削除中...
                </>
              ) : (
                '削除する'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ローディングインジケーター
const LoadingSpinner = () => (
  <div className="py-4 flex justify-center">
    <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

// アラートコンポーネント
const AlertMessage = ({ 
  message, 
  type 
} : { 
  message: string; 
  type: "success" | "error" 
}) => (
  <div
    className={`mt-6 p-4 rounded-md ${
      type === "success"
        ? "bg-green-50 text-green-800"
        : "bg-red-50 text-red-800"
    }`}
  >
    <div className="flex">
      <div className="flex-shrink-0">
        {type === "success" ? (
          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  </div>
);

export default function AdminPdfUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  
  // 削除関連の状態
  const [fileToDelete, setFileToDelete] = useState<PDFFile | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteMessageType, setDeleteMessageType] = useState<"success" | "error" | null>(null);

  // PDFファイル一覧を取得する関数
  const fetchPdfFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const { getApiPath } = await import('@/lib/apiUtils');
      const res = await fetch(getApiPath("admin/upload"));
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.files)) {
          setPdfFiles(data.files);
        } else {
          console.error("PDFファイル一覧の取得に失敗しました");
        }
      } else {
        console.error("PDFファイル一覧の取得に失敗しました");
      }
    } catch (error) {
      console.error("PDFファイル一覧の取得中にエラーが発生しました", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // コンポーネントマウント時にPDFファイル一覧を取得
  useEffect(() => {
    fetchPdfFiles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    } else {
      setSelectedFileName("");
    }
    setMessage(null);
    setMessageType(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setMessageType(null);
    
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setMessage("PDFファイルを選択してください。");
      setMessageType("error");
      return;
    }
    if (file.type !== "application/pdf") {
      setMessage("PDFファイルのみアップロード可能です。");
      setMessageType("error");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    
    try {
      const { getApiPath } = await import('@/lib/apiUtils');
      const res = await fetch(getApiPath("admin/upload"), {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setMessage("アップロードが完了しました。");
        setMessageType("success");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setSelectedFileName("");
        
        // アップロード成功後にファイル一覧を再取得
        fetchPdfFiles();
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data?.message || "アップロードに失敗しました。");
        setMessageType("error");
      }
    } catch {
      // エラー詳細はログに記録せず、ユーザーにはシンプルなメッセージを表示
      setMessage("通信エラーが発生しました。");
      setMessageType("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true);
    setDeleteMessage(null);
    setDeleteMessageType(null);

    try {
      const { getApiPath } = await import('@/lib/apiUtils');
      const res = await fetch(getApiPath(`admin/upload?filename=${encodeURIComponent(fileToDelete.id)}`), {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteMessage("削除が完了しました。");
        setDeleteMessageType("success");
        setFileToDelete(null);
        setIsDeleteModalOpen(false);
        fetchPdfFiles();
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteMessage(data?.message || "削除に失敗しました。");
        setDeleteMessageType("error");
      }
    } catch {
      // エラー詳細はログに記録せず、ユーザーにはシンプルなメッセージを表示
      setDeleteMessage("通信エラーが発生しました。");
      setDeleteMessageType("error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AdminNav />
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-br from-green-400/10 to-blue-500/10 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto py-8 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-4 glass-morphism bg-white/30 border-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              教材PDFアップロード
            </h1>
            <p className="mt-2 text-gray-600 text-lg">
              教材として使用するPDFファイルをアップロードし、エンベディング処理を行います
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card rounded-2xl shadow-xl overflow-hidden animate-in delay-200">
            <div className="p-8">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">新規アップロード</h2>
              <form 
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label 
                    htmlFor="pdfFile" 
                    className="block text-sm font-medium text-gray-700"
                  >
                    PDFファイル
                  </label>
                  <div className="mt-1 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                      <input
                        ref={fileInputRef}
                        id="pdfFile"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="sr-only"
                      />
                      <label
                        htmlFor="pdfFile"
                        className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 mr-2 text-gray-400" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        ファイルを選択
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          アップロード中...
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          アップロード
                        </>
                      )}
                    </button>
                  </div>
                  {selectedFileName && (
                    <div className="text-sm text-gray-500 mt-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {selectedFileName}
                    </div>
                  )}
                </div>
              </form>

              {message && <AlertMessage message={message} type={messageType!} />}
            </div>
          </div>

          {/* PDFファイル一覧 */}
          <div className="glass-card rounded-2xl shadow-xl overflow-hidden animate-in delay-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">アップロードされたPDFファイル</h2>
                <button
                  onClick={fetchPdfFiles}
                  className="glass-button text-gray-700 font-medium px-4 py-2 rounded-xl flex items-center space-x-2"
                  disabled={isLoadingFiles}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              <div className="divide-y divide-gray-200">
                {isLoadingFiles ? (
                  <LoadingSpinner />
                ) : pdfFiles.length === 0 ? (
                  <div className="py-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">アップロードされたPDFファイルがありません。</p>
                  </div>
                ) : (
                  pdfFiles.map((file) => (
                    <div 
                      key={file.id}
                      className="py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="6" fontWeight="bold">PDF</text>
                          </svg>
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                          <p className="text-xs text-gray-500 truncate">ID: {file.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex space-x-2">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center p-2 border border-transparent rounded-full text-indigo-600 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <span className="sr-only">プレビュー</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                        <button
                          onClick={() => {
                            setFileToDelete(file);
                            setIsDeleteModalOpen(true);
                          }}
                          className="inline-flex items-center p-2 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <span className="sr-only">削除</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {deleteMessage && <AlertMessage message={deleteMessage} type={deleteMessageType!} />}
            </div>
          </div>
        </div>
      </div>

      {isDeleteModalOpen && fileToDelete && (
        <DeleteConfirmationModal
          file={fileToDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}