
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
    console.log(`Formatting ${date.toISOString()} to ${timeZoneId} with format ${formatString}`);
    const formatted = formatInTimeZone(date, timeZoneId, formatString);
    console.log(`Formatted result: ${formatted}`);
    return formatted;
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
  
  console.log(`Source zone: ${fromZone.name} (${fromZone.id})`);
  console.log(`Target zone: ${toZone.name} (${toZone.id})`);
  
  try {
    // Create a new Date object for the time
    const utcTime = new Date(sourceTime);
    
    // Get the source time correctly formatted in its timezone
    const sourceZonedTime = toZonedTime(utcTime, fromZoneId);
    console.log(`Source zoned time: ${sourceZonedTime.toISOString()}`);
    
    // Convert to target timezone
    const targetZonedTime = formatInTimeZone(utcTime, toZoneId, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    console.log(`Target formatted: ${targetZonedTime}`);
    
    const targetDate = new Date(targetZonedTime);
    console.log(`Target date: ${targetDate.toISOString()}`);
    
    // Calculate the time difference in hours
    const timeGap = differenceInHours(targetDate, sourceZonedTime);
    console.log(`Time gap between zones: ${timeGap} hours`);
    
    return {
      fromZone,
      toZone,
      fromTime: sourceZonedTime,
      toTime: targetDate,
      timeGap
    };
  } catch (error) {
    console.error('Error in conversion:', error);
    throw new Error(`Failed to convert time: ${error}`);
  }
};

// Get a range of working hours for visualization (9AM to 5PM as working hours)
export const getWorkingHoursRange = (date: Date, timeZoneId: string) => {
  const hoursData = [];
  
  // Get current date in the specified timezone
  const zonedDate = toZonedTime(date, timeZoneId);
  console.log(`Zoned date for ${timeZoneId}: ${zonedDate.toISOString()}`);
  
  // Create a date at the start of the working day in the target timezone
  const baseDate = new Date(zonedDate);
  baseDate.setHours(0, 0, 0, 0); // Start at midnight local time
  
  console.log(`Base date for ${timeZoneId}: ${baseDate.toISOString()}`);
  
  // Generate 24 hours for a full day
  for (let i = 0; i < 24; i++) {
    const currentHour = addHours(baseDate, i);
    const hourIn12Format = formatInTimeZone(currentHour, timeZoneId, 'h a'); // 12-hour format with AM/PM
    
    // Convert the hour to its true timestamp
    const hourTimestamp = currentHour.getTime();
    
    hoursData.push({
      hour: hourIn12Format,
      timestamp: hourTimestamp,
      isWorkingHour: i >= 9 && i <= 17, // 9AM to 5PM as working hours
      rawHour: currentHour
    });
  }
  
  console.log(`Generated ${hoursData.length} hours for ${timeZoneId}`);
  return hoursData;
};
