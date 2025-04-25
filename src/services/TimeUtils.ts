import { format, formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { addHours, differenceInHours } from 'date-fns';

export interface TimeZoneData {
  id: string;
  name: string;
  offset: string;
  abbreviation: string;
  countryName?: string;
}

export interface ConvertedTime {
  fromZone: TimeZoneData;
  toZone: TimeZoneData;
  fromTime: Date;
  toTime: Date;
  timeGap: number;
}

// Enhanced timezone database with expanded cities
export const timeZones: TimeZoneData[] = [
  // Americas
  { id: 'America/New_York', name: 'New York', offset: '-05:00', abbreviation: 'EST', countryName: 'United States' },
  { id: 'America/Los_Angeles', name: 'Los Angeles', offset: '-08:00', abbreviation: 'PST', countryName: 'United States' },
  { id: 'America/Chicago', name: 'Chicago', offset: '-06:00', abbreviation: 'CST', countryName: 'United States' },
  { id: 'America/Denver', name: 'Denver', offset: '-07:00', abbreviation: 'MST', countryName: 'United States' },
  { id: 'America/Phoenix', name: 'Phoenix', offset: '-07:00', abbreviation: 'MST', countryName: 'United States' },
  { id: 'America/Toronto', name: 'Toronto', offset: '-05:00', abbreviation: 'EST', countryName: 'Canada' },
  { id: 'America/Vancouver', name: 'Vancouver', offset: '-08:00', abbreviation: 'PST', countryName: 'Canada' },
  { id: 'America/Mexico_City', name: 'Mexico City', offset: '-06:00', abbreviation: 'CST', countryName: 'Mexico' },
  { id: 'America/Sao_Paulo', name: 'Sao Paulo', offset: '-03:00', abbreviation: 'BRT', countryName: 'Brazil' },
  { id: 'America/Buenos_Aires', name: 'Buenos Aires', offset: '-03:00', abbreviation: 'ART', countryName: 'Argentina' },
  
  // Europe
  { id: 'Europe/London', name: 'London', offset: '+00:00', abbreviation: 'GMT', countryName: 'United Kingdom' },
  { id: 'Europe/Paris', name: 'Paris', offset: '+01:00', abbreviation: 'CET', countryName: 'France' },
  { id: 'Europe/Berlin', name: 'Berlin', offset: '+01:00', abbreviation: 'CET', countryName: 'Germany' },
  { id: 'Europe/Madrid', name: 'Madrid', offset: '+01:00', abbreviation: 'CET', countryName: 'Spain' },
  { id: 'Europe/Rome', name: 'Rome', offset: '+01:00', abbreviation: 'CET', countryName: 'Italy' },
  { id: 'Europe/Amsterdam', name: 'Amsterdam', offset: '+01:00', abbreviation: 'CET', countryName: 'Netherlands' },
  { id: 'Europe/Stockholm', name: 'Stockholm', offset: '+01:00', abbreviation: 'CET', countryName: 'Sweden' },
  { id: 'Europe/Copenhagen', name: 'Copenhagen', offset: '+01:00', abbreviation: 'CET', countryName: 'Denmark' },
  { id: 'Europe/Oslo', name: 'Oslo', offset: '+01:00', abbreviation: 'CET', countryName: 'Norway' },
  { id: 'Europe/Helsinki', name: 'Helsinki', offset: '+02:00', abbreviation: 'EET', countryName: 'Finland' },
  { id: 'Europe/Athens', name: 'Athens', offset: '+02:00', abbreviation: 'EET', countryName: 'Greece' },
  { id: 'Europe/Vienna', name: 'Vienna', offset: '+01:00', abbreviation: 'CET', countryName: 'Austria' },
  { id: 'Europe/Zurich', name: 'Zurich', offset: '+01:00', abbreviation: 'CET', countryName: 'Switzerland' },
  { id: 'Europe/Brussels', name: 'Brussels', offset: '+01:00', abbreviation: 'CET', countryName: 'Belgium' },
  { id: 'Europe/Lisbon', name: 'Lisbon', offset: '+00:00', abbreviation: 'WET', countryName: 'Portugal' },
  { id: 'Europe/Dublin', name: 'Dublin', offset: '+00:00', abbreviation: 'GMT', countryName: 'Ireland' },
  
  // Asia
  { id: 'Asia/Tokyo', name: 'Tokyo', offset: '+09:00', abbreviation: 'JST', countryName: 'Japan' },
  { id: 'Asia/Shanghai', name: 'Shanghai', offset: '+08:00', abbreviation: 'CST', countryName: 'China' },
  { id: 'Asia/Hong_Kong', name: 'Hong Kong', offset: '+08:00', abbreviation: 'HKT', countryName: 'China' },
  { id: 'Asia/Singapore', name: 'Singapore', offset: '+08:00', abbreviation: 'SGT', countryName: 'Singapore' },
  { id: 'Asia/Seoul', name: 'Seoul', offset: '+09:00', abbreviation: 'KST', countryName: 'South Korea' },
  { id: 'Asia/Dubai', name: 'Dubai', offset: '+04:00', abbreviation: 'GST', countryName: 'United Arab Emirates' },
  { id: 'Asia/Mumbai', name: 'Mumbai', offset: '+05:30', abbreviation: 'IST', countryName: 'India' },
  { id: 'Asia/Kolkata', name: 'Kolkata', offset: '+05:30', abbreviation: 'IST', countryName: 'India' },
  { id: 'Asia/Calcutta', name: 'Calcutta', offset: '+05:30', abbreviation: 'IST', countryName: 'India' },
  { id: 'Asia/Delhi', name: 'Delhi', offset: '+05:30', abbreviation: 'IST', countryName: 'India' },
  { id: 'Asia/Bangkok', name: 'Bangkok', offset: '+07:00', abbreviation: 'ICT', countryName: 'Thailand' },
  { id: 'Asia/Jakarta', name: 'Jakarta', offset: '+07:00', abbreviation: 'WIB', countryName: 'Indonesia' },
  { id: 'Asia/Manila', name: 'Manila', offset: '+08:00', abbreviation: 'PHT', countryName: 'Philippines' },
  { id: 'Asia/Kuala_Lumpur', name: 'Kuala Lumpur', offset: '+08:00', abbreviation: 'MYT', countryName: 'Malaysia' },
  { id: 'Asia/Taipei', name: 'Taipei', offset: '+08:00', abbreviation: 'CST', countryName: 'Taiwan' },
  { id: 'Asia/Riyadh', name: 'Riyadh', offset: '+03:00', abbreviation: 'AST', countryName: 'Saudi Arabia' },
  { id: 'Asia/Jerusalem', name: 'Jerusalem', offset: '+02:00', abbreviation: 'IST', countryName: 'Israel' },
  { id: 'Asia/Tehran', name: 'Tehran', offset: '+03:30', abbreviation: 'IRST', countryName: 'Iran' },
  
  // Australia & Pacific
  { id: 'Australia/Sydney', name: 'Sydney', offset: '+11:00', abbreviation: 'AEDT', countryName: 'Australia' },
  { id: 'Australia/Melbourne', name: 'Melbourne', offset: '+11:00', abbreviation: 'AEDT', countryName: 'Australia' },
  { id: 'Australia/Perth', name: 'Perth', offset: '+08:00', abbreviation: 'AWST', countryName: 'Australia' },
  { id: 'Australia/Brisbane', name: 'Brisbane', offset: '+10:00', abbreviation: 'AEST', countryName: 'Australia' },
  { id: 'Australia/Adelaide', name: 'Adelaide', offset: '+10:30', abbreviation: 'ACDT', countryName: 'Australia' },
  { id: 'Pacific/Auckland', name: 'Auckland', offset: '+13:00', abbreviation: 'NZDT', countryName: 'New Zealand' },
  { id: 'Pacific/Fiji', name: 'Fiji', offset: '+13:00', abbreviation: 'FJT', countryName: 'Fiji' },
  { id: 'Pacific/Honolulu', name: 'Honolulu', offset: '-10:00', abbreviation: 'HST', countryName: 'United States' },
  
  // Africa
  { id: 'Africa/Cairo', name: 'Cairo', offset: '+02:00', abbreviation: 'EET', countryName: 'Egypt' },
  { id: 'Africa/Lagos', name: 'Lagos', offset: '+01:00', abbreviation: 'WAT', countryName: 'Nigeria' },
  { id: 'Africa/Nairobi', name: 'Nairobi', offset: '+03:00', abbreviation: 'EAT', countryName: 'Kenya' },
  { id: 'Africa/Johannesburg', name: 'Johannesburg', offset: '+02:00', abbreviation: 'SAST', countryName: 'South Africa' },
  { id: 'Africa/Casablanca', name: 'Casablanca', offset: '+00:00', abbreviation: 'WET', countryName: 'Morocco' },
  { id: 'Africa/Tunis', name: 'Tunis', offset: '+01:00', abbreviation: 'CET', countryName: 'Tunisia' },
  { id: 'Africa/Accra', name: 'Accra', offset: '+00:00', abbreviation: 'GMT', countryName: 'Ghana' },
  { id: 'Africa/Addis_Ababa', name: 'Addis Ababa', offset: '+03:00', abbreviation: 'EAT', countryName: 'Ethiopia' }
];

// Enhanced findTimeZone function with better city matching
export const findTimeZone = (query: string): TimeZoneData | undefined => {
  if (!query) return undefined;
  
  const normalizedQuery = query.trim().toLowerCase();
  
  // Try exact matches first
  const exactMatch = timeZones.find(tz => 
    tz.name.toLowerCase() === normalizedQuery ||
    tz.id.toLowerCase() === normalizedQuery ||
    tz.abbreviation.toLowerCase() === normalizedQuery ||
    (tz.countryName && tz.countryName.toLowerCase() === normalizedQuery)
  );
  
  if (exactMatch) return exactMatch;
  
  // Try partial matches for country names (for queries like "sweden" without city)
  const countryMatch = timeZones.find(tz => 
    (tz.countryName && tz.countryName.toLowerCase() === normalizedQuery)
  );
  
  if (countryMatch) return countryMatch;
  
  // Try partial matches
  const partialMatch = timeZones.find(tz => 
    tz.name.toLowerCase().includes(normalizedQuery) ||
    tz.id.toLowerCase().includes(normalizedQuery) ||
    (tz.countryName && tz.countryName.toLowerCase().includes(normalizedQuery))
  );
  
  if (partialMatch) return partialMatch;
  
  // Try fuzzy matching for city names in timezone IDs
  const fuzzyMatch = timeZones.find(tz => {
    const cityPart = tz.id.split('/').pop()?.toLowerCase().replace(/_/g, ' ');
    return cityPart?.includes(normalizedQuery);
  });
  
  return fuzzyMatch;
};

// Format a date to a specific timezone
export const formatToTimeZone = (date: Date, timeZoneId: string, formatString: string = 'h:mm a') => {
  try {
    return formatInTimeZone(date, timeZoneId, formatString);
  } catch (error) {
    console.error(`Error formatting time to zone ${timeZoneId}:`, error);
    return 'Error';
  }
};

// Get the current time in a specific timezone
export const getCurrentTimeInZone = (timeZoneId: string): Date => {
  const now = new Date();
  return toZonedTime(now, timeZoneId);
};

// Convert a time from one timezone to another
export const convertTime = (
  sourceTime: Date, 
  fromZoneId: string, 
  toZoneId: string
): ConvertedTime => {
  console.log(`Converting time from ${fromZoneId} to ${toZoneId}`, sourceTime.toISOString());
  
  const fromZone = timeZones.find(tz => tz.id === fromZoneId) || timeZones[0];
  const toZone = timeZones.find(tz => tz.id === toZoneId) || timeZones[0];
  
  try {
    // Convert to UTC first and then to target timezone to ensure accuracy
    const utcDate = fromZonedTime(sourceTime, fromZoneId);
    const targetDate = toZonedTime(utcDate, toZoneId);
    
    // For display in the source timezone
    const sourceZonedTime = toZonedTime(sourceTime, fromZoneId);
    
    // Calculate time gap (difference between the two times)
    const timeGap = differenceInHours(targetDate, sourceZonedTime);
    
    return {
      fromZone,
      toZone,
      fromTime: sourceZonedTime,
      toTime: targetDate,
      timeGap
    };
  } catch (error) {
    console.error('Error in time conversion:', error);
    throw new Error(`Failed to convert time: ${error}`);
  }
};

// Get a range of working hours for visualization (9AM to 5PM as working hours)
export const getWorkingHoursRange = (date: Date, timeZoneId: string) => {
  const hoursData = [];
  
  try {
    // Get current date in the specified timezone
    const zonedDate = toZonedTime(date, timeZoneId);
    
    // Create a date at the start of the day in the target timezone
    const baseDate = new Date(zonedDate);
    baseDate.setHours(0, 0, 0, 0); // Start at midnight local time
    
    // Generate 24 hours for a full day
    for (let i = 0; i < 24; i++) {
      const currentHour = addHours(baseDate, i);
      const hourIn12Format = formatInTimeZone(currentHour, timeZoneId, 'h a'); // 12-hour format with AM/PM
      
      hoursData.push({
        hour: hourIn12Format,
        timestamp: currentHour.getTime(),
        isWorkingHour: i >= 9 && i <= 17, // 9AM to 5PM as working hours
        rawHour: currentHour
      });
    }
    
    return hoursData;
  } catch (error) {
    console.error(`Error generating hours range for ${timeZoneId}:`, error);
    return hoursData;
  }
};

// Get geolocation from the browser - improved with better error handling and IP-based fallback
export const getUserGeolocation = async (): Promise<{latitude: number, longitude: number}> => {
  try {
    // First try browser geolocation API
    if (navigator.geolocation) {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      console.log("Browser geolocation successful:", position.coords);
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    }
  } catch (error) {
    console.warn("Browser geolocation failed:", error);
    // Continue to fallback method
  }
  
  try {
    // Fallback: Try IP-based geolocation
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error(`IP geolocation failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("IP-based geolocation successful:", data);
    
    if (data.latitude && data.longitude) {
      return {
        latitude: data.latitude,
        longitude: data.longitude
      };
    }
  } catch (ipError) {
    console.warn("IP-based geolocation failed:", ipError);
  }
  
  // Default fallback coordinates (New York)
  console.warn("Using default location: New York");
  return { latitude: 40.7128, longitude: -74.0060 };
};

// Get timezone from coordinates using a combination of methods
export const getTimezoneFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Try to use the TimeZoneDB API (free tier)
    const response = await fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=NOUW5QYTIN0Y&format=json&by=position&lat=${latitude}&lng=${longitude}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'OK' && data.zoneName) {
        console.log("TimeZoneDB API success:", data.zoneName);
        return data.zoneName;
      }
    }
  } catch (error) {
    console.warn("TimeZoneDB API error:", error);
  }
  
  try {
    // Alternative: use the user's browser timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.info("Detected timezone from browser:", timezone);
    return timezone;
  } catch (error) {
    console.error("Error getting timezone from browser:", error);
  }
  
  // Use longitude to estimate timezone as last resort
  const hourOffset = Math.round(longitude / 15);
  const closestZone = timeZones.find(tz => {
    const tzOffset = parseInt(tz.offset.replace(':', '.').replace('+', '')) || 0;
    return Math.abs(tzOffset - hourOffset) <= 1;
  });
  
  return closestZone?.id || "America/New_York";
};
