
// DeepSeek AI integration service

interface DeepSeekResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
}

interface VerificationResult {
  isValid: boolean;
  suggestions?: string;
  error?: string;
}

class DeepSeekService {
  private apiKey: string | null = null;

  constructor() {
    // Initially no API key
  }

  public setApiKey(key: string): void {
    this.apiKey = key;
    console.log('DeepSeek API key has been set');
  }

  public getApiKey(): string | null {
    return this.apiKey;
  }

  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  // Verify a time zone query using DeepSeek AI
  public async verifyTimeQuery(query: string): Promise<VerificationResult> {
    if (!this.apiKey) {
      return { 
        isValid: false, 
        error: "DeepSeek API key not configured" 
      };
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are an assistant that helps verify time zone conversion queries. 
                       A valid query must contain a specific time (e.g., 3pm) and at least one time zone (e.g., EST, Tokyo).
                       Respond with a JSON object with the following structure:
                       {
                         "isValid": boolean,
                         "reason": string (explanation),
                         "suggestedQuery": string (suggested query if invalid)
                       }`
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.2,
          max_tokens: 256
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('DeepSeek API error:', errorData);
        return { 
          isValid: false, 
          error: `API error: ${response.status} ${response.statusText}` 
        };
      }

      const data = await response.json() as DeepSeekResponse;
      
      // Parse DeepSeek's response to extract JSON
      const content = data.choices[0].message.content;
      try {
        const parsedContent = JSON.parse(content);
        return {
          isValid: parsedContent.isValid,
          suggestions: parsedContent.isValid ? undefined : parsedContent.suggestedQuery
        };
      } catch (e) {
        console.error('Error parsing DeepSeek response JSON:', e);
        // If JSON parsing fails, attempt to extract answer from text
        const isValid = content.toLowerCase().includes('valid') && 
                       !content.toLowerCase().includes('not valid') && 
                       !content.toLowerCase().includes('invalid');
        return {
          isValid,
          suggestions: isValid ? undefined : 'Try including both a specific time and at least one time zone'
        };
      }
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      return { 
        isValid: false, 
        error: `Error: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }
}

// Singleton instance
export default new DeepSeekService();
