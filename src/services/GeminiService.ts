const LOCAL_STORAGE_API_KEY = 'gemini_api_key';
const LOCAL_STORAGE_MODEL = 'gemini_model';

export interface ModelOption {
  id: string;
  name: string;
  description: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', description: 'Fast and efficient' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Powerful and precise' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Quick responses' },
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

  getSelectedModel(): string {
    return localStorage.getItem(LOCAL_STORAGE_MODEL) || 'gemini-1.0-pro';
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
      const endpoint = 'https://generativelanguage.googleapis.com/v1/models/' + 
        this.getSelectedModel() + ':generateContent';
      
      const response = await fetch(`${endpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Given the following time zone query: "${query}", determine if it is a valid request for time zone conversion. 
              A valid request should include at least one time (like "3pm" or "15:00") OR at least one time zone, city, country, state or location (like "EST", "Japan", "California", "Tokyo", "Berlin", "Oslo", "Sweden", "Denmark", "Norway", "Dubai", "Singapore", or "New York").
              The query may also include a date (like "tomorrow", "next Monday", "March 15th", "in 3 days").
              
              Please be very generous in identifying time zones or locations. If there is ANY mention of a place, city, state, country, region or standard time abbreviation that could be a time zone, consider it valid.
              
              Make sure to recognize all European, Asian, Middle Eastern, African and Pacific countries and cities. Pay special attention to locations like Sweden, Norway, Denmark, Finland, and all Middle Eastern and Asian countries.
              
              If a city name is provided (like "Paris", "London", "Tokyo"), map it to its proper time zone ID.
              If a country name is provided (like "Sweden", "Norway", "Denmark"), use the capital city's time zone.
              
              Please respond with a JSON object containing:
              {
                "isValid": boolean,
                "fromZone": string or null (time zone ID, city name or abbreviation of source),
                "toZone": string or null (time zone ID, city name or abbreviation of target),
                "time": string or null (the time mentioned in the query),
                "date": string or null (any date information in the query),
                "suggestions": string or null (suggestions for improving the query if invalid)
              }`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500
          }
        })
      });
      
      if (!response.ok) {
        console.error(`Gemini API error status: ${response.status}`);
        console.error(`Gemini API error details:`, await response.text());
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('Invalid response from Gemini API');
      }
      
      console.log('Gemini response:', content);
      
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
            (result.suggestions || 'Please include a time and at least one timezone, city, or location') : 
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
  
  // Enhanced basic validation as fallback when API fails
  basicValidation(query: string): boolean {
    const normalizedQuery = query.toLowerCase();
    
    // Check for presence of time
    const hasTime = /\d+\s*(am|pm|a\.m\.|p\.m\.)|\d+:\d+|\d{1,2}\s*o'?clock|\d{1,2}\s*at\s*night|\d{1,2}\s*in\s*the\s*(morning|afternoon|evening)/.test(normalizedQuery);
    
    // Check for presence of timezone, city, state, or country - greatly expanded to be more inclusive
    const hasLocation = /est|pst|cst|mst|gmt|cet|jst|ist|utc|edt|pdt|bst|aest|nzst|hst|akst|europe|asia|america|australia|africa|pacific|middle east|tokyo|new york|london|paris|berlin|sydney|chicago|los angeles|toronto|mexico|india|singapore|dubai|moscow|rome|madrid|barcelona|amsterdam|frankfurt|vienna|zurich|beijing|shanghai|seoul|bangkok|istanbul|cairo|johannesburg|sao paulo|rio|buenos aires|lima|santiago|bogota|caracas|nairobi|lagos|mumbai|delhi|california|texas|florida|new york|washington|oregon|nevada|hawaii|alaska|ohio|michigan|illinois|pennsylvania|virginia|arizona|colorado|georgia|massachusetts|new jersey|north carolina|south carolina|tennessee|missouri|minnesota|wisconsin|alabama|kentucky|oklahoma|kansas|nebraska|iowa|arkansas|utah|mississippi|united states|canada|mexico|brazil|argentina|chile|colombia|peru|venezuela|ecuador|bolivia|paraguay|uruguay|cuba|puerto rico|dominican republic|jamaica|haiti|bahamas|united kingdom|france|germany|italy|spain|greece|portugal|ireland|netherlands|belgium|switzerland|austria|sweden|norway|denmark|finland|poland|hungary|czech republic|romania|bulgaria|turkey|russia|ukraine|egypt|south africa|nigeria|kenya|ethiopia|morocco|algeria|saudi arabia|iran|iraq|israel|pakistan|india|china|japan|south korea|north korea|thailand|vietnam|indonesia|malaysia|singapore|philippines|taiwan|australia|new zealand|stockholm|oslo|copenhagen|helsinki|dubai|abu dhabi|riyadh|doha|beirut|amman|tehran|karachi|dhaka|mumbai|delhi|bangkok|jakarta|kuala|manila|taipei|hong kong/.test(normalizedQuery);

    // Extended date patterns
    const hasDate = /tomorrow|today|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec|next week|next month|in \d+ days?|in \d+ weeks?/.test(normalizedQuery);
    
    // If query has a location, it's valid even without time
    if (hasLocation) return true;
    
    // Otherwise need both time and location
    return hasTime && hasLocation;
  }
};

export default GeminiService;
