
const LOCAL_STORAGE_API_KEY = 'gemini_api_key';
const LOCAL_STORAGE_MODEL = 'gemini_model';

export interface ModelOption {
  id: string;
  name: string;
  description: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'gemini-1.0-pro', name: 'Gemini Pro', description: 'Fast and efficient for most tasks' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Latest model with enhanced capabilities' },
  { id: 'gemini-1.5-pro-vision', name: 'Gemini 1.5 Pro Vision', description: 'Advanced vision and multimodal tasks' },
  { id: 'gemini-ultra', name: 'Gemini Ultra', description: 'Most powerful model for complex tasks' },
  { id: 'gemini-1.5-ultra', name: 'Gemini 1.5 Ultra', description: 'Latest ultra-powerful model' }
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
              A valid request should include at least one time (like "3pm" or "15:00") AND at least one time zone, city, country, state or location (like "EST", "Japan", "California", "Tokyo", "Berlin", "Paris", "Rome", "Madrid", "Dubai", "Singapore").
              The query may also include a date (like "tomorrow", "next Monday", "March 15th", "in 3 days").
              
              Be extremely generous in identifying time zones or locations. If there is ANY mention of a place, city, state, country or standard time abbreviation that could be a time zone, consider it valid.
              
              Be especially careful to correctly identify European, Middle Eastern, and Asian locations like:
              - European cities and countries (Paris, London, Berlin, Madrid, Rome, Vienna, Amsterdam, Brussels, Zurich, etc.)
              - Middle Eastern locations (Dubai, Riyadh, Tehran, Istanbul, Cairo, Doha, Kuwait, etc.)
              - Asian locations (Tokyo, Beijing, Singapore, Mumbai, Delhi, Seoul, Bangkok, etc.)
              
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
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 300
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
  
  // Enhanced basic validation for international locations
  basicValidation(query: string): boolean {
    const normalizedQuery = query.toLowerCase();
    
    // Check for presence of time
    const hasTime = /\d+\s*(am|pm|a\.m\.|p\.m\.)|\d+:\d+|\d{1,2}\s*o'?clock|\d{1,2}\s*at\s*night|\d{1,2}\s*in\s*the\s*(morning|afternoon|evening)/.test(normalizedQuery);
    
    // Enhanced pattern for international locations
    const hasLocation = /est|pst|cst|mst|gmt|cet|jst|ist|utc|edt|pdt|bst|aest|nzst|hst|akst|europe|asia|america|australia|africa|pacific|middle east|tokyo|new york|london|paris|berlin|sydney|chicago|los angeles|toronto|mexico|india|singapore|dubai|moscow|rome|madrid|barcelona|amsterdam|frankfurt|vienna|zurich|beijing|shanghai|seoul|bangkok|istanbul|cairo|johannesburg|sao paulo|rio|buenos aires|lima|santiago|bogota|caracas|nairobi|lagos|mumbai|delhi|riyadh|tehran|dubai|abu dhabi|doha|kuwait|bahrain|athens|prague|budapest|warsaw|stockholm|oslo|helsinki|dublin|lisbon|brussels|copenhagen|vienna|zurich|geneva|milan|florence|venice|naples|munich|frankfurt|hamburg|cologne|stuttgart|amsterdam|rotterdam|madrid|barcelona|valencia|seville|malaga|paris|lyon|marseille|toulouse|nice|stockholm|gothenburg|oslo|helsinki|copenhagen|athens|thessaloniki|sofia|bucharest|belgrade|zagreb|ljubljana|bratislava|kyiv|minsk|tallinn|riga|vilnius|istanbul|ankara|izmir|beirut|amman|damascus|baghdad|tehran|riyadh|jeddah|mecca|medina|doha|kuwait|muscat|sanaa|cairo|alexandria|casablanca|tunis|algiers|tripoli|khartoum|addis ababa|nairobi|dar es salaam|johannesburg|cape town|lagos|accra|dakar|mumbai|delhi|kolkata|chennai|bangalore|hyderabad|colombo|dhaka|karachi|lahore|islamabad|kabul|tashkent|almaty|bishkek|dushanbe|ashgabat|ulaanbaatar|beijing|shanghai|guangzhou|shenzhen|hong kong|macau|taipei|tokyo|osaka|kyoto|seoul|busan|pyongyang|manila|jakarta|kuala lumpur|singapore|bangkok|hanoi|ho chi minh|phnom penh|vientiane|yangon|sydney|melbourne|brisbane|perth|adelaide|auckland|wellington|suva|honolulu|anchorage|vancouver|montreal|toronto|halifax|new york|boston|philadelphia|washington|atlanta|miami|chicago|houston|denver|las vegas|phoenix|seattle|portland|san francisco|los angeles|mexico|guadalajara|monterrey|havana|santo domingo|san juan|kingston|port-au-prince|guatemala|san salvador|tegucigalpa|managua|san jose|panama|bogota|caracas|quito|lima|la paz|santiago|buenos aires|montevideo|asuncion|rio de janeiro|sao paulo|brasilia|salvador|california|texas|florida|new york|washington|oregon|nevada|hawaii|alaska|ohio|michigan|illinois|pennsylvania|virginia|arizona|colorado|georgia|massachusetts|new jersey|north carolina|south carolina|tennessee|missouri|minnesota|wisconsin|alabama|kentucky|oklahoma|kansas|nebraska|iowa|arkansas|utah|mississippi|united states|canada|mexico|brazil|argentina|chile|colombia|peru|venezuela|ecuador|bolivia|paraguay|uruguay|cuba|puerto rico|dominican republic|jamaica|haiti|bahamas|united kingdom|france|germany|italy|spain|greece|portugal|ireland|netherlands|belgium|switzerland|austria|sweden|norway|denmark|finland|poland|hungary|czech|slovakia|romania|bulgaria|turkey|russia|ukraine|belarus|lithuania|latvia|estonia|serbia|croatia|albania|slovenia|macedonia|japan|china|korea|taiwan|india|pakistan|bangladesh|sri lanka|nepal|thailand|vietnam|cambodia|laos|myanmar|malaysia|indonesia|philippines|singapore|australia|new zealand|egypt|morocco|algeria|tunisia|libya|sudan|ethiopia|kenya|tanzania|south africa|nigeria|ghana|senegal|saudi arabia|iran|iraq|jordan|syria|lebanon|israel|palestine|yemen|oman|bahrain|qatar|kuwait|united arab emirates|afghanistan|uzbekistan|kazakhstan|kyrgyzstan|tajikistan|turkmenistan|mongolia/.test(normalizedQuery);

    // Enhanced date patterns
    const hasDate = /tomorrow|today|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec|next week|next month|in \d+ days?|in \d+ weeks?/.test(normalizedQuery);
    
    return hasTime && hasLocation;
  }
};

export default GeminiService;
