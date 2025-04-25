
import { toast } from "@/hooks/use-toast";

export interface LlamaModelInfo {
  id: string;
  name: string;
  description: string;
}

export const AVAILABLE_MODELS: LlamaModelInfo[] = [
  {
    id: "llama-3.1-sonar-small-128k-online",
    name: "Llama 3.1 Sonar Small",
    description: "Fast & efficient (8B)"
  },
  {
    id: "llama-3.1-sonar-large-128k-online",
    name: "Llama 3.1 Sonar Large",
    description: "Balanced power (70B)"
  },
  {
    id: "llama-3.1-sonar-huge-128k-online",
    name: "Llama 3.1 Sonar Huge",
    description: "Most powerful (405B)"
  }
];

class LlamaService {
  private apiKey: string = '';
  private selectedModel: string = 'llama-3.1-sonar-small-128k-online';

  constructor() {
    // Try to load API key from localStorage
    this.apiKey = localStorage.getItem('llama_api_key') || '';
    this.selectedModel = localStorage.getItem('llama_model') || 'llama-3.1-sonar-small-128k-online';
  }

  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem('llama_api_key', apiKey);
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public setSelectedModel(modelId: string): void {
    this.selectedModel = modelId;
    localStorage.setItem('llama_model', modelId);
  }

  public getSelectedModel(): string {
    return this.selectedModel;
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim() !== '');
  }

  private async callLlamaApi(messages: any[]): Promise<any> {
    if (!this.hasApiKey()) {
      return { error: 'Llama API key not set' };
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.selectedModel,
          messages: messages,
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 1000,
          return_images: false,
          return_related_questions: false,
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Llama API error:', errorText);
        return { error: `Llama API error: ${response.status} ${response.statusText}` };
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling Llama API:', error);
      return { error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  public async verifyTimeQuery(query: string): Promise<any> {
    const messages = [
      {
        role: 'system',
        content: `You are a specialized timezone conversion assistant. 
        Your job is to validate and extract timezone information from natural language queries.
        
        For valid queries:
        1. Verify if the query contains one or more time zones, cities, states, or countries.
        2. Extract information in JSON format with these fields:
          - isValid: true
          - fromZone: timezone identifier (e.g., "America/New_York" or null if not specified)
          - toZone: timezone identifier (e.g., "Asia/Tokyo" or null if not specified)
          - time: specified time (e.g., "3:00 pm" or null if not specified)
        
        For invalid queries:
        1. Set isValid: false
        2. Provide helpful suggestions in the "suggestions" field.
        
        Provide the answer in valid JSON format only, with no additional text.`
      },
      {
        role: 'user',
        content: query
      }
    ];

    try {
      const response = await this.callLlamaApi(messages);
      
      if (response.error) {
        return { 
          isValid: false, 
          error: response.error,
          suggestions: "Please try a more specific query with at least one timezone."
        };
      }

      // Process the API response
      if (response.choices && response.choices[0] && response.choices[0].message) {
        const content = response.choices[0].message.content;
        
        try {
          // Try to extract JSON from the response
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                           content.match(/```([\s\S]*?)```/) || 
                           content.match(/{[\s\S]*?}/);
                           
          const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
          const parsedData = JSON.parse(jsonStr.replace(/```/g, '').trim());
          
          return {
            ...parsedData,
            isValid: parsedData.isValid === true
          };
        } catch (e) {
          console.error('Error parsing Llama response:', e, content);
          // Fallback to basic validation
          return { 
            isValid: content.toLowerCase().includes('valid') && !content.toLowerCase().includes('invalid'),
            fromZone: null,
            toZone: null,
            time: null,
            suggestions: "I understood your query but couldn't extract specific details."
          };
        }
      }
      
      return { isValid: false, suggestions: "Please try a more specific timezone query." };
    } catch (error) {
      console.error('Error in verifyTimeQuery:', error);
      return { 
        isValid: false, 
        error: String(error),
        suggestions: "There was a problem processing your query. Please try again."
      };
    }
  }
}

export default new LlamaService();
