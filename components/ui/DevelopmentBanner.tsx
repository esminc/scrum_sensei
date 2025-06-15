'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Code, 
  Database, 
  X, 
  Eye,
  EyeOff
} from 'lucide-react';

interface DevelopmentBannerProps {
  type?: 'dashboard' | 'ai-advice' | 'general';
  showDismiss?: boolean;
  className?: string;
}

export default function DevelopmentBanner({ 
  type = 'general', 
  showDismiss = true,
  className = '' 
}: DevelopmentBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isVisible) return null;

  const getTypeSpecificContent = () => {
    switch (type) {
      case 'dashboard':
        return {
          title: '📊 ダッシュボード開発中',
          description: '表示されているデータは開発用のダミーデータです。実際の学習進捗や統計情報ではありません。',
          icon: <Database className="h-4 w-4" />,
          badges: ['ダミーデータ', '統計情報', '進捗データ']
        };
      case 'ai-advice':
        return {
          title: '🤖 AIアドバイス機能開発中',
          description: 'AIアドバイスやチャット機能は開発中です。表示される内容はテスト用のサンプルデータです。',
          icon: <Code className="h-4 w-4" />,
          badges: ['AI機能', 'サンプルデータ', 'テスト中']
        };
      default:
        return {
          title: '🚧 開発中機能',
          description: 'この機能は現在開発中です。表示されるデータはテスト用のものです。',
          icon: <AlertTriangle className="h-4 w-4" />,
          badges: ['開発中', 'テストデータ']
        };
    }
  };

  const content = getTypeSpecificContent();

  if (isMinimized) {
    return (
      <div className={`fixed top-20 right-4 z-40 ${className}`}>
        <Button
          onClick={() => setIsMinimized(false)}
          size="sm"
          variant="outline"
          className="glass-morphism bg-amber-500/20 border-amber-200/50 text-amber-800 hover:bg-amber-500/30 backdrop-blur-sm rounded-full p-2"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`mb-6 ${className}`}>
      <Alert className="glass-morphism bg-amber-500/10 text-amber-900 border-amber-200/50 backdrop-blur-sm rounded-xl relative">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-500/20 rounded-lg mt-1">
            {content.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-amber-900 text-lg">
                {content.title}
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setIsMinimized(true)}
                  size="sm"
                  variant="ghost"
                  className="text-amber-600 hover:text-amber-800 hover:bg-amber-500/20 p-1 h-auto"
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
                {showDismiss && (
                  <Button
                    onClick={() => setIsVisible(false)}
                    size="sm"
                    variant="ghost"
                    className="text-amber-600 hover:text-amber-800 hover:bg-amber-500/20 p-1 h-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <AlertDescription className="text-amber-800 leading-relaxed mb-3">
              {content.description}
            </AlertDescription>
            
            <div className="flex flex-wrap gap-2">
              {content.badges.map((badge, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="bg-amber-200/50 text-amber-800 border-amber-300/50 text-xs"
                >
                  {badge}
                </Badge>
              ))}
              <Badge 
                variant="secondary" 
                className="bg-blue-200/50 text-blue-800 border-blue-300/50 text-xs"
              >
                NewBiz ハッカソン 2025
              </Badge>
            </div>
          </div>
        </div>
      </Alert>
    </div>
  );
}