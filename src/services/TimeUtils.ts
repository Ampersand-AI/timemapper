
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

// Simplified timezone database with common zones
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
  return formatInTimeZone(date, timeZoneId, formatString);
};

// Get the current time in a specific timezone
export const getCurrentTimeInZone = (timeZoneId: string): Date => {
  return toZonedTime(new Date(), timeZoneId);
};

// Convert a time from one timezone to another
export const convertTime = (
  date: Date, 
  fromZoneId: string, 
  toZoneId: string
): ConvertedTime => {
  console.log(`Converting time from ${fromZoneId} to ${toZoneId}`, date);
  
  const fromZone = timeZones.find(tz => tz.id === fromZoneId) || timeZones[0];
  const toZone = timeZones.find(tz => tz.id === toZoneId) || timeZones[0];
  
  // Convert the time from source timezone to UTC
  const utcTime = fromZonedTime(date, fromZoneId);
  
  // Then convert from UTC to target timezone
  const targetTime = toZonedTime(utcTime, toZoneId);
  
  // Calculate the time difference in hours
  const timeGap = differenceInHours(targetTime, date);
  
  console.log(`Conversion result:`, {
    fromTime: date.toISOString(),
    toTime: targetTime.toISOString(),
    timeGap
  });
  
  return {
    fromZone,
    toZone,
    fromTime: date,
    toTime: targetTime,
    timeGap
  };
};

// Get a range of working hours for visualization
export const getWorkingHoursRange = (date: Date, timeZoneId: string) => {
  const hoursData = [];
  const baseDate = toZonedTime(
    fromZonedTime(date, timeZoneId),
    timeZoneId
  );
  
  // Start at 6AM (typical working day start)
  baseDate.setHours(6, 0, 0, 0);
  
  // Generate 15 hours (6AM to 9PM)
  for (let i = 0; i < 15; i++) {
    const currentDate = addHours(baseDate, i);
    hoursData.push({
      hour: format(currentDate, 'h a'),
      timestamp: currentDate.getTime(),
      isWorkingHour: i >= 3 && i <= 11, // 9AM to 5PM as working hours
    });
  }
  
  return hoursData;
};
