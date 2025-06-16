'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

interface QuizMaterial {
  id: number;
  title: string;
  description: string;
  created_at: string;
  questions: QuizQuestion[];
}

interface QuizPreviewProps {
  materials: QuizMaterial[];
  onRefresh: () => void;
}

export default function QuizPreview({ materials, onRefresh }: QuizPreviewProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});

  // クイズ教材の削除
  const deleteMaterial = async (id: number) => {
    if (!confirm('このクイズ教材を削除してもよろしいですか？')) return;
    
    try {
      const { getApiPath } = await import('@/lib/apiUtils');
      const response = await fetch(getApiPath(`admin/quiz-materials/${id}`), {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('クイズ教材の削除に失敗しました');
      }
      
      alert('クイズ教材が削除されました');
      onRefresh();
    } catch (error) {
      console.error('削除エラー:', error);
      alert(error instanceof Error ? error.message : '削除に失敗しました');
    }
  };

  // 回答選択
  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  // 回答の正誤判定
  const isCorrectAnswer = (questionId: number, answerIndex: number, correctAnswer: number) => {
    const selected = selectedAnswers[questionId];
    if (selected === undefined) return null;
    
    if (answerIndex === correctAnswer) {
      return 'correct';
    } else if (answerIndex === selected) {
      return 'incorrect';
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">クイズ教材一覧</h3>
        <Button onClick={onRefresh} variant="outline" size="sm">
          更新
        </Button>
      </div>

      {materials.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            クイズ教材がありません
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {materials.map((material) => (
            <Card key={material.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                    <Badge variant="outline" className="mt-2">
                      {material.questions.length}問
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          プレビュー
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{material.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-medium">説明</h4>
                            <p className="text-gray-600">{material.description}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-4">問題一覧</h4>
                            <div className="space-y-6">
                              {material.questions.map((question, index) => (
                                <Card key={question.id} className="border-l-4 border-l-blue-500">
                                  <CardContent className="p-4">
                                    <div className="space-y-4">
                                      <div className="flex items-start space-x-2">
                                        <BookOpen className="w-5 h-5 text-blue-500 mt-1" />
                                        <div className="flex-1">
                                          <h5 className="font-medium">
                                            問題 {index + 1}
                                          </h5>
                                          <p className="text-gray-700 mt-1">{question.question}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2 ml-7">
                                        {question.options.map((option, optionIndex) => {
                                          const answerStatus = isCorrectAnswer(
                                            question.id, 
                                            optionIndex, 
                                            question.correct_answer
                                          );
                                          
                                          return (
                                            <div
                                              key={optionIndex}
                                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                                answerStatus === 'correct'
                                                  ? 'bg-green-100 border-green-500'
                                                  : answerStatus === 'incorrect'
                                                  ? 'bg-red-100 border-red-500'
                                                  : selectedAnswers[question.id] === optionIndex
                                                  ? 'bg-blue-100 border-blue-500'
                                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                              }`}
                                              onClick={() => handleAnswerSelect(question.id, optionIndex)}
                                            >
                                              <div className="flex items-center space-x-2">
                                                <span className="font-medium text-sm">
                                                  {String.fromCharCode(65 + optionIndex)}.
                                                </span>
                                                <span>{option}</span>
                                                {answerStatus === 'correct' && (
                                                  <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                                                )}
                                                {answerStatus === 'incorrect' && (
                                                  <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                      
                                      {question.explanation && selectedAnswers[question.id] !== undefined && (
                                        <div className="ml-7 p-3 bg-blue-50 rounded-lg">
                                          <h6 className="font-medium text-sm text-blue-800">解説</h6>
                                          <p className="text-sm text-blue-700 mt-1">{question.explanation}</p>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMaterial(material.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    作成日: {new Date(material.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {material.questions.slice(0, 3).map((question, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {question.question.length > 30 
                          ? question.question.substring(0, 30) + '...'
                          : question.question
                        }
                      </Badge>
                    ))}
                    {material.questions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{material.questions.length - 3}問
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}