// JSON文字列を安全にパースする関数
export function safeJsonParse(jsonStr: string) {
  try {
    // 「処理結果: 」というプレフィックスを検出して削除
    const processedStr = jsonStr.replace(/^処理結果:\s*/, '');
    
    // 一般的な不正なエスケープシーケンスを修正
    // バックスラッシュのエスケープを確実に
    let cleanedStr = processedStr
      .replace(/\\(?!["\\/bfnrt])/g, '\\\\') // 不正なエスケープシーケンスを修正
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      // コントロール文字を削除
      .replace(/[\u0000-\u001F\u007F]/g, ' ');

    // カンマや括弧の問題を修正する試み
    cleanedStr = fixJsonSyntax(cleanedStr);
    
    try {
      return JSON.parse(cleanedStr);
    } catch {
      console.log('標準JSON.parseでの解析に失敗、JSONlintのような修正を試みる');
      // 不正な構文を修正
      const fixedStr = manuallyFixJson(cleanedStr);
      return JSON.parse(fixedStr);
    }
  } catch (e) {
    console.error('JSON解析エラー:', e);
    // より緩い解析を試みる
    try {
      // 「処理結果: 」というプレフィックスを検出して削除してからevalを試みる
      const processedStr = jsonStr.replace(/^処理結果:\s*/, '');
      
      // JSON文字列を評価（安全ではないかもしれないが、サーバーサイドであり、
      // ユーザー入力ではなくMastraエージェントからの出力を処理しているので許容）
      const evalResult = eval(`(${processedStr})`);
      console.log('evalでの解析に成功しました');
      return evalResult;
    } catch (evalError) {
      console.error('eval解析も失敗:', evalError);
      // 最後の手段として固定パターンをチェック
      const result = extractJsonData(jsonStr);
      if (result) {
        console.log('パターンマッチングによる抽出に成功');
        return result;
      }
      throw e; // すべての方法が失敗した場合、元のエラーを投げる
    }
  }
}

// JSONの構文エラーを修正する
function fixJsonSyntax(str: string): string {
  // 配列要素の後のカンマ忘れを修正する
  return str
    // 閉じ括弧と開き括弧の間に必要なカンマを追加
    .replace(/}(\s*){/g, '}, {')
    // 数値または文字列の後のカンマ漏れを修正
    .replace(/(["']\w+["'])(\s+)(["']\w+["'])/g, '$1,$2$3')
    // answerの値が重複している場合（"answer": "foo", "answer": "foo"）を修正
    .replace(/("answer"\s*:\s*"[^"]+"),\s*("answer"\s*:\s*"[^"]+")/g, '$1');
}

// 手動でJSON構文を修正するより積極的なアプローチ
function manuallyFixJson(str: string): string {
  // 項目間の区切り文字をチェック
  let inString = false;
  let inEscape = false;
  let result = '';
  let lastChar = '';
  let depth = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    
    if (inEscape) {
      inEscape = false;
      result += char;
      continue;
    }
    
    if (char === '\\') {
      inEscape = true;
      result += char;
      continue;
    }
    
    if (char === '"' && lastChar !== '\\') {
      inString = !inString;
    }
    
    if (!inString) {
      if (char === '{' || char === '[') {
        depth++;
      } else if (char === '}' || char === ']') {
        depth--;
      }
      
      // オブジェクトプロパティ間の区切り文字が抜けている場合に追加
      if (char === '"' && lastChar === '}' && depth > 0) {
        result += ',';
      }
      
      // 配列要素間のカンマがない場合に追加
      if ((char === '{' || char === '"') && lastChar === '}' && depth > 0) {
        result += ',';
      }
    }
    
    result += char;
    lastChar = char;
  }
  
  return result;
}

// 完全に解析できない場合のパターンマッチング
function extractJsonData(str: string): unknown | null {
  // クイズデータの構造をパターンマッチで抽出する
  try {
    // 正規表現で質問、選択肢、回答、説明のパターンを探す
    const questionPattern = /question["\s:]+([^"]+)/gi;
    const optionsPattern = /options["\s:]+([\s\S]+?)(?:,\s*answer|])/i;
    
    const questions = [];
    let match;
    
    // 質問を抽出
    while ((match = questionPattern.exec(str)) !== null) {
      const questionText = match[1].trim().replace(/"/g, '');
      const questionIndex = match.index;
      
      // この質問の周辺から選択肢を探す
      const subsequentText = str.substring(questionIndex, questionIndex + 1000);
      const optionsMatch = optionsPattern.exec(subsequentText);
      
      const options: unknown[] = [];
      if (optionsMatch) {
        // 選択肢を解析
        const optionsText = optionsMatch[1];
        const optionMatches = optionsText.match(/\{\s*"id"\s*:\s*"([^"]+)"\s*,\s*"text"\s*:\s*"([^"]+)"\s*\}/g);
        
        if (optionMatches) {
          optionMatches.forEach((optionStr, idx) => {
            const idMatch = optionStr.match(/"id"\s*:\s*"([^"]+)"/);
            const textMatch = optionStr.match(/"text"\s*:\s*"([^"]+)"/);
            
            if (idMatch && textMatch) {
              options.push({
                id: idMatch[1],
                text: textMatch[1]
              });
            } else {
              // idやtextが正規表現で取得できない場合の対応
              options.push({
                id: String(idx + 1),
                text: optionStr.replace(/[{}"]/g, '').trim()
              });
            }
          });
        }
      }
      
      // 回答を探す
      let answerText = '';
      const answerRegex = new RegExp(`answer["\s:]+([^"]+)`, 'i');
      const answerMatch = answerRegex.exec(subsequentText);
      if (answerMatch) {
        answerText = answerMatch[1].trim().replace(/"/g, '');
      }
      
      // 説明を探す
      let explanation = '';
      const explanationRegex = /explanation["\s:]+([^"]+)/i;
      const explanationMatch = explanationRegex.exec(subsequentText);
      if (explanationMatch) {
        explanation = explanationMatch[1].trim().replace(/"/g, '');
      }
      
      questions.push({
        question: questionText,
        type: 'multiple-choice',
        options: options,
        answer: answerText,
        explanation: explanation
      });
    }
    
    if (questions.length > 0) {
      return { questions };
    }
    
    return null;
  } catch (error) {
    console.error('パターンマッチングにも失敗:', error);
    return null;
  }
}