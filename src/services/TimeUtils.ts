import { format, formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { addHours, differenceInHours } from 'date-fns';

export interface TimeZoneData {
  id: string;
  name: string;
  offset: string;
  abbreviation: string;
  countryName?: string;
  synonyms?: string[]; // Add synonyms for better recognition
}

export interface ConvertedTime {
  fromZone: TimeZoneData;
  toZone: TimeZoneData;
  fromTime: Date;
  toTime: Date;
  timeGap: number;
}

// Enhanced timezone database with expanded cities and regions
export const timeZones: TimeZoneData[] = [
  // Americas
  { id: 'America/New_York', name: 'New York', offset: '-05:00', abbreviation: 'EST', countryName: 'United States', synonyms: ['nyc', 'ny', 'eastern time', 'et'] },
  { id: 'America/Los_Angeles', name: 'Los Angeles', offset: '-08:00', abbreviation: 'PST', countryName: 'United States', synonyms: ['la', 'pacific time', 'pt', 'california'] },
  { id: 'America/Chicago', name: 'Chicago', offset: '-06:00', abbreviation: 'CST', countryName: 'United States', synonyms: ['central time', 'ct'] },
  { id: 'America/Denver', name: 'Denver', offset: '-07:00', abbreviation: 'MST', countryName: 'United States', synonyms: ['mountain time', 'mt'] },
  { id: 'America/Phoenix', name: 'Phoenix', offset: '-07:00', abbreviation: 'MST', countryName: 'United States', synonyms: ['arizona'] },
  { id: 'America/Toronto', name: 'Toronto', offset: '-05:00', abbreviation: 'EST', countryName: 'Canada', synonyms: ['eastern canada'] },
  { id: 'America/Vancouver', name: 'Vancouver', offset: '-08:00', abbreviation: 'PST', countryName: 'Canada', synonyms: ['western canada', 'british columbia'] },
  { id: 'America/Mexico_City', name: 'Mexico City', offset: '-06:00', abbreviation: 'CST', countryName: 'Mexico', synonyms: ['ciudad de mexico', 'cdmx', 'mexico'] },
  { id: 'America/Sao_Paulo', name: 'Sao Paulo', offset: '-03:00', abbreviation: 'BRT', countryName: 'Brazil', synonyms: ['brazil', 'brasil', 'são paulo'] },
  { id: 'America/Buenos_Aires', name: 'Buenos Aires', offset: '-03:00', abbreviation: 'ART', countryName: 'Argentina', synonyms: ['argentina'] },
  
  // Europe - Expanded
  { id: 'Europe/London', name: 'London', offset: '+00:00', abbreviation: 'GMT', countryName: 'United Kingdom', synonyms: ['uk', 'england', 'britain', 'great britain', 'united kingdom'] },
  { id: 'Europe/Paris', name: 'Paris', offset: '+01:00', abbreviation: 'CET', countryName: 'France', synonyms: ['france', 'french'] },
  { id: 'Europe/Berlin', name: 'Berlin', offset: '+01:00', abbreviation: 'CET', countryName: 'Germany', synonyms: ['germany', 'deutschland', 'german'] },
  { id: 'Europe/Madrid', name: 'Madrid', offset: '+01:00', abbreviation: 'CET', countryName: 'Spain', synonyms: ['spain', 'españa', 'espana', 'spanish'] },
  { id: 'Europe/Rome', name: 'Rome', offset: '+01:00', abbreviation: 'CET', countryName: 'Italy', synonyms: ['italy', 'italia', 'italian'] },
  { id: 'Europe/Amsterdam', name: 'Amsterdam', offset: '+01:00', abbreviation: 'CET', countryName: 'Netherlands', synonyms: ['netherlands', 'holland', 'dutch'] },
  { id: 'Europe/Stockholm', name: 'Stockholm', offset: '+01:00', abbreviation: 'CET', countryName: 'Sweden', synonyms: ['sweden', 'swedish'] },
  { id: 'Europe/Copenhagen', name: 'Copenhagen', offset: '+01:00', abbreviation: 'CET', countryName: 'Denmark', synonyms: ['denmark', 'danish'] },
  { id: 'Europe/Oslo', name: 'Oslo', offset: '+01:00', abbreviation: 'CET', countryName: 'Norway', synonyms: ['norway', 'norwegian'] },
  { id: 'Europe/Helsinki', name: 'Helsinki', offset: '+02:00', abbreviation: 'EET', countryName: 'Finland', synonyms: ['finland', 'finnish'] },
  { id: 'Europe/Athens', name: 'Athens', offset: '+02:00', abbreviation: 'EET', countryName: 'Greece', synonyms: ['greece', 'greek'] },
  { id: 'Europe/Vienna', name: 'Vienna', offset: '+01:00', abbreviation: 'CET', countryName: 'Austria', synonyms: ['austria', 'austrian', 'wien'] },
  { id: 'Europe/Zurich', name: 'Zurich', offset: '+01:00', abbreviation: 'CET', countryName: 'Switzerland', synonyms: ['switzerland', 'swiss', 'zürich'] },
  { id: 'Europe/Brussels', name: 'Brussels', offset: '+01:00', abbreviation: 'CET', countryName: 'Belgium', synonyms: ['belgium', 'belgian', 'bruxelles'] },
  { id: 'Europe/Lisbon', name: 'Lisbon', offset: '+00:00', abbreviation: 'WET', countryName: 'Portugal', synonyms: ['portugal', 'portuguese', 'lisboa'] },
  { id: 'Europe/Dublin', name: 'Dublin', offset: '+00:00', abbreviation: 'GMT', countryName: 'Ireland', synonyms: ['ireland', 'irish', 'eire'] },
  { id: 'Europe/Prague', name: 'Prague', offset: '+01:00', abbreviation: 'CET', countryName: 'Czech Republic', synonyms: ['czech republic', 'czechia', 'praha'] },
  { id: 'Europe/Budapest', name: 'Budapest', offset: '+01:00', abbreviation: 'CET', countryName: 'Hungary', synonyms: ['hungary', 'hungarian', 'magyar'] },
  { id: 'Europe/Warsaw', name: 'Warsaw', offset: '+01:00', abbreviation: 'CET', countryName: 'Poland', synonyms: ['poland', 'polish', 'polska', 'warszawa'] },
  { id: 'Europe/Bucharest', name: 'Bucharest', offset: '+02:00', abbreviation: 'EET', countryName: 'Romania', synonyms: ['romania', 'romanian', 'bucuresti'] },
  { id: 'Europe/Sofia', name: 'Sofia', offset: '+02:00', abbreviation: 'EET', countryName: 'Bulgaria', synonyms: ['bulgaria', 'bulgarian'] },
  { id: 'Europe/Istanbul', name: 'Istanbul', offset: '+03:00', abbreviation: 'TRT', countryName: 'Turkey', synonyms: ['turkey', 'turkish', 'turkiye'] },
  { id: 'Europe/Moscow', name: 'Moscow', offset: '+03:00', abbreviation: 'MSK', countryName: 'Russia', synonyms: ['russia', 'russian', 'moskva'] },
  { id: 'Europe/Kiev', name: 'Kyiv', offset: '+02:00', abbreviation: 'EET', countryName: 'Ukraine', synonyms: ['ukraine', 'ukrainian', 'kiev'] },
  
  // Asia - Expanded
  { id: 'Asia/Tokyo', name: 'Tokyo', offset: '+09:00', abbreviation: 'JST', countryName: 'Japan', synonyms: ['japan', 'japanese', 'nippon'] },
  { id: 'Asia/Shanghai', name: 'Shanghai', offset: '+08:00', abbreviation: 'CST', countryName: 'China', synonyms: ['china', 'chinese', 'prc', 'peoples republic of china'] },
  { id: 'Asia/Hong_Kong', name: 'Hong Kong', offset: '+08:00', abbreviation: 'HKT', countryName: 'China', synonyms: ['hk', 'hong kong sar'] },
  { id: 'Asia/Singapore', name: 'Singapore', offset: '+08:00', abbreviation: 'SGT', countryName: 'Singapore', synonyms: ['sg', 'singaporean'] },
  { id: 'Asia/Seoul', name: 'Seoul', offset: '+09:00', abbreviation: 'KST', countryName: 'South Korea', synonyms: ['korea', 'south korea', 'korean'] },
  { id: 'Asia/Dubai', name: 'Dubai', offset: '+04:00', abbreviation: 'GST', countryName: 'United Arab Emirates', synonyms: ['uae', 'emirates', 'united arab emirates'] },
  { id: 'Asia/Mumbai', name: 'Mumbai', offset: '+05:30', abbreviation: 'IST', countryName: 'India', synonyms: ['india', 'indian', 'bombay'] },
  { id: 'Asia/Kolkata', name: 'Kolkata', offset: '+05:30', abbreviation: 'IST', countryName: 'India', synonyms: ['india', 'indian', 'calcutta'] },
  { id: 'Asia/Delhi', name: 'Delhi', offset: '+05:30', abbreviation: 'IST', countryName: 'India', synonyms: ['india', 'indian', 'new delhi'] },
  { id: 'Asia/Bangkok', name: 'Bangkok', offset: '+07:00', abbreviation: 'ICT', countryName: 'Thailand', synonyms: ['thailand', 'thai', 'siam'] },
  { id: 'Asia/Jakarta', name: 'Jakarta', offset: '+07:00', abbreviation: 'WIB', countryName: 'Indonesia', synonyms: ['indonesia', 'indonesian'] },
  { id: 'Asia/Manila', name: 'Manila', offset: '+08:00', abbreviation: 'PHT', countryName: 'Philippines', synonyms: ['philippines', 'filipino', 'ph'] },
  { id: 'Asia/Kuala_Lumpur', name: 'Kuala Lumpur', offset: '+08:00', abbreviation: 'MYT', countryName: 'Malaysia', synonyms: ['malaysia', 'malaysian', 'kl'] },
  { id: 'Asia/Taipei', name: 'Taipei', offset: '+08:00', abbreviation: 'CST', countryName: 'Taiwan', synonyms: ['taiwan', 'taiwanese', 'formosa'] },
  // Middle East - Expanded
  { id: 'Asia/Riyadh', name: 'Riyadh', offset: '+03:00', abbreviation: 'AST', countryName: 'Saudi Arabia', synonyms: ['saudi arabia', 'saudi', 'ksa'] },
  { id: 'Asia/Jerusalem', name: 'Jerusalem', offset: '+02:00', abbreviation: 'IST', countryName: 'Israel', synonyms: ['israel', 'israeli', 'tel aviv'] },
  { id: 'Asia/Tehran', name: 'Tehran', offset: '+03:30', abbreviation: 'IRST', countryName: 'Iran', synonyms: ['iran', 'iranian', 'persia'] },
  { id: 'Asia/Baghdad', name: 'Baghdad', offset: '+03:00', abbreviation: 'AST', countryName: 'Iraq', synonyms: ['iraq', 'iraqi'] },
  { id: 'Asia/Kuwait', name: 'Kuwait', offset: '+03:00', abbreviation: 'AST', countryName: 'Kuwait', synonyms: ['kuwaiti'] },
  { id: 'Asia/Doha', name: 'Doha', offset: '+03:00', abbreviation: 'AST', countryName: 'Qatar', synonyms: ['qatar', 'qatari'] },
  { id: 'Asia/Muscat', name: 'Muscat', offset: '+04:00', abbreviation: 'GST', countryName: 'Oman', synonyms: ['oman', 'omani'] },
  { id: 'Asia/Bahrain', name: 'Manama', offset: '+03:00', abbreviation: 'AST', countryName: 'Bahrain', synonyms: ['bahrain', 'bahraini'] },
  { id: 'Asia/Beirut', name: 'Beirut', offset: '+02:00', abbreviation: 'EET', countryName: 'Lebanon', synonyms: ['lebanon', 'lebanese'] },
  { id: 'Asia/Damascus', name: 'Damascus', offset: '+02:00', abbreviation: 'EET', countryName: 'Syria', synonyms: ['syria', 'syrian'] },
  { id: 'Asia/Amman', name: 'Amman', offset: '+02:00', abbreviation: 'EET', countryName: 'Jordan', synonyms: ['jordan', 'jordanian'] },
  
  // Australia & Pacific
  { id: 'Australia/Sydney', name: 'Sydney', offset: '+11:00', abbreviation: 'AEDT', countryName: 'Australia', synonyms: ['nsw', 'new south wales'] },
  { id: 'Australia/Melbourne', name: 'Melbourne', offset: '+11:00', abbreviation: 'AEDT', countryName: 'Australia', synonyms: ['victoria', 'vic'] },
  { id: 'Australia/Perth', name: 'Perth', offset: '+08:00', abbreviation: 'AWST', countryName: 'Australia', synonyms: ['western australia', 'wa'] },
  { id: 'Australia/Brisbane', name: 'Brisbane', offset: '+10:00', abbreviation: 'AEST', countryName: 'Australia', synonyms: ['queensland', 'qld'] },
  { id: 'Australia/Adelaide', name: 'Adelaide', offset: '+10:30', abbreviation: 'ACDT', countryName: 'Australia', synonyms: ['south australia', 'sa'] },
  { id: 'Pacific/Auckland', name: 'Auckland', offset: '+13:00', abbreviation: 'NZDT', countryName: 'New Zealand', synonyms: ['new zealand', 'nz', 'kiwi'] },
  { id: 'Pacific/Fiji', name: 'Fiji', offset: '+13:00', abbreviation: 'FJT', countryName: 'Fiji', synonyms: ['fijian'] },
  { id: 'Pacific/Honolulu', name: 'Honolulu', offset: '-10:00', abbreviation: 'HST', countryName: 'United States', synonyms: ['hawaii', 'hawaiian'] },
  
  // Africa
  { id: 'Africa/Cairo', name: 'Cairo', offset: '+02:00', abbreviation: 'EET', countryName: 'Egypt', synonyms: ['egypt', 'egyptian'] },
  { id: 'Africa/Lagos', name: 'Lagos', offset: '+01:00', abbreviation: 'WAT', countryName: 'Nigeria', synonyms: ['nigeria', 'nigerian'] },
  { id: 'Africa/Nairobi', name: 'Nairobi', offset: '+03:00', abbreviation: 'EAT', countryName: 'Kenya', synonyms: ['kenya', 'kenyan'] },
  { id: 'Africa/Johannesburg', name: 'Johannesburg', offset: '+02:00', abbreviation: 'SAST', countryName: 'South Africa', synonyms: ['south africa', 'sa', 'joburg'] },
  { id: 'Africa/Casablanca', name: 'Casablanca', offset: '+00:00', abbreviation: 'WET', countryName: 'Morocco', synonyms: ['morocco', 'moroccan'] },
  { id: 'Africa/Tunis', name: 'Tunis', offset: '+01:00', abbreviation: 'CET', countryName: 'Tunisia', synonyms: ['tunisia', 'tunisian'] },
  { id: 'Africa/Accra', name: 'Accra', offset: '+00:00', abbreviation: 'GMT', countryName: 'Ghana', synonyms: ['ghana', 'ghanaian'] },
  { id: 'Africa/Addis_Ababa', name: 'Addis Ababa', offset: '+03:00', abbreviation: 'EAT', countryName: 'Ethiopia', synonyms: ['ethiopia', 'ethiopian'] }
];

// Enhanced findTimeZone function with better city/country matching and fuzzy search
export const findTimeZone = (query: string): TimeZoneData | undefined => {
  if (!query) return undefined;
  
  const normalizedQuery = query.trim().toLowerCase();
  
  // Try exact matches first
  const exactMatch = timeZones.find(tz => 
    tz.name.toLowerCase() === normalizedQuery ||
    tz.id.toLowerCase() === normalizedQuery ||
    tz.abbreviation.toLowerCase() === normalizedQuery ||
    (tz.countryName && tz.countryName.toLowerCase() === normalizedQuery) ||
    (tz.synonyms && tz.synonyms.includes(normalizedQuery))
  );
  
  if (exactMatch) return exactMatch;
  
  // Try exact matches for country names
  const countryMatch = timeZones.find(tz => 
    (tz.countryName && tz.countryName.toLowerCase() === normalizedQuery)
  );
  
  if (countryMatch) return countryMatch;
  
  // Try by continent/region prefixes
  const continentPrefixes = ['europe/', 'asia/', 'america/', 'africa/', 'australia/', 'pacific/'];
  for (const prefix of continentPrefixes) {
    if (normalizedQuery.startsWith(prefix) || normalizedQuery.includes(' in ' + prefix.replace('/', ''))) {
      const regionQuery = normalizedQuery.includes(' in ') ? 
        normalizedQuery : 
        normalizedQuery.replace(prefix, '');
      
      // Find in that continent
      const continentMatch = timeZones.find(tz => 
        tz.id.toLowerCase().startsWith(prefix) && (
          tz.name.toLowerCase().includes(regionQuery) ||
          (tz.countryName && tz.countryName.toLowerCase().includes(regionQuery)) ||
          (tz.synonyms && tz.synonyms.some(s => s.includes(regionQuery)))
        )
      );
      
      if (continentMatch) return continentMatch;
    }
  }
  
  // Try partial matches for all fields, prioritizing name, synonyms, and countryName
  let bestPartialMatches = [];
  
  // Check city/timezone name
  const nameMatches = timeZones.filter(tz => 
    tz.name.toLowerCase().includes(normalizedQuery)
  );
  if (nameMatches.length > 0) bestPartialMatches.push(...nameMatches);
  
  // Check country name
  const countryPartialMatches = timeZones.filter(tz => 
    (tz.countryName && tz.countryName.toLowerCase().includes(normalizedQuery))
  );
  if (countryPartialMatches.length > 0 && bestPartialMatches.length === 0) {
    bestPartialMatches.push(...countryPartialMatches);
  }
  
  // Check synonyms
  const synonymMatches = timeZones.filter(tz => 
    (tz.synonyms && tz.synonyms.some(s => s.includes(normalizedQuery)))
  );
  if (synonymMatches.length > 0 && bestPartialMatches.length === 0) {
    bestPartialMatches.push(...synonymMatches);
  }
  
  // Check timezone ID
  const idMatches = timeZones.filter(tz => 
    tz.id.toLowerCase().includes(normalizedQuery)
  );
  if (idMatches.length > 0 && bestPartialMatches.length === 0) {
    bestPartialMatches.push(...idMatches);
  }
  
  // If we have matches, return the most relevant one (typically the shortest name match)
  if (bestPartialMatches.length > 0) {
    // Sort matches by how closely they match the query (shorter match length is better)
    bestPartialMatches.sort((a, b) => {
      const aNameLength = a.name.length;
      const bNameLength = b.name.length;
      return aNameLength - bNameLength;
    });
    
    return bestPartialMatches[0];
  }
  
  // Try fuzzy matching for parts of city/country names in timezone IDs
  const fuzzyMatch = timeZones.find(tz => {
    const cityPart = tz.id.split('/').pop()?.toLowerCase().replace(/_/g, ' ') || '';
    return cityPart.includes(normalizedQuery) || normalizedQuery.includes(cityPart);
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

// Enhanced getUserGeolocation with better error handling
export const getUserGeolocation = async (): Promise<{latitude: number, longitude: number}> => {
  try {
    // First try browser geolocation API
    if (navigator.geolocation) {
      try {
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
      } catch (geoError) {
        console.warn("Browser geolocation failed:", geoError);
        // Continue to fallback method
      }
    }
  } catch (error) {
    console.warn("Browser geolocation error:", error);
    // Continue to fallback method
  }
  
  try {
    // Fallback: Try multiple IP-based geolocation services
    const services = [
      'https://ipapi.co/json/',
      'https://ipinfo.io/json',
      'https://api.ipify.org?format=json' // Gets IP only, to be used with other services if needed
    ];
    
    // Try each service until one succeeds
    for (const service of services) {
      try {
        const response = await fetch(service, { signal: AbortSignal.timeout(3000) });
        if (!response.ok) continue;
        
        const data = await response.json();
        console.log("IP-based geolocation successful:", data);
        
        if (data.latitude && data.longitude) {
          return {
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude)
          };
        } else if (data.loc) {
          // Format used by ipinfo.io
          const [lat, lng] = data.loc.split(',');
          return {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng)
          };
        }
      } catch (serviceError) {
        console.warn(`${service} geolocation failed:`, serviceError);
        // Try next service
      }
    }
  } catch (ipError) {
    console.warn("All IP-based geolocation attempts failed:", ipError);
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
