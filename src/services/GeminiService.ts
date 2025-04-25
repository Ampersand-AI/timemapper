
const LOCAL_STORAGE_API_KEY = 'gemini_api_key';

interface VerificationResult {
  isValid: boolean;
  suggestions?: string;
  error?: string;
}

const GeminiService = {
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
  
  async verifyTimeQuery(query: string): Promise<VerificationResult> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      return { isValid: this.basicValidation(query) };
    }
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Given the following time zone query: "${query}", determine if it is a valid request for time zone conversion. 
              A valid request should include at least one time (like "3pm") AND at least one time zone (like "EST" or "Tokyo").
              
              Please respond with a JSON object containing:
              {
                "isValid": boolean,
                "fromZone": string or null,
                "toZone": string or null,
                "time": string or null,
                "suggestions": string or null
              }`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 200
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textContent) {
        throw new Error('Invalid response from Gemini API');
      }
      
      // Extract the JSON object from the text
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      try {
        const result = JSON.parse(jsonMatch[0]);
        
        return {
          isValid: !!result.isValid,
          suggestions: !result.isValid ? 
            (result.suggestions || 'Please include a time and at least one timezone') : 
            undefined
        };
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        return { isValid: this.basicValidation(query) };
      }
    } catch (error) {
      console.error('Gemini API error:', error);
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
    
    // Check for presence of timezone
    const hasTimeZone = /est|pst|cst|mst|gmt|cet|jst|ist|utc|edt|pdt|tokyo|new york|london|paris|berlin|sydney/.test(normalizedQuery);
    
    return hasTime && hasTimeZone;
  }
};

export default GeminiService;
