'use client';

import { useState, useEffect } from 'react';
import { Content, ContentSection, ContentStatus } from '@/lib/models/content';

interface ContentEditorProps {
  content?: Content;
  onSave?: (content: Content) => void;
  onCancel?: () => void;
}

export default function ContentEditor({ content, onSave, onCancel }: ContentEditorProps) {
  const [title, setTitle] = useState(content?.title || '');
  const [description, setDescription] = useState(content?.description || '');
  const [status, setStatus] = useState<ContentStatus>(content?.status || 'draft');
  const [sections, setSections] = useState<ContentSection[]>(content?.sections || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // コンテンツが変更されたら状態を更新
  useEffect(() => {
    if (content) {
      setTitle(content.title);
      setDescription(content.description);
      setStatus(content.status || 'draft');
      setSections(content.sections || []);
    }
  }, [content]);

  // 新しいセクションを追加
  const addSection = () => {
    const newSection: ContentSection = {
      id: `section-${Date.now()}`,
      title: '新しいセクション',
      content: '',
      order: sections.length
    };
    
    setSections([...sections, newSection]);
  };

  // セクションを削除
  const removeSection = (id: string) => {
    const newSections = sections.filter(section => section.id !== id);
    // 順序を更新
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));
    setSections(updatedSections);
  };

  // セクションのタイトルを更新
  const updateSectionTitle = (id: string, newTitle: string) => {
    const updatedSections = sections.map(section => 
      section.id === id ? { ...section, title: newTitle } : section
    );
    setSections(updatedSections);
  };

  // セクションの内容を更新
  const updateSectionContent = (id: string, newContent: string) => {
    const updatedSections = sections.map(section => 
      section.id === id ? { ...section, content: newContent } : section
    );
    setSections(updatedSections);
  };

  // セクションの順序を変更（上に移動）
  const moveSectionUp = (id: string) => {
    const index = sections.findIndex(section => section.id === id);
    if (index <= 0) return;
    
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    
    // 順序を更新
    const updatedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx
    }));
    
    setSections(updatedSections);
  };

  // セクションの順序を変更（下に移動）
  const moveSectionDown = (id: string) => {
    const index = sections.findIndex(section => section.id === id);
    if (index >= sections.length - 1) return;
    
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    
    // 順序を更新
    const updatedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx
    }));
    
    setSections(updatedSections);
  };

  // コンテンツを保存
  const saveContent = async () => {
    if (!title.trim()) {
      setError('タイトルは必須です');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updatedContent = {
        ...content,
        title,
        description,
        status,
        sections,
        updatedAt: new Date().toISOString()
      };

      // 新規作成または更新
      const endpoint = content?.id 
        ? `/api/admin/content/${content.id}` 
        : '/api/admin/content';
      
      const method = content?.id ? 'PATCH' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedContent),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'コンテンツの保存に失敗しました');
      }

      const savedContent = await response.json();
      
      // 保存後のコールバック
      if (onSave) {
        onSave(savedContent.content);
      }
    } catch (err) {
      console.error('コンテンツ保存エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">
        {content?.id ? 'コンテンツ編集' : '新規コンテンツ作成'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-medium">タイトル*</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="コンテンツのタイトル"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-medium">説明</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2 h-24"
          placeholder="コンテンツの説明"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-medium">ステータス</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ContentStatus)}
          className="border rounded px-3 py-2"
        >
          <option value="draft">下書き</option>
          <option value="review">レビュー</option>
          <option value="published">公開</option>
          <option value="archived">アーカイブ</option>
        </select>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-gray-700 font-medium">セクション</label>
          <button
            onClick={addSection}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
          >
            セクション追加
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="text-center py-6 bg-gray-100 rounded">
            セクションがありません。「セクション追加」ボタンをクリックしてセクションを追加してください。
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={section.id} className="border rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{index + 1}.</span>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => moveSectionUp(section.id)}
                      disabled={index === 0}
                      className={`px-2 py-1 rounded ${
                        index === 0 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveSectionDown(section.id)}
                      disabled={index === sections.length - 1}
                      className={`px-2 py-1 rounded ${
                        index === sections.length - 1 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                      削除
                    </button>
                  </div>
                </div>
                <textarea
                  value={section.content}
                  onChange={(e) => updateSectionContent(section.id, e.target.value)}
                  className="w-full border rounded px-3 py-2 h-32"
                  placeholder="セクションの内容"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={saveContent}
          disabled={saving}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded ${
            saving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {saving ? '保存中...' : content?.id ? '更新' : '保存'}
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}