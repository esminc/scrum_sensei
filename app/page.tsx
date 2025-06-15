'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { User, Settings, Sparkles, BookOpen, Target, ArrowRight, Star, FileText, Brain, Zap, Users, TrendingUp, Play, Menu, X } from 'lucide-react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 統一されたナビゲーションバー */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
          : 'bg-white/80 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴ */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Scrum Sensei
              </span>
            </div>

            {/* メニューボタン (モバイル) */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 transition duration-150 ease-in-out"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* デスクトップメニュー */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="#features" 
                className="text-gray-600 hover:text-indigo-600 transition duration-150 ease-in-out font-medium"
              >
                機能
              </Link>
              <Link 
                href="#how-to-use" 
                className="text-gray-600 hover:text-indigo-600 transition duration-150 ease-in-out font-medium"
              >
                使い方
              </Link>
              <Link 
                href="/admin" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-150 ease-in-out flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>管理者</span>
              </Link>
              <Link 
                href="/user" 
                className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-teal-700 transition duration-150 ease-in-out flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>学習者</span>
              </Link>
            </div>
          </div>

          {/* モバイルメニュー */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50">
              <div className="px-4 py-6 space-y-4">
                <Link 
                  href="#features" 
                  className="block text-gray-600 hover:text-indigo-600 transition duration-150 ease-in-out font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  機能
                </Link>
                <Link 
                  href="#how-to-use" 
                  className="block text-gray-600 hover:text-indigo-600 transition duration-150 ease-in-out font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  使い方
                </Link>
                <Link 
                  href="/admin" 
                  className="block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-150 ease-in-out"
                  onClick={() => setIsMenuOpen(false)}
                >
                  管理者画面
                </Link>
                <Link 
                  href="/user" 
                  className="block bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-teal-700 transition duration-150 ease-in-out"
                  onClick={() => setIsMenuOpen(false)}
                >
                  学習者画面
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ハッカソンバッジ */}
      <div className="fixed top-20 right-4 md:top-4 md:right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-full font-semibold text-xs md:text-sm shadow-lg z-40 animate-pulse">
        NewBiz ハッカソン 2025
      </div>

      {/* メインコンテンツ */}
      <div className="pt-16">
        {/* ヒーローセクション */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Scrum Sensei
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl mb-6 text-gray-700 font-light">
                AIが創る新しい学習体験
              </p>
              <p className="text-lg md:text-xl mb-12 text-gray-600 max-w-3xl mx-auto leading-relaxed">
                PDFをアップロードするだけで、AIが自動的に学習コンテンツとクイズを生成。<br />
                現場のスクラム知見を活かした、次世代の学習プラットフォーム。
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link href="#features" className="group">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-3">
                    <Zap className="h-6 w-6" />
                    機能を見る
                    <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                <Link href="#how-to-use" className="group">
                  <div className="bg-white border-2 border-indigo-200 text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-indigo-50 flex items-center gap-3">
                    <FileText className="h-6 w-6" />
                    使い方を見る
                    <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 使い方セクション */}
        <section id="how-to-use" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                役割別：簡単3ステップで始める
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                管理者と学習者、それぞれの役割に応じた使い方をご紹介します
              </p>
            </div>

            {/* 管理者向けステップ */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl">
                    <Settings className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    管理者の方へ
                  </h3>
                </div>
                <p className="text-gray-600 text-lg">
                  コンテンツを作成し、学習環境を整備します
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg border border-blue-100 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-6">
                    01
                  </div>
                  <div className="text-4xl mb-6">📄</div>
                  <h4 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">PDFをアップロード</h4>
                  <p className="text-gray-600 leading-relaxed">
                    スクラムガイドやプロジェクト資料など、教材として使用するPDFファイルをアップロード
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-teal-50 p-8 rounded-2xl shadow-lg border border-green-100 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-6">
                    02
                  </div>
                  <div className="text-4xl mb-6">🤖</div>
                  <h4 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">AIコンテンツ生成</h4>
                  <p className="text-gray-600 leading-relaxed">
                    AIがPDF内容を解析し、クイズや音声教材を自動生成。生成されたコンテンツを確認・編集
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg border border-purple-100 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-6">
                    03
                  </div>
                  <div className="text-4xl mb-6">📢</div>
                  <h4 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">コンテンツ公開</h4>
                  <p className="text-gray-600 leading-relaxed">
                    作成されたクイズや音声教材を公開し、学習者が利用できる状態にする
                  </p>
                </div>
              </div>
            </div>

            {/* 学習者向けステップ */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="bg-gradient-to-r from-green-500 to-teal-600 p-3 rounded-xl">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent">
                    学習者の方へ
                  </h3>
                </div>
                <p className="text-gray-600 text-lg">
                  効率的に学習を進め、スキルアップを図ります
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl shadow-lg border border-orange-100 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-6">
                    01
                  </div>
                  <div className="text-4xl mb-6">📚</div>
                  <h4 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">クイズで学習</h4>
                  <p className="text-gray-600 leading-relaxed">
                    公開されたクイズに挑戦し、スクラムの知識を体系的に身につける
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-2xl shadow-lg border border-teal-100 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-6">
                    02
                  </div>
                  <div className="text-4xl mb-6">🎵</div>
                  <h4 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">音声で復習</h4>
                  <p className="text-gray-600 leading-relaxed">
                    移動中や作業中に音声教材を聞いて、効率的に知識を定着させる
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-2xl shadow-lg border border-pink-100 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-6">
                    03
                  </div>
                  <div className="text-4xl mb-6">💡</div>
                  <h4 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">AIアドバイス受取</h4>
                  <p className="text-gray-600 leading-relaxed">
                    学習進捗をAIが分析し、パーソナライズされたアドバイスで更なる成長をサポート
                  </p>
                </div>
              </div>
            </div>

            {/* アクセスボタン */}
            <div className="text-center mt-16">
              <h3 className="text-2xl md:text-3xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                今すぐ体験してみる
              </h3>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/admin" className="group">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-3">
                    <Settings className="h-6 w-6" />
                    管理者画面
                    <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                
                <Link href="/user" className="group">
                  <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-3">
                    <User className="h-6 w-6" />
                    学習者画面
                    <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 機能セクション */}
        <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                革新的な機能
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                最新のAI技術と永和システムの豊富な経験を融合した、次世代の学習機能
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '🤖',
                  title: 'AI自動生成エンジン',
                  description: 'PDFをアップするだけで、最新のAI技術が学習コンテンツとクイズを自動生成',
                  gradient: 'from-blue-500 to-indigo-600',
                  status: 'available'
                },
                {
                  icon: '📊',
                  title: 'インテリジェント分析',
                  description: 'リアルタイムダッシュボードで学習進捗、スコア、連続学習日数を可視化',
                  gradient: 'from-green-500 to-teal-600',
                  status: 'development'
                },
                {
                  icon: '💡',
                  title: 'パーソナルAIコーチ',
                  description: '学習履歴を分析し、一人ひとりに最適化されたAIアドバイスを提供',
                  gradient: 'from-purple-500 to-pink-600',
                  status: 'available'
                },
                {
                  icon: '🎯',
                  title: 'スクラム特化AI',
                  description: '永和システムの豊富な現場知見をAIに学習させ、実践的なスクラム学習を実現',
                  gradient: 'from-orange-500 to-red-600',
                  status: 'development'
                },
                {
                  icon: '📈',
                  title: '高度な学習分析',
                  description: '学習時間、進捗率、問題タイプ別の詳細統計で学習効果を最大化',
                  gradient: 'from-teal-500 to-cyan-600',
                  status: 'development'
                },
                {
                  icon: '🎵',
                  title: '音声学習機能',
                  description: 'テキストを音声に変換し、移動中や作業中でも効率的な学習が可能',
                  gradient: 'from-pink-500 to-rose-600',
                  status: 'available'
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-xl relative"
                >
                  {feature.status === 'development' && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      開発中
                    </div>
                  )}
                  <div className={`inline-block p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6`}>
                    <div className="text-2xl">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                    {feature.status === 'development' && (
                      <span className="block mt-2 text-sm text-amber-600 font-medium">
                        ※ この機能は現在開発中です
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 差別化セクション */}
        <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                永和システムの圧倒的な差別化
              </h2>
              <p className="text-xl opacity-95 max-w-4xl mx-auto leading-relaxed">
                20年以上のアジャイル開発実績と現場でのスクラム実践から生まれた<br />
                <span className="text-yellow-300 font-bold text-2xl">他社では絶対に真似できない</span>スクラムノウハウをAIが学習
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20 shadow-2xl">
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 text-yellow-300">
                なぜ永和システムだからこそできるのか？
              </h3>
              <p className="text-lg text-center mb-12 opacity-95 max-w-4xl mx-auto leading-relaxed">
                永和システムマネジメントは日本におけるアジャイル開発のパイオニアとして、
                <span className="text-yellow-300 font-semibold">2003年からXP（エクストリームプログラミング）</span>を導入し、
                <span className="text-yellow-300 font-semibold">2008年からスクラム</span>を本格的に実践してきました。
                この長年の経験で蓄積された「暗黙知」をAIで「形式知」化することで、
                他社では絶対に提供できない価値をお客様にお届けします。
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">20+</div>
                  <div className="text-lg opacity-90">年の実践経験</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">100+</div>
                  <div className="text-lg opacity-90">プロジェクト実績</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">独自</div>
                  <div className="text-lg opacity-90">ノウハウ蓄積</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* フッター */}
        <footer className="py-16 bg-gray-900 text-white text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Scrum Sensei</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-6">未来の学習を、今ここに。</h3>
            <p className="text-xl opacity-80 mb-8">Next Generation AI Learning Platform</p>
            <p className="text-sm opacity-60">
              NewBiz企画ハッカソン 2025 エントリー作品<br />
              Powered by 永和システムマネジメント × 最先端AI技術
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}