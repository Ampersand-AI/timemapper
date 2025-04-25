
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
  
  // Australia & Pacific
  { id: 'Australia/Sydney', name: 'Sydney', offset: '+11:00', abbreviation: 'AEDT', countryName: 'Australia' },
  { id: 'Australia/Melbourne', name: 'Melbourne', offset: '+11:00', abbreviation: 'AEDT', countryName: 'Australia' },
  { id: 'Australia/Perth', name: 'Perth', offset: '+08:00', abbreviation: 'AWST', countryName: 'Australia' },
  { id: 'Pacific/Auckland', name: 'Auckland', offset: '+13:00', abbreviation: 'NZDT', countryName: 'New Zealand' },
  
  // Africa
  { id: 'Africa/Cairo', name: 'Cairo', offset: '+02:00', abbreviation: 'EET', countryName: 'Egypt' },
  { id: 'Africa/Lagos', name: 'Lagos', offset: '+01:00', abbreviation: 'WAT', countryName: 'Nigeria' },
  { id: 'Africa/Nairobi', name: 'Nairobi', offset: '+03:00', abbreviation: 'EAT', countryName: 'Kenya' },
  { id: 'Africa/Johannesburg', name: 'Johannesburg', offset: '+02:00', abbreviation: 'SAST', countryName: 'South Africa' }
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
        }
      );
    }
  });
};

// Get timezone from coordinates using browser API
export const getTimezoneFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Try to use the Intl API
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.info("Detected timezone from browser:", timezone);
    return timezone;
  } catch (error) {
    console.error("Error getting timezone from browser:", error);
    return "America/New_York"; // Default fallback
  }
};
