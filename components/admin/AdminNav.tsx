'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Upload, Brain, BookOpen, Volume2, Home, Menu, X, Sparkles } from 'lucide-react';

export default function AdminNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // スクロールに応じてナビゲーションバーのスタイルを変更
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { 
      name: 'ダッシュボード', 
      href: '/admin',
      icon: <BarChart3 className="h-5 w-5 mr-2" />,
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      name: 'PDFアップロード', 
      href: '/admin/upload',
      icon: <Upload className="h-5 w-5 mr-2" />,
      color: 'from-green-500 to-teal-600'
    },
    { 
      name: '問題生成ツール', 
      href: '/admin/quiz-generator',
      icon: <Brain className="h-5 w-5 mr-2" />,
      color: 'from-purple-500 to-pink-600'
    },
    { 
      name: '教材一覧', 
      href: '/admin/materials',
      icon: <BookOpen className="h-5 w-5 mr-2" />,
      color: 'from-orange-500 to-red-600'
    },
    { 
      name: '音声教材作成', 
      href: '/admin/audio-materials/create',
      icon: <Volume2 className="h-5 w-5 mr-2" />,
      color: 'from-pink-500 to-rose-600'
    },
  ];

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'glass-nav shadow-xl' : 'glass-morphism-subtle'} border-b border-white/20`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/admin" className="flex items-center group">
                <span 
                  className="text-lg font-bold text-black selection:bg-blue-500 selection:text-white"
                  style={{color: '#000000'}}
                >
                  Scrum Sensei - 管理者
                </span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-8 flex items-center space-x-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                    >
                      <div
                        className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          isActive
                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                            : 'text-gray-800 hover:bg-white/30 hover:text-gray-900'
                        }`}
                      >
                        {item.icon}
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="glass-morphism bg-white/20 border-white/20 backdrop-blur-sm inline-flex items-center justify-center p-2 rounded-xl text-gray-900 hover:text-black hover:bg-white/30 focus:outline-none transition-all duration-300"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">メニューを開く</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
          <div className="hidden md:block">
            <div>
              <Link href="/" className="flex items-center glass-morphism bg-white/20 border-white/20 backdrop-blur-sm hover:bg-white/30 text-gray-900 hover:text-black px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105">
                <Home className="h-5 w-5 mr-2" />
                ホームに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      <div 
        className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden glass-morphism bg-white/30 border-white/20 backdrop-blur-md border-t`} 
        id="mobile-menu"
      >
        <div className="px-4 pt-4 pb-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
              >
                <div
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : 'text-gray-900 hover:bg-white/20 hover:text-black'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </div>
              </Link>
            );
          })}
          <Link href="/">
            <div
              className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-900 hover:bg-white/20 hover:text-black transition-all duration-300"
            >
              <Home className="h-5 w-5 mr-2" />
              ホームに戻る
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}