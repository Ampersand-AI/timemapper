
const LOCAL_STORAGE_API_KEY = 'openrouter_api_key';
const LOCAL_STORAGE_MODEL = 'openrouter_model';

export interface ModelOption {
  id: string;
  name: string;
  description: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4 Mini', description: 'Fast and efficient' },
  { id: 'gpt-4o', name: 'GPT-4', description: 'Powerful and precise' },
  { id: 'gpt-4.5-preview', name: 'GPT-4.5 Preview', description: 'Latest capabilities' }
];

interface VerificationResult {
  isValid: boolean;
  suggestions?: string;
  error?: string;
  fromZone?: string;
  toZone?: string;
  time?: string;
  date?: string;
}

const OpenRouterService = {
  hasApiKey(): boolean {
    return !!this.getApiKey();
  },
  
  getApiKey(): string {
    return localStorage.getItem(LOCAL_STORAGE_API_KEY) || '';
  },
  
  setApiKey(apiKey: string): void {
    if (apiKey) {
      localStorage.setItem(LOCAL_STORAGE_API_KEY, apiKey);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_API_KEY);
    }
  },

  getSelectedModel(): string {
    return localStorage.getItem(LOCAL_STORAGE_MODEL) || 'gpt-4o-mini';
  },

  setSelectedModel(modelId: string): void {
    if (modelId) {
      localStorage.setItem(LOCAL_STORAGE_MODEL, modelId);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_MODEL);
    }
  },
  
  async verifyTimeQuery(query: string): Promise<VerificationResult> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      return { isValid: this.basicValidation(query) };
    }
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.href,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.getSelectedModel(),
          messages: [{
            role: 'user',
            content: `Given the following time zone query: "${query}", determine if it is a valid request for time zone conversion. 
            A valid request should include at least one time (like "3pm" or "15:00") AND at least one time zone, city, or location (like "EST", "Tokyo", or "New York").
            The query may also include a date (like "tomorrow", "next Monday", or "March 15th").
            
            Please be generous in identifying time zones or locations. If there is ANY mention of a place, city, country or standard time abbreviation that could be a time zone, consider it valid.
            
            If a city name is provided (like "Paris", "London", "Tokyo"), map it to its proper time zone ID.
            
            Please respond with a JSON object containing:
            {
              "isValid": boolean,
              "fromZone": string or null (time zone ID, city name or abbreviation of source),
              "toZone": string or null (time zone ID, city name or abbreviation of target),
              "time": string or null (the time mentioned in the query),
              "date": string or null (any date information in the query),
              "suggestions": string or null (suggestions for improving the query if invalid)
            }`
          }],
          temperature: 0.1,
          max_tokens: 300
        })
      });
      
      if (!response.ok) {
        console.error(`OpenRouter API error status: ${response.status}`);
        console.error(`OpenRouter API error details:`, await response.text());
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('Invalid response from OpenRouter API');
      }
      
      console.log('OpenRouter response:', content);
      
      // Extract the JSON object from the text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      try {
        const result = JSON.parse(jsonMatch[0]);
        
        return {
          isValid: !!result.isValid,
          fromZone: result.fromZone || undefined,
          toZone: result.toZone || undefined,
          time: result.time || undefined,
          date: result.date || undefined,
          suggestions: !result.isValid ? 
            (result.suggestions || 'Please include a time and at least one timezone or city') : 
            undefined
        };
      } catch (parseError) {
        console.error('Error parsing OpenRouter response:', parseError);
        return { isValid: this.basicValidation(query) };
      }
    } catch (error) {
      console.error('OpenRouter API error:', error);
      return { 
        isValid: this.basicValidation(query),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  // Basic validation as fallback when API fails
  basicValidation(query: string): boolean {
    const normalizedQuery = query.toLowerCase();
    
    // Check for presence of time
    const hasTime = /\d+\s*(am|pm|a\.m\.|p\.m\.)|\d+:\d+/.test(normalizedQuery);
    
    // Check for presence of timezone or city - expanded to be more inclusive
    const hasTimeZoneOrCity = /est|pst|cst|mst|gmt|cet|jst|ist|utc|edt|pdt|bst|aest|nzst|hst|akst|europe|asia|america|australia|pacific|tokyo|new york|london|paris|berlin|sydney|chicago|los angeles|toronto|mexico|india|singapore|dubai|moscow|rome|madrid|barcelona|amsterdam|frankfurt|vienna|zurich|beijing|shanghai|seoul|bangkok|istanbul|cairo|johannesburg|sao paulo|rio|buenos aires|lima|santiago|bogota|caracas|nairobi|lagos/.test(normalizedQuery);
    
    return hasTime && hasTimeZoneOrCity;
  }
};

export default OpenRouterService;
