// リソース型定義
interface Resource {
  id: string;
  title: string;
  content: string;
  type?: string;
  source?: string;
  tags: string[];
}

interface FindResourcesOptions {
  query: string;
  limit?: number;
}

interface FindResourcesResult {
  success: boolean;
  resources: Resource[];
  message: string;
}

/**
 * アジャイル関連の学習リソースを検索する
 */
export async function findResources(options: FindResourcesOptions): Promise<FindResourcesResult> {
  const { query, limit = 3 } = options;
  
  try {
    console.log(`リソース検索実行: "${query}"`);
    
    // モックデータを返す
    const resources = getResourcesMock(query, limit);
    
    if (resources.length === 0) {
      return {
        success: true,
        resources: [],
        message: '該当するリソースが見つかりませんでした。別のキーワードで検索してみてください。'
      };
    }

    // 検索結果をコンソールに表示
    console.log(`${resources.length}件のリソースが見つかりました`);
    
    return {
      success: true,
      resources: resources.map(resource => ({
        id: resource.id,
        title: resource.title,
        content: resource.content,
        type: resource.type,
        source: resource.source,
        tags: resource.tags,
      })),
      message: `${resources.length}件のリソースが見つかりました`
    };
  } catch (error) {
    console.error('リソース検索中にエラーが発生しました:', error);
    return {
      success: false,
      resources: [],
      message: 'リソース検索中にエラーが発生しました。しばらく経ってからもう一度お試しください。'
    };
  }
}

/**
 * モックデータを返す関数
 */
function getResourcesMock(query: string, limit: number): Resource[] {
  const mockResources: Resource[] = [
    {
      id: "scrum-01",
      title: "スクラムガイド - 入門編",
      content: "スクラムは軽量なフレームワークで、複雑な問題に対応するための手法を提供します。",
      type: "guide",
      source: "mock-data",
      tags: ["scrum", "アジャイル", "フレームワーク", "入門"]
    },
    {
      id: "kanban-01",
      title: "カンバン - 視覚的ワークフロー管理",
      content: "カンバンは視覚的なプロセス管理ツールで、作業の流れを最適化します。",
      type: "guide", 
      source: "mock-data",
      tags: ["カンバン", "アジャイル", "ワークフロー", "視覚化"]
    },
    {
      id: "xp-01",
      title: "エクストリームプログラミング（XP） - 技術的プラクティス",
      content: "XPはソフトウェア開発のためのアジャイル手法で、ペアプログラミングやTDDなどの実践を重視します。",
      type: "guide",
      source: "mock-data",
      tags: ["XP", "アジャイル", "プログラミング", "実践"]
    },
    {
      id: "user-story-01",
      title: "ユーザーストーリー - 要求を理解する",
      content: "ユーザーストーリーは、ソフトウェアの要求を顧客視点で簡潔に表現する方法です。",
      type: "guide",
      tags: ["ユーザーストーリー", "要求", "アジャイル", "バックログ"]
    },
    {
      id: "velocity-01",
      title: "ベロシティ - チームの進捗を測定",
      content: "ベロシティはアジャイルチームの作業完了ペースを測定する指標です。",
      type: "guide",
      tags: ["ベロシティ", "測定", "アジャイル", "スクラム"]
    }
  ];
  
  // クエリに基づいて単純なフィルタリング
  const lowerQuery = query.toLowerCase();
  const filteredResources = mockResources.filter(resource => {
    return (
      resource.title.toLowerCase().includes(lowerQuery) ||
      resource.content.toLowerCase().includes(lowerQuery) ||
      resource.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  });
  
  // 指定された件数に制限
  return filteredResources.slice(0, limit);
}