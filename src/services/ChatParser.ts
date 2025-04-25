
// Natural language parser for time zone conversion queries

interface ParsedQuery {
  fromZone?: string;
  toZone?: string;
  time?: string;
  date?: string;
  isValid: boolean;
  originalText: string;
  isLocalToRemote: boolean; // Flag to indicate if query is local-to-remote conversion
}

// Expanded time zone aliases with more cities, states, and countries
const zoneAliases: Record<string, string> = {
  // North America
  "eastern": "America/New_York",
  "et": "America/New_York", 
  "est": "America/New_York",
  "edt": "America/New_York",
  "new york": "America/New_York",
  "ny": "America/New_York",
  "nyc": "America/New_York",
  "boston": "America/New_York",
  "miami": "America/New_York",
  "atlanta": "America/New_York",
  "washington dc": "America/New_York",
  "philadelphia": "America/New_York",
  "pittsburgh": "America/New_York",
  "buffalo": "America/New_York",
  "toronto": "America/Toronto",
  "ottawa": "America/Toronto",
  
  "pacific": "America/Los_Angeles",
  "pt": "America/Los_Angeles",
  "pst": "America/Los_Angeles",
  "pdt": "America/Los_Angeles",
  "la": "America/Los_Angeles",
  "los angeles": "America/Los_Angeles",
  "san francisco": "America/Los_Angeles",
  "sf": "America/Los_Angeles",
  "seattle": "America/Los_Angeles",
  "portland": "America/Los_Angeles",
  "san diego": "America/Los_Angeles",
  "california": "America/Los_Angeles",
  "california time": "America/Los_Angeles",
  "sacramento": "America/Los_Angeles",
  "oakland": "America/Los_Angeles",
  "silicon valley": "America/Los_Angeles",
  "vancouver": "America/Vancouver",
  
  "central": "America/Chicago",
  "ct": "America/Chicago",
  "cst": "America/Chicago", // North American Central (not to be confused with China)
  "cdt": "America/Chicago",
  "chicago": "America/Chicago",
  "dallas": "America/Chicago",
  "houston": "America/Chicago",
  "texas": "America/Chicago",
  "austin": "America/Chicago",
  "san antonio": "America/Chicago",
  "memphis": "America/Chicago", 
  "st louis": "America/Chicago",
  "new orleans": "America/Chicago",
  "minneapolis": "America/Chicago",
  "milwaukee": "America/Chicago",
  "kansas city": "America/Chicago",
  "winnipeg": "America/Winnipeg",
  
  "mountain": "America/Denver",
  "mt": "America/Denver",
  "mst": "America/Denver",
  "mdt": "America/Denver",
  "denver": "America/Denver",
  "boulder": "America/Denver",
  "colorado": "America/Denver",
  "phoenix": "America/Phoenix",
  "tucson": "America/Phoenix",
  "arizona": "America/Phoenix",
  "salt lake city": "America/Denver",
  "utah": "America/Denver",
  "albuquerque": "America/Denver",
  "new mexico": "America/Denver",
  "calgary": "America/Edmonton",
  "edmonton": "America/Edmonton",
  "alberta": "America/Edmonton",
  
  "hawaii": "Pacific/Honolulu",
  "honolulu": "Pacific/Honolulu",
  "hst": "Pacific/Honolulu",
  "alaska": "America/Anchorage",
  "anchorage": "America/Anchorage",
  "akst": "America/Anchorage",
  
  "mexico": "America/Mexico_City",
  "mexico city": "America/Mexico_City",
  "guadalajara": "America/Mexico_City",
  "monterrey": "America/Monterrey",
  
  // South America
  "brazil": "America/Sao_Paulo",
  "são paulo": "America/Sao_Paulo",
  "sao paulo": "America/Sao_Paulo",
  "rio": "America/Sao_Paulo",
  "rio de janeiro": "America/Sao_Paulo",
  "brasilia": "America/Sao_Paulo",
  "argentina": "America/Buenos_Aires",
  "buenos aires": "America/Buenos_Aires",
  "chile": "America/Santiago",
  "santiago": "America/Santiago",
  "colombia": "America/Bogota",
  "bogota": "America/Bogota",
  "bogotá": "America/Bogota",
  "peru": "America/Lima",
  "lima": "America/Lima",
  "venezuela": "America/Caracas",
  "caracas": "America/Caracas",
  "ecuador": "America/Guayaquil",
  "quito": "America/Guayaquil",
  "guayaquil": "America/Guayaquil",
  
  // Europe & UTC
  "gmt": "Europe/London",
  "utc": "Etc/UTC",
  "uk": "Europe/London", 
  "england": "Europe/London",
  "london": "Europe/London",
  "britain": "Europe/London",
  "british": "Europe/London",
  "manchester": "Europe/London",
  "birmingham": "Europe/London",
  "scotland": "Europe/London",
  "edinburgh": "Europe/London",
  "glasgow": "Europe/London",
  "dublin": "Europe/Dublin",
  "ireland": "Europe/Dublin",
  "lisbon": "Europe/Lisbon",
  "portugal": "Europe/Lisbon",
  
  "cet": "Europe/Paris",
  "central europe": "Europe/Paris",
  "france": "Europe/Paris",
  "paris": "Europe/Paris",
  "marseille": "Europe/Paris",
  "lyon": "Europe/Paris",
  "brussels": "Europe/Brussels",
  "belgium": "Europe/Brussels",
  "netherlands": "Europe/Amsterdam",
  "amsterdam": "Europe/Amsterdam",
  "rotterdam": "Europe/Amsterdam",
  "the hague": "Europe/Amsterdam",
  "luxembourg": "Europe/Luxembourg",
  "spain": "Europe/Madrid",
  "madrid": "Europe/Madrid",
  "barcelona": "Europe/Madrid",
  "valencia": "Europe/Madrid",
  "seville": "Europe/Madrid",
  "malaga": "Europe/Madrid",
  
  "germany": "Europe/Berlin",
  "berlin": "Europe/Berlin",
  "munich": "Europe/Berlin",
  "frankfurt": "Europe/Berlin",
  "hamburg": "Europe/Berlin",
  "cologne": "Europe/Berlin",
  "düsseldorf": "Europe/Berlin",
  "dusseldorf": "Europe/Berlin",
  "stuttgart": "Europe/Berlin",
  "austria": "Europe/Vienna",
  "vienna": "Europe/Vienna",
  "switzerland": "Europe/Zurich",
  "zurich": "Europe/Zurich",
  "geneva": "Europe/Zurich",
  "bern": "Europe/Zurich",
  "italy": "Europe/Rome",
  "rome": "Europe/Rome",
  "milan": "Europe/Rome",
  "naples": "Europe/Rome",
  "florence": "Europe/Rome",
  "venice": "Europe/Rome",
  
  "stockholm": "Europe/Stockholm",
  "sweden": "Europe/Stockholm",
  "norway": "Europe/Oslo",
  "oslo": "Europe/Oslo",
  "denmark": "Europe/Copenhagen",
  "copenhagen": "Europe/Copenhagen",
  "finland": "Europe/Helsinki",
  "helsinki": "Europe/Helsinki",
  
  "poland": "Europe/Warsaw",
  "warsaw": "Europe/Warsaw",
  "czech": "Europe/Prague",
  "prague": "Europe/Prague",
  "hungary": "Europe/Budapest",
  "budapest": "Europe/Budapest",
  "romania": "Europe/Bucharest",
  "bucharest": "Europe/Bucharest",
  "bulgaria": "Europe/Sofia",
  "sofia": "Europe/Sofia",
  "greece": "Europe/Athens",
  "athens": "Europe/Athens",
  
  // Russia & Eastern Europe
  "moscow": "Europe/Moscow",
  "russia": "Europe/Moscow",
  "st petersburg": "Europe/Moscow",
  "ukraine": "Europe/Kiev",
  "kiev": "Europe/Kiev",
  "kyiv": "Europe/Kiev",
  "istanbul": "Europe/Istanbul",
  "turkey": "Europe/Istanbul",
  "ankara": "Europe/Istanbul",
  
  // Middle East
  "israel": "Asia/Jerusalem",
  "jerusalem": "Asia/Jerusalem",
  "tel aviv": "Asia/Jerusalem",
  "dubai": "Asia/Dubai",
  "uae": "Asia/Dubai",
  "united arab emirates": "Asia/Dubai",
  "abu dhabi": "Asia/Dubai",
  "qatar": "Asia/Qatar",
  "doha": "Asia/Qatar",
  "saudi arabia": "Asia/Riyadh",
  "riyadh": "Asia/Riyadh",
  "jeddah": "Asia/Riyadh",
  
  // Asia
  "ist": "Asia/Kolkata",
  "india": "Asia/Kolkata",
  "mumbai": "Asia/Kolkata",
  "delhi": "Asia/Kolkata",
  "new delhi": "Asia/Kolkata",
  "bangalore": "Asia/Kolkata",
  "bengaluru": "Asia/Kolkata",
  "chennai": "Asia/Kolkata",
  "hyderabad": "Asia/Kolkata",
  "kolkata": "Asia/Kolkata",
  "ahmedabad": "Asia/Kolkata",
  "pune": "Asia/Kolkata",
  
  "jst": "Asia/Tokyo",
  "japan": "Asia/Tokyo",
  "tokyo": "Asia/Tokyo",
  "osaka": "Asia/Tokyo",
  "kyoto": "Asia/Tokyo",
  "yokohama": "Asia/Tokyo",
  "nagoya": "Asia/Tokyo",
  "fukuoka": "Asia/Tokyo",
  "sapporo": "Asia/Tokyo",
  
  "kst": "Asia/Seoul",
  "korea": "Asia/Seoul",
  "south korea": "Asia/Seoul",
  "seoul": "Asia/Seoul",
  "busan": "Asia/Seoul",
  "incheon": "Asia/Seoul",
  
  "beijing": "Asia/Shanghai",
  "china": "Asia/Shanghai",
  "cst china": "Asia/Shanghai", // China Standard Time
  "shanghai": "Asia/Shanghai",
  "guangzhou": "Asia/Shanghai",
  "shenzhen": "Asia/Shanghai",
  "chengdu": "Asia/Shanghai",
  "wuhan": "Asia/Shanghai",
  "hangzhou": "Asia/Shanghai",
  "macau": "Asia/Shanghai",
  
  "hong kong": "Asia/Hong_Kong",
  "hk": "Asia/Hong_Kong",
  
  "taiwan": "Asia/Taipei",
  "taipei": "Asia/Taipei",
  
  "singapore": "Asia/Singapore",
  "sgt": "Asia/Singapore",
  
  "malaysia": "Asia/Kuala_Lumpur",
  "kuala lumpur": "Asia/Kuala_Lumpur",
  "philippines": "Asia/Manila",
  "manila": "Asia/Manila",
  "vietnam": "Asia/Ho_Chi_Minh",
  "ho chi minh": "Asia/Ho_Chi_Minh",
  "hanoi": "Asia/Ho_Chi_Minh",
  "bangkok": "Asia/Bangkok",
  "thailand": "Asia/Bangkok",
  "indonesia": "Asia/Jakarta",
  "jakarta": "Asia/Jakarta",
  "bali": "Asia/Makassar",
  
  // Australia & Pacific
  "australia": "Australia/Sydney",
  "sydney": "Australia/Sydney",
  "melbourne": "Australia/Melbourne",
  "brisbane": "Australia/Brisbane",
  "queensland": "Australia/Brisbane",
  "adelaide": "Australia/Adelaide",
  "perth": "Australia/Perth",
  "western australia": "Australia/Perth",
  
  "new zealand": "Pacific/Auckland",
  "auckland": "Pacific/Auckland",
  "wellington": "Pacific/Auckland",
  "nz": "Pacific/Auckland",
  
  // Africa
  "south africa": "Africa/Johannesburg",
  "johannesburg": "Africa/Johannesburg",
  "cape town": "Africa/Johannesburg",
  "egypt": "Africa/Cairo",
  "cairo": "Africa/Cairo",
  "nigeria": "Africa/Lagos",
  "lagos": "Africa/Lagos",
  "kenya": "Africa/Nairobi",
  "nairobi": "Africa/Nairobi",
  "morocco": "Africa/Casablanca",
  "casablanca": "Africa/Casablanca"
};

// Time patterns to match in queries
const timePatterns = {
  timeWithAmPm: /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i,
  timeWithColon: /\b(\d{1,2}):(\d{2})(?:\s*(am|pm))?\b/i,
  timeWithoutColon: /\b(\d{1,2})(\d{2})(?:\s*(am|pm))?\b/i,
  hour24: /\b([01]\d|2[0-3])(?::([0-5]\d))?\b/,
  militaryTime: /\b([01]\d|2[0-3])([0-5]\d)\b/,
  justHour: /\b(\d{1,2})\s*(?:o'?clock)?\s*(am|pm)?\b/i,
  wordTime: /\b(?:noon|midnight|midday)\b/i,
  relativeTime: /\b(?:morning|afternoon|evening|night)\b/i,
};

// Day patterns (today, tomorrow, weekday names)
const dayPatterns = {
  today: /\b(?:today|tonight)\b/i,
  tomorrow: /\btomorrow\b/i,
  dayOfWeek: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i,
  dayOfMonth: /\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/i,
  monthDay: /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i,
  nextWeek: /\bnext\s+(week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i,
  inXDays: /\bin\s+(\d+)\s+days?\b/i,
  daysFromNow: /\b(\d+)\s+days?\s+from\s+(?:now|today)\b/i,
};

// Extract time zones from user input
const extractTimeZones = (text: string): { fromZone?: string; toZone?: string; isLocalToRemote: boolean } => {
  const result = { 
    fromZone: undefined as string | undefined, 
    toZone: undefined as string | undefined,
    isLocalToRemote: false
  };
  const lowerText = text.toLowerCase();
  
  // Look for patterns like "in PST", "from EST to JST"
  const inPattern = /\bin\s+([a-z\s]+)\b/i;
  const fromToPattern = /\bfrom\s+([a-z\s]+)\s+to\s+([a-z\s]+)\b/i;
  
  // Check for "I am in [zone]" pattern - this indicates user's local time zone
  const iAmInPattern = /\bi(?:'m| am)\s+in\s+([a-z\s]+)\b/i;
  const iAmInMatch = text.match(iAmInPattern);
  if (iAmInMatch) {
    const zoneKey = iAmInMatch[1].toLowerCase().trim();
    if (zoneAliases[zoneKey]) {
      result.fromZone = zoneAliases[zoneKey];
      result.isLocalToRemote = true; // User is specifying their local timezone
    }
  }
  
  // Check for "call at X time [zone]" pattern - this indicates target time zone
  const callPattern = /\b(?:call|meeting)(?:\s+(?:at|in|for))?\s+.*?\s+([a-z]{2,})\b/i;
  const callMatch = text.match(callPattern);
  if (callMatch) {
    const zoneKey = callMatch[1].toLowerCase().trim();
    if (zoneAliases[zoneKey]) {
      result.toZone = zoneAliases[zoneKey]; 
      result.isLocalToRemote = true; // Call time is in target timezone
    }
  }
  
  // Try from-to pattern (explicit conversion direction)
  const fromToMatch = text.match(fromToPattern);
  if (fromToMatch) {
    const fromKey = fromToMatch[1].toLowerCase().trim();
    const toKey = fromToMatch[2].toLowerCase().trim();
    
    // Try to match with our aliases
    if (zoneAliases[fromKey]) result.fromZone = zoneAliases[fromKey];
    if (zoneAliases[toKey]) result.toZone = zoneAliases[toKey];
    
    return result;
  }
  
  // Try "in" pattern for target time zone
  const inMatch = text.match(inPattern);
  if (inMatch) {
    const zoneKey = inMatch[1].toLowerCase().trim();
    if (zoneAliases[zoneKey]) {
      // If we already have a "from" zone from "I am in", this is the "to" zone
      if (result.fromZone) {
        result.toZone = zoneAliases[zoneKey];
      } else {
        result.toZone = zoneAliases[zoneKey]; 
      }
    }
  }
  
  // If we don't have explicit patterns, search for any timezone mentions
  if (!result.fromZone || !result.toZone) {
    // First check for any explicit city or timezone mentions
    for (const [key, value] of Object.entries(zoneAliases)) {
      // Check for exact matches (surrounded by spaces or punctuation)
      const boundaryRegex = new RegExp(`\\b${key}\\b`, 'i');
      if (boundaryRegex.test(lowerText)) {
        if (!result.toZone) {
          result.toZone = value;
        } else if (!result.fromZone) {
          result.fromZone = value;
        }
        // If we have both zones, no need to continue
        if (result.fromZone && result.toZone) break;
      }
    }
    
    // If we still don't have both zones, try more aggressive matching
    if (!result.fromZone || !result.toZone) {
      const parts = lowerText.split(/\s+/);
      for (let i = 0; i < parts.length; i++) {
        const currentPart = parts[i].toLowerCase();
        
        // Try to match current part
        if (zoneAliases[currentPart] && !result.toZone) {
          result.toZone = zoneAliases[currentPart];
        } else if (zoneAliases[currentPart] && !result.fromZone) {
          result.fromZone = zoneAliases[currentPart];
        }
        
        // Try to match multi-word locations (up to 3 words)
        for (let j = 1; j <= 3 && i + j < parts.length; j++) {
          const multiWordPart = parts.slice(i, i + j + 1).join(' ').toLowerCase();
          if (zoneAliases[multiWordPart] && !result.toZone) {
            result.toZone = zoneAliases[multiWordPart];
            i += j; // Skip the words we've used
            break;
          } else if (zoneAliases[multiWordPart] && !result.fromZone) {
            result.fromZone = zoneAliases[multiWordPart];
            i += j; // Skip the words we've used
            break;
          }
        }
      }
    }
  }
  
  return result;
};

// Extract time from user input
const extractTime = (text: string): string | undefined => {
  const lowerText = text.toLowerCase();
  
  // Handle special word times
  if (/\bnoon\b/i.test(lowerText)) {
    return "12:00 pm";
  }
  if (/\bmidnight\b/i.test(lowerText) || /\b12\s*(?:am|a\.m\.)\b/i.test(lowerText)) {
    return "12:00 am";
  }
  if (/\bmidday\b/i.test(lowerText)) {
    return "12:00 pm";
  }
  
  // Handle relative times
  if (/\bmorning\b/i.test(lowerText) && !/\d+\s*(?:in the|at)\s+morning\b/i.test(lowerText)) {
    return "9:00 am"; // Default morning time
  }
  if (/\bafternoon\b/i.test(lowerText) && !/\d+\s*(?:in the|at)\s+afternoon\b/i.test(lowerText)) {
    return "3:00 pm"; // Default afternoon time
  }
  if (/\bevening\b/i.test(lowerText) && !/\d+\s*(?:in the|at)\s+evening\b/i.test(lowerText)) {
    return "7:00 pm"; // Default evening time
  }
  if (/\bnight\b/i.test(lowerText) && !/\d+\s*(?:at)\s+night\b/i.test(lowerText)) {
    return "9:00 pm"; // Default night time
  }
  
  // Try all time patterns
  let timeMatch = null;
  let matchedPatternName = ''; // Track which pattern was matched
  
  // Try all time patterns
  for (const [patternName, pattern] of Object.entries(timePatterns)) {
    timeMatch = lowerText.match(pattern);
    if (timeMatch) {
      matchedPatternName = patternName;
      break;
    }
  }
  
  if (!timeMatch) return undefined;
  
  // Format matched time
  if (matchedPatternName === 'wordTime') {
    // Already handled above, but just in case
    const wordTime = timeMatch[0].toLowerCase();
    if (wordTime === 'noon' || wordTime === 'midday') return "12:00 pm";
    if (wordTime === 'midnight') return "12:00 am";
    return undefined;
  } else if (matchedPatternName === 'relativeTime') {
    // Already handled above, but just in case
    const partOfDay = timeMatch[0].toLowerCase();
    if (partOfDay === 'morning') return "9:00 am";
    if (partOfDay === 'afternoon') return "3:00 pm";
    if (partOfDay === 'evening') return "7:00 pm";
    if (partOfDay === 'night') return "9:00 pm";
    return undefined;
  } else if (timeMatch[3]) { // Has AM/PM
    return `${timeMatch[1]}:${timeMatch[2] || '00'} ${timeMatch[3]}`;
  } else if (matchedPatternName === 'justHour' && timeMatch[2]) { // Just hour with AM/PM
    return `${timeMatch[1]}:00 ${timeMatch[2]}`;
  } else if (matchedPatternName === 'justHour') { // Just hour without AM/PM
    // Try to infer am/pm based on the hour
    const hour = parseInt(timeMatch[1], 10);
    if (hour <= 6) return `${hour}:00 pm`; // Assume 1-6 is PM by default
    return `${hour}:00 am`; // Otherwise assume AM
  } else { // 24 hour format or without AM/PM
    return `${timeMatch[1]}:${timeMatch[2] || '00'}`;
  }
};

// Extract date from user input
const extractDate = (text: string): string | undefined => {
  const lowerText = text.toLowerCase();
  
  // Check for today/tomorrow
  if (dayPatterns.today.test(lowerText)) return 'today';
  if (dayPatterns.tomorrow.test(lowerText)) return 'tomorrow';
  
  // Check for "in X days"
  const inXDaysMatch = lowerText.match(dayPatterns.inXDays);
  if (inXDaysMatch) return `in ${inXDaysMatch[1]} days`;
  
  // Check for "X days from now"
  const daysFromNowMatch = lowerText.match(dayPatterns.daysFromNow);
  if (daysFromNowMatch) return `in ${daysFromNowMatch[1]} days`;
  
  // Check for day of week
  const dowMatch = lowerText.match(dayPatterns.dayOfWeek);
  if (dowMatch) return dowMatch[1];
  
  // Check for date formats like "June 15th" or "15th of June"
  const dayMonthMatch = lowerText.match(dayPatterns.dayOfMonth);
  if (dayMonthMatch) return `${dayMonthMatch[2]} ${dayMonthMatch[1]}`;
  
  const monthDayMatch = lowerText.match(dayPatterns.monthDay);
  if (monthDayMatch) return `${monthDayMatch[1]} ${monthDayMatch[2]}`;
  
  // Check for "next week", "next Monday" etc.
  const nextMatch = lowerText.match(dayPatterns.nextWeek);
  if (nextMatch) return `next ${nextMatch[1]}`;
  
  return undefined;
};

// Parse the user's query
export const parseTimeQuery = (text: string): ParsedQuery => {
  const lowerText = text.toLowerCase();
  const result: ParsedQuery = {
    isValid: false,
    originalText: text,
    isLocalToRemote: false
  };
  
  // Extract time zones
  const zones = extractTimeZones(lowerText);
  result.fromZone = zones.fromZone;
  result.toZone = zones.toZone;
  result.isLocalToRemote = zones.isLocalToRemote;
  
  // Extract time
  result.time = extractTime(lowerText);
  
  // Extract date
  result.date = extractDate(lowerText);
  
  // Query is valid if we have at least a time and a timezone
  result.isValid = !!(result.time && (result.fromZone || result.toZone));
  
  // Debug
  console.log("Parsed query:", result);
  
  return result;
};

// Generate a response to the user
export const generateResponse = (parsedQuery: ParsedQuery): string => {
  if (!parsedQuery.isValid) {
    return "I couldn't understand your time query. Please specify a time and at least one time zone.";
  }
  
  const timeStr = parsedQuery.time || "the specified time";
  const dateStr = parsedQuery.date ? ` on ${parsedQuery.date}` : "";
  const fromZone = parsedQuery.fromZone ? getTimeZoneName(parsedQuery.fromZone) : "your time zone";
  const toZone = parsedQuery.toZone ? getTimeZoneName(parsedQuery.toZone) : "the target time zone";
  
  return `I'll convert ${timeStr}${dateStr} from ${fromZone} to ${toZone}.`;
};

// Get a friendly time zone name
const getTimeZoneName = (timeZoneId: string): string => {
  const parts = timeZoneId.split("/");
  return parts[parts.length - 1].replace(/_/g, " ");
};
