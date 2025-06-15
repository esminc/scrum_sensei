// AIクライアント設定
// Using local Next.js API routes for AI functionality

export class AIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin + '/scrum_sensei' : 'http://localhost:3000/scrum_sensei';
  }

  async callAgent(agentName: string, messages: any[], context?: any) {
    const response = await fetch(`${this.baseUrl}/api/mastra/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentName,
        messages,
        context
      })
    });

    if (!response.ok) {
      throw new Error(`Agent call failed: ${response.statusText}`);
    }

    return response.json();
  }

  async callTool(toolName: string, context: any) {
    const response = await fetch(`${this.baseUrl}/api/mastra/tools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolName,
        context
      })
    });

    if (!response.ok) {
      throw new Error(`Tool call failed: ${response.statusText}`);
    }

    return response.json();
  }

  async generateAdvice(userId: string) {
    const response = await fetch(`${this.baseUrl}/api/advice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error(`Advice generation failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const aiClient = new AIClient();

// Legacy compatibility export
export const mastraClient = aiClient;