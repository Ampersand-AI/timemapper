
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
  { id: 'Europe/Oslo', name: 'Oslo', offset: '+01:00', abbreviation: 'CET', countryName: 'Norway' },
  { id: 'Europe/Copenhagen', name: 'Copenhagen', offset: '+01:00', abbreviation: 'CET', countryName: 'Denmark' },
  { id: 'Europe/Brussels', name: 'Brussels', offset: '+01:00', abbreviation: 'CET', countryName: 'Belgium' },
  { id: 'Europe/Vienna', name: 'Vienna', offset: '+01:00', abbreviation: 'CET', countryName: 'Austria' },
  { id: 'Europe/Zurich', name: 'Zurich', offset: '+01:00', abbreviation: 'CET', countryName: 'Switzerland' },
  { id: 'Europe/Lisbon', name: 'Lisbon', offset: '+00:00', abbreviation: 'WET', countryName: 'Portugal' },
  { id: 'Europe/Dublin', name: 'Dublin', offset: '+00:00', abbreviation: 'GMT', countryName: 'Ireland' },
  { id: 'Europe/Helsinki', name: 'Helsinki', offset: '+02:00', abbreviation: 'EET', countryName: 'Finland' },
  { id: 'Europe/Warsaw', name: 'Warsaw', offset: '+01:00', abbreviation: 'CET', countryName: 'Poland' },
  { id: 'Europe/Prague', name: 'Prague', offset: '+01:00', abbreviation: 'CET', countryName: 'Czech Republic' },
  { id: 'Europe/Budapest', name: 'Budapest', offset: '+01:00', abbreviation: 'CET', countryName: 'Hungary' },
  { id: 'Europe/Athens', name: 'Athens', offset: '+02:00', abbreviation: 'EET', countryName: 'Greece' },
  { id: 'Europe/Moscow', name: 'Moscow', offset: '+03:00', abbreviation: 'MSK', countryName: 'Russia' },
  
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
  { id: 'Asia/Tehran', name: 'Tehran', offset: '+03:30', abbreviation: 'IRST', countryName: 'Iran' },
  { id: 'Asia/Riyadh', name: 'Riyadh', offset: '+03:00', abbreviation: 'AST', countryName: 'Saudi Arabia' },
  { id: 'Asia/Jerusalem', name: 'Jerusalem', offset: '+02:00', abbreviation: 'IST', countryName: 'Israel' },
  { id: 'Asia/Istanbul', name: 'Istanbul', offset: '+03:00', abbreviation: 'TRT', countryName: 'Turkey' },
  { id: 'Asia/Doha', name: 'Doha', offset: '+03:00', abbreviation: 'AST', countryName: 'Qatar' },
  { id: 'Asia/Baghdad', name: 'Baghdad', offset: '+03:00', abbreviation: 'AST', countryName: 'Iraq' },
  { id: 'Asia/Beirut', name: 'Beirut', offset: '+02:00', abbreviation: 'EET', countryName: 'Lebanon' },
  { id: 'Asia/Karachi', name: 'Karachi', offset: '+05:00', abbreviation: 'PKT', countryName: 'Pakistan' },
  { id: 'Asia/Dhaka', name: 'Dhaka', offset: '+06:00', abbreviation: 'BST', countryName: 'Bangladesh' },
  { id: 'Asia/Ho_Chi_Minh', name: 'Ho Chi Minh City', offset: '+07:00', abbreviation: 'ICT', countryName: 'Vietnam' },
  { id: 'Asia/Taipei', name: 'Taipei', offset: '+08:00', abbreviation: 'CST', countryName: 'Taiwan' },
  
  // Australia & Pacific
  { id: 'Australia/Sydney', name: 'Sydney', offset: '+11:00', abbreviation: 'AEDT', countryName: 'Australia' },
  { id: 'Australia/Melbourne', name: 'Melbourne', offset: '+11:00', abbreviation: 'AEDT', countryName: 'Australia' },
  { id: 'Australia/Perth', name: 'Perth', offset: '+08:00', abbreviation: 'AWST', countryName: 'Australia' },
  { id: 'Australia/Brisbane', name: 'Brisbane', offset: '+10:00', abbreviation: 'AEST', countryName: 'Australia' },
  { id: 'Australia/Adelaide', name: 'Adelaide', offset: '+10:30', abbreviation: 'ACDT', countryName: 'Australia' },
  { id: 'Pacific/Auckland', name: 'Auckland', offset: '+13:00', abbreviation: 'NZDT', countryName: 'New Zealand' },
  { id: 'Pacific/Fiji', name: 'Fiji', offset: '+12:00', abbreviation: 'FJT', countryName: 'Fiji' },
  
  // Africa
  { id: 'Africa/Cairo', name: 'Cairo', offset: '+02:00', abbreviation: 'EET', countryName: 'Egypt' },
  { id: 'Africa/Lagos', name: 'Lagos', offset: '+01:00', abbreviation: 'WAT', countryName: 'Nigeria' },
  { id: 'Africa/Nairobi', name: 'Nairobi', offset: '+03:00', abbreviation: 'EAT', countryName: 'Kenya' },
  { id: 'Africa/Johannesburg', name: 'Johannesburg', offset: '+02:00', abbreviation: 'SAST', countryName: 'South Africa' },
  { id: 'Africa/Casablanca', name: 'Casablanca', offset: '+00:00', abbreviation: 'WET', countryName: 'Morocco' },
  { id: 'Africa/Algiers', name: 'Algiers', offset: '+01:00', abbreviation: 'CET', countryName: 'Algeria' },
  { id: 'Africa/Tunis', name: 'Tunis', offset: '+01:00', abbreviation: 'CET', countryName: 'Tunisia' },
  { id: 'Africa/Accra', name: 'Accra', offset: '+00:00', abbreviation: 'GMT', countryName: 'Ghana' }
];

// Enhanced findTimeZone function with better city and country matching
export const findTimeZone = (query: string): TimeZoneData | undefined => {
  if (!query) return undefined;
  
  const normalizedQuery = query.trim().toLowerCase();
  
  // First check for exact full matches
  const exactMatch = timeZones.find(tz => 
    tz.name.toLowerCase() === normalizedQuery ||
    tz.id.toLowerCase() === normalizedQuery ||
    tz.abbreviation.toLowerCase() === normalizedQuery ||
    (tz.countryName && tz.countryName.toLowerCase() === normalizedQuery)
  );
  
  if (exactMatch) return exactMatch;
  
  // Check for country name matches 
  const countryMatch = timeZones.find(tz => 
    tz.countryName && tz.countryName.toLowerCase() === normalizedQuery
  );
  
  if (countryMatch) return countryMatch;
  
  // Try partial matches for cities
  const partialCityMatch = timeZones.find(tz => 
    tz.name.toLowerCase().includes(normalizedQuery)
  );
  
  if (partialCityMatch) return partialCityMatch;
  
  // Try partial matches for countries
  const partialCountryMatch = timeZones.find(tz => 
    tz.countryName && tz.countryName.toLowerCase().includes(normalizedQuery)
  );
  
  if (partialCountryMatch) return partialCountryMatch;
  
  // Try partial matches for IDs
  const idMatch = timeZones.find(tz => 
    tz.id.toLowerCase().includes(normalizedQuery)
  );
  
  if (idMatch) return idMatch;
  
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

// Get geolocation from the browser
export const getUserGeolocation = (): Promise<{latitude: number, longitude: number}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          reject(error);
        },
        { 
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  });
};

// Improved timezone detection from browser and system info
export const getTimezoneFromCoordinates = async (): Promise<string> => {
  try {
    // First try browser's Intl API (most accurate way when available)
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (browserTimezone && browserTimezone !== 'UTC' && !browserTimezone.startsWith('Etc/')) {
      console.info("Detected timezone from browser:", browserTimezone);
      
      // Verify if this is a valid timezone in our list
      const foundTimezone = timeZones.find(tz => tz.id === browserTimezone);
      if (foundTimezone) {
        return browserTimezone;
      }
    }
    
    // If browser doesn't provide a usable timezone or we can't find it in our list,
    // try to approximate based on offset
    const nowDate = new Date();
    const offset = -nowDate.getTimezoneOffset(); // Convert to minutes, positive is east of UTC
    const offsetHours = offset / 60;
    
    // Format the offset like "+08:00" or "-05:00"
    const formattedOffset = (offsetHours >= 0 ? '+' : '') + 
      String(Math.floor(Math.abs(offsetHours))).padStart(2, '0') + ':' +
      String(Math.abs(offset % 60)).padStart(2, '0');
    
    console.info("Using system offset:", formattedOffset);
    
    // Find closest timezone by offset
    const matchingTimeZones = timeZones.filter(tz => tz.offset === formattedOffset);
    
    if (matchingTimeZones.length > 0) {
      // Try to find one with a major city/country
      const preferredZones = matchingTimeZones.filter(tz => 
        ['New_York', 'Los_Angeles', 'Chicago', 'London', 'Paris', 'Berlin', 'Tokyo', 'Sydney']
          .some(major => tz.id.includes(major))
      );
      
      return preferredZones.length > 0 ? preferredZones[0].id : matchingTimeZones[0].id;
    }
    
    console.warn("Could not find timezone by offset, using default");
    return "America/New_York"; // Default fallback
  } catch (error) {
    console.error("Error detecting timezone:", error);
    return "America/New_York"; // Default fallback
  }
};
