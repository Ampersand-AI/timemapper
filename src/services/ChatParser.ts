
// Natural language parser for time zone conversion queries

interface ParsedQuery {
  fromZone?: string;
  toZone?: string;
  time?: string;
  date?: string;
  isValid: boolean;
  originalText: string;
}

// Common time zone aliases
const zoneAliases: Record<string, string> = {
  "eastern": "America/New_York",
  "et": "America/New_York", 
  "est": "America/New_York",
  "edt": "America/New_York",
  "new york": "America/New_York",
  "ny": "America/New_York",
  "pacific": "America/Los_Angeles",
  "pt": "America/Los_Angeles",
  "pst": "America/Los_Angeles",
  "pdt": "America/Los_Angeles",
  "la": "America/Los_Angeles",
  "los angeles": "America/Los_Angeles",
  "central": "America/Chicago",
  "ct": "America/Chicago",
  "cst": "America/Chicago",
  "cdt": "America/Chicago",
  "chicago": "America/Chicago",
  "mountain": "America/Denver",
  "mt": "America/Denver",
  "mst": "America/Denver",
  "mdt": "America/Denver",
  "denver": "America/Denver",
  "gmt": "Europe/London",
  "utc": "Etc/UTC",
  "london": "Europe/London",
  "uk": "Europe/London",
  "ist": "Asia/Kolkata",
  "india": "Asia/Kolkata",
  "jst": "Asia/Tokyo",
  "japan": "Asia/Tokyo",
  "tokyo": "Asia/Tokyo",
  "cet": "Europe/Paris",
  "paris": "Europe/Paris",
  "berlin": "Europe/Berlin",
  "germany": "Europe/Berlin",
  "aest": "Australia/Sydney",
  "sydney": "Australia/Sydney",
  "australia": "Australia/Sydney",
  "singapore": "Asia/Singapore",
  "sgt": "Asia/Singapore",
  "beijing": "Asia/Shanghai",
  "china": "Asia/Shanghai",
  "cst china": "Asia/Shanghai",
};

// Time patterns to match in queries
const timePatterns = {
  timeWithAmPm: /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i,
  timeWithColon: /\b(\d{1,2}):(\d{2})(?:\s*(am|pm))?\b/i,
  timeWithoutColon: /\b(\d{1,2})(\d{2})(?:\s*(am|pm))?\b/i,
  hour24: /\b([01]\d|2[0-3])(?::([0-5]\d))?\b/,
  militaryTime: /\b([01]\d|2[0-3])([0-5]\d)\b/,
};

// Day patterns (today, tomorrow, weekday names)
const dayPatterns = {
  today: /\b(?:today|tonight)\b/i,
  tomorrow: /\btomorrow\b/i,
  dayOfWeek: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i,
  dayOfMonth: /\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/i,
  monthDay: /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i,
  nextWeek: /\bnext\s+(week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i,
};

// Extract time zones from user input
const extractTimeZones = (text: string): { fromZone?: string; toZone?: string } => {
  const result = { fromZone: undefined as string | undefined, toZone: undefined as string | undefined };
  const parts = text.toLowerCase().split(/\s+/);
  
  // Look for patterns like "in PST", "from EST to JST"
  const inPattern = /\bin\s+([a-z\s]+)\b/i;
  const fromToPattern = /\bfrom\s+([a-z\s]+)\s+to\s+([a-z\s]+)\b/i;
  
  // Try from-to pattern first
  const fromToMatch = text.match(fromToPattern);
  if (fromToMatch) {
    const fromKey = fromToMatch[1].toLowerCase().trim();
    const toKey = fromToMatch[2].toLowerCase().trim();
    
    // Try to match with our aliases
    if (zoneAliases[fromKey]) result.fromZone = zoneAliases[fromKey];
    if (zoneAliases[toKey]) result.toZone = zoneAliases[toKey];
    
    return result;
  }
  
  // Try "in" pattern
  const inMatch = text.match(inPattern);
  if (inMatch) {
    const zoneKey = inMatch[1].toLowerCase().trim();
    if (zoneAliases[zoneKey]) result.fromZone = zoneAliases[zoneKey];
  }
  
  // If we don't have explicit patterns, search for any timezone mentions
  if (!result.fromZone && !result.toZone) {
    for (let i = 0; i < parts.length; i++) {
      const currentPart = parts[i].toLowerCase();
      const nextPart = i < parts.length - 1 ? parts[i + 1].toLowerCase() : '';
      const combined = `${currentPart} ${nextPart}`.trim();
      
      if (zoneAliases[currentPart] && !result.fromZone) {
        result.fromZone = zoneAliases[currentPart];
      } else if (zoneAliases[combined] && !result.fromZone) {
        result.fromZone = zoneAliases[combined];
        i++; // Skip the next part since we used it
      } else if (zoneAliases[currentPart] && result.fromZone && !result.toZone) {
        result.toZone = zoneAliases[currentPart];
      } else if (zoneAliases[combined] && result.fromZone && !result.toZone) {
        result.toZone = zoneAliases[combined];
        i++; // Skip the next part since we used it
      }
    }
  }
  
  return result;
};

// Extract time from user input
const extractTime = (text: string): string | undefined => {
  let timeMatch = null;
  
  // Try all time patterns
  for (const [patternName, pattern] of Object.entries(timePatterns)) {
    timeMatch = text.match(pattern);
    if (timeMatch) break;
  }
  
  if (!timeMatch) return undefined;
  
  // Format matched time
  if (timeMatch[3]) { // Has AM/PM
    return `${timeMatch[1]}:${timeMatch[2] || '00'} ${timeMatch[3]}`;
  } else { // 24 hour format or without AM/PM
    return `${timeMatch[1]}:${timeMatch[2] || '00'}`;
  }
};

// Extract date from user input
const extractDate = (text: string): string | undefined => {
  // Check for today/tomorrow
  if (dayPatterns.today.test(text)) return 'today';
  if (dayPatterns.tomorrow.test(text)) return 'tomorrow';
  
  // Check for day of week
  const dowMatch = text.match(dayPatterns.dayOfWeek);
  if (dowMatch) return dowMatch[1];
  
  // Check for date formats like "June 15th" or "15th of June"
  const dayMonthMatch = text.match(dayPatterns.dayOfMonth);
  if (dayMonthMatch) return `${dayMonthMatch[2]} ${dayMonthMatch[1]}`;
  
  const monthDayMatch = text.match(dayPatterns.monthDay);
  if (monthDayMatch) return `${monthDayMatch[1]} ${monthDayMatch[2]}`;
  
  // Check for "next week", "next Monday" etc.
  const nextMatch = text.match(dayPatterns.nextWeek);
  if (nextMatch) return `next ${nextMatch[1]}`;
  
  return undefined;
};

// Parse the user's query
export const parseTimeQuery = (text: string): ParsedQuery => {
  const lowerText = text.toLowerCase();
  const result: ParsedQuery = {
    isValid: false,
    originalText: text,
  };
  
  // Extract time zones
  const zones = extractTimeZones(lowerText);
  result.fromZone = zones.fromZone;
  result.toZone = zones.toZone;
  
  // Extract time
  result.time = extractTime(lowerText);
  
  // Extract date
  result.date = extractDate(lowerText);
  
  // Query is valid if we have at least a time and a timezone
  result.isValid = !!(result.time && (result.fromZone || result.toZone));
  
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
