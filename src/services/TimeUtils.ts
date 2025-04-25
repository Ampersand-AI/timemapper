
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

// Expanded timezone database with common zones
export const timeZones: TimeZoneData[] = [
  { id: 'America/New_York', name: 'New York', offset: '-05:00', abbreviation: 'EST' },
  { id: 'America/Los_Angeles', name: 'Los Angeles', offset: '-08:00', abbreviation: 'PST' },
  { id: 'America/Chicago', name: 'Chicago', offset: '-06:00', abbreviation: 'CST' },
  { id: 'America/Denver', name: 'Denver', offset: '-07:00', abbreviation: 'MST' },
  { id: 'Europe/London', name: 'London', offset: '+00:00', abbreviation: 'GMT' },
  { id: 'Europe/Paris', name: 'Paris', offset: '+01:00', abbreviation: 'CET' },
  { id: 'Europe/Berlin', name: 'Berlin', offset: '+01:00', abbreviation: 'CET' },
  { id: 'Asia/Tokyo', name: 'Tokyo', offset: '+09:00', abbreviation: 'JST' },
  { id: 'Asia/Kolkata', name: 'India', offset: '+05:30', abbreviation: 'IST' },
  { id: 'Asia/Shanghai', name: 'China', offset: '+08:00', abbreviation: 'CST' },
  { id: 'Asia/Singapore', name: 'Singapore', offset: '+08:00', abbreviation: 'SGT' },
  { id: 'Australia/Sydney', name: 'Sydney', offset: '+11:00', abbreviation: 'AEDT' },
  { id: 'Australia/Melbourne', name: 'Melbourne', offset: '+11:00', abbreviation: 'AEDT' },
  { id: 'Pacific/Auckland', name: 'Auckland', offset: '+13:00', abbreviation: 'NZDT' },
  { id: 'Etc/UTC', name: 'UTC', offset: '+00:00', abbreviation: 'UTC' },
];

// Find a timezone by various inputs (name, abbreviation, country)
export const findTimeZone = (query: string): TimeZoneData | undefined => {
  const normalizedQuery = query.trim().toLowerCase();
  
  console.log(`Searching for time zone: "${normalizedQuery}"`);
  
  // Try to find by exact ID first
  const exactMatch = timeZones.find(tz => 
    tz.id.toLowerCase() === normalizedQuery
  );
  
  if (exactMatch) {
    console.log(`Found exact match: ${exactMatch.id}`);
    return exactMatch;
  }
  
  // Try to find by partial match
  const partialMatch = timeZones.find(tz => 
    tz.id.toLowerCase().includes(normalizedQuery) ||
    tz.name.toLowerCase().includes(normalizedQuery) ||
    tz.abbreviation.toLowerCase() === normalizedQuery ||
    (tz.countryName?.toLowerCase().includes(normalizedQuery))
  );
  
  if (partialMatch) {
    console.log(`Found partial match: ${partialMatch.id}`);
    return partialMatch;
  }
  
  // No match found
  console.log(`No time zone found for query: "${normalizedQuery}"`);
  return undefined;
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
    // Create zonedTime objects from the source time in their respective timezones
    const sourceZonedTime = toZonedTime(sourceTime, fromZoneId);
    
    // Convert the time to the target timezone while preserving the same wall-clock time
    const targetTime = new Date(sourceTime);
    const targetZonedTime = toZonedTime(targetTime, toZoneId);
    
    // Calculate time gap (difference between the two times)
    const timeGap = differenceInHours(targetZonedTime, sourceZonedTime);
    
    return {
      fromZone,
      toZone,
      fromTime: sourceZonedTime,
      toTime: targetZonedTime,
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

// Get timezone from coordinates using Timezone API
export const getTimezoneFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Try to use the Intl API to get the timezone (modern browsers)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log("Detected timezone from browser:", timezone);
    return timezone;
  } catch (error) {
    console.error("Error getting timezone from browser:", error);
    
    // Fallback to default timezone if we can't detect it
    return "America/New_York";
  }
};
