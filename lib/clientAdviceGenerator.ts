// クライアントサイドでのアドバイス生成ユーティリティ
import { v4 as uuidv4 } from 'uuid';

export interface ClientAdvice {
  id: string;
  type: 'motivation' | 'weakness' | 'strategy' | 'progress' | 'alert' | 'general';
  content: string;
  createdAt: string;
}

// アドバイス履歴用のインターフェース
export interface ClientAdviceHistory {
  advices: ClientAdvice[];
  total: number;
  page: number;
  limit: number;
}

// アドバイスのタイプを配列化
const adviceTypes = ['motivation', 'strategy', 'progress', 'general', 'weakness'] as const;

// 各タイプのアドバイステンプレート
const adviceTemplates = {
  motivation: [
    '最近の学習進捗が素晴らしいです。このペースを維持して、さらなるスキルアップを目指しましょう！',
    '難しい課題に挑戦する姿勢が素晴らしいです。困難を乗り越えることで、成長が加速します。',
    'コンスタントな学習を続けていることを評価します。継続は力なり、その努力は必ず実を結びます。',
    '今日も新しい知識を得るチャンスです。一歩一歩着実に進んでいきましょう。',
    '挫折しそうになっても、ここまで来た自分を褒めてあげてください。あなたは確実に成長しています。'
  ],
  weakness: [
    '基礎的な概念の復習に時間を割くことで、応用力が大きく向上するでしょう。',
    '実践的な演習問題にもっと取り組むと、理解が深まります。理論と実践のバランスを意識してみましょう。',
    '難しいトピックからではなく、理解できている部分から少しずつ挑戦していくアプローチが効果的です。',
    '学習内容をアウトプットする機会を増やすことで、知識の定着率が高まります。',
    '苦手分野こそ集中的に取り組むことで、総合的な理解度が向上します。'
  ],
  strategy: [
    '定期的な復習セッションを設けて、学んだ内容を定着させましょう。例えば週末に15分だけ復習時間を作ってみては？',
    'メモを取りながら学習することで、後から見返した時の理解度が格段に上がります。',
    '小さな目標を設定し、達成感を味わいながら進むことで、モチベーション維持につながります。',
    '似た概念を比較しながら学ぶと、それぞれの特徴がより明確に理解できます。',
    '実際のプロジェクトに学んだ知識を適用することで、実践的な理解が深まります。'
  ],
  progress: [
    '継続的な努力が実を結び、着実に成長しています。この調子で進んでいきましょう。',
    '最近のクイズ結果から判断すると、基本概念の理解が進んでいます。次のステップに進む準備ができています。',
    '学習ペースが安定しています。規則正しい学習習慣が身についてきているようです。',
    '難しいトピックにも積極的に取り組んでいる姿勢が見られます。チャレンジ精神が成長を加速させています。',
    '前回と比較して、応用問題への対応力が向上しています。知識が定着してきた証拠です。'
  ],
  alert: [
    '学習の間隔が空きすぎると、せっかく得た知識が薄れていきます。定期的に復習を行いましょう。',
    '難しい概念に躓いているようです。基礎に戻って、もう一度学び直すことも大切です。',
    'バランスの良い学習計画を立てることで、偏りなく知識を身につけることができます。',
    '休息も学習の一部です。適度な休憩を取りながら、長期的に継続できる学習習慣を作りましょう。',
    'モチベーションの波は誰にでもあります。低下したときこそ、小さな目標から始めてみましょう。'
  ],
  general: [
    '学習は単なる情報収集ではなく、知識を実践に活かすことで真の理解が得られます。',
    '他者に教えることは、自分の理解を深める最も効果的な方法の一つです。学んだことをアウトプットする機会を作りましょう。',
    '多様な学習リソースを活用することで、さまざまな視点から同じトピックを理解できます。',
    '短時間でも毎日続けることが、長期的な成功の鍵です。無理のないペースで継続していきましょう。',
    'わからないことは恥ずかしいことではありません。疑問を持ち、解決する過程こそが学びです。'
  ]
};

/**
 * ランダムなアドバイスを生成する関数
 */
export function generateRandomAdvice(): ClientAdvice {
  // ランダムなアドバイスタイプを選択
  const typeIndex = Math.floor(Math.random() * adviceTypes.length);
  const type = adviceTypes[typeIndex] as ClientAdvice['type'];
  
  // 選択したタイプからランダムなアドバイス内容を選択
  const templates = adviceTemplates[type];
  const contentIndex = Math.floor(Math.random() * templates.length);
  const content = templates[contentIndex];
  
  // 現在の日付に基づいたカスタマイズを追加
  const now = new Date();
  const dateStr = now.toLocaleDateString('ja-JP');
  const timeOfDay = getTimeOfDay(now.getHours());
  
  // アドバイスにカスタマイズを加える
  const customizedContent = `${content}\n\n${timeOfDay}の学習も頑張りましょう！（${dateStr}）`;
  
  return {
    id: uuidv4(),
    type,
    content: customizedContent,
    createdAt: now.toISOString()
  };
}

/**
 * 時間帯に応じたメッセージを返す
 */
function getTimeOfDay(hour: number): string {
  if (hour < 5) return '深夜';
  if (hour < 12) return '午前中';
  if (hour < 18) return '午後';
  return '夕方から夜';
}

/**
 * クライアントサイドで過去のアドバイス履歴を生成する関数
 * 実際のバックエンドが存在しないため、フロントエンドでモック履歴を生成
 */
export interface ClientAdviceStats {
  adviceCount: number;
  helpfulRate: number;
  adviceByType: Record<string, number>;
  topRecommendations: string[];
  lastAdviceDate: string;
}

export function generateAdviceHistory(userId: string, limit: number = 10): ClientAdviceHistory {
  const advices: ClientAdvice[] = [];
  const now = new Date();
  
  // 過去のアドバイスをlimit件生成
  for (let i = 0; i < limit; i++) {
    // 1〜7日前のランダムな日付を生成
    const randomDaysAgo = Math.floor(Math.random() * 7) + 1;
    const date = new Date(now);
    date.setDate(date.getDate() - randomDaysAgo - i);
    
    // ランダムなアドバイスタイプを選択
    const typeIndex = Math.floor(Math.random() * adviceTypes.length);
    const type = adviceTypes[typeIndex] as ClientAdvice['type'];
    
    // 選択したタイプからランダムなアドバイス内容を選択
    const templates = adviceTemplates[type];
    const contentIndex = Math.floor(Math.random() * templates.length);
    const content = templates[contentIndex];
    
    // 日付に基づいたカスタマイズを追加
    const dateStr = date.toLocaleDateString('ja-JP');
    const timeOfDay = getTimeOfDay(date.getHours());
    const customizedContent = `${content}\n\n${timeOfDay}の学習も頑張りましょう！（${dateStr}）`;
    
    // アドバイスオブジェクトを生成
    advices.push({
      id: `history-${userId}-${date.getTime()}`,
      type,
      content: customizedContent,
      createdAt: date.toISOString()
    });
  }
  
  // 日付の降順でソート（新しい順）
  advices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return {
    advices,
    total: 25, // モックデータなので、合計25件あると仮定
    page: 1,
    limit
  };
}

/**
 * クライアントサイドでアドバイス統計を生成する関数
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateAdviceStats(userId: string): ClientAdviceStats {
  const now = new Date();
  
  // ランダムな統計データを生成
  const adviceCount = Math.floor(Math.random() * 20) + 5; // 5-25件のアドバイス
  const helpfulRate = Math.floor(Math.random() * 30) + 70; // 70-100%の役立つ率
  
  // タイプごとのアドバイス件数
  const adviceByType = {
    motivation: Math.floor(Math.random() * 5) + 1,
    weakness: Math.floor(Math.random() * 5),
    strategy: Math.floor(Math.random() * 5) + 2,
    progress: Math.floor(Math.random() * 5) + 1,
    alert: Math.floor(Math.random() * 3),
    general: Math.floor(Math.random() * 4)
  };
  
  // トップの推薦項目
  const topRecommendations = [
    'スクラムの基本原則を復習する',
    'アジャイル開発の実践的なアプローチを学ぶ',
    'プロジェクト管理ツールの使い方を習得する',
    'チームコミュニケーション技術の向上に取り組む',
    'プログラミングの基礎を再確認する'
  ].sort(() => Math.random() - 0.5).slice(0, 3); // ランダムに3つ選択
  
  // 最後のアドバイス日（1〜3日前）
  const lastAdviceDate = new Date(now);
  lastAdviceDate.setDate(lastAdviceDate.getDate() - (Math.floor(Math.random() * 3) + 1));
  
  return {
    adviceCount,
    helpfulRate,
    adviceByType,
    topRecommendations,
    lastAdviceDate: lastAdviceDate.toISOString()
  };
}
