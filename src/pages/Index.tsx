import React, { useState, useEffect } from 'react';
import TimeInput from '@/components/TimeInput';
import TimeTiles, { TimeZoneInfo } from '@/components/TimeTiles';
import TimeGapGraph from '@/components/TimeGapGraph';
import ContextPanel from '@/components/ContextPanel';
import { parseTimeQuery } from '@/services/ChatParser';
import {
  findTimeZone,
  convertTime,
  getCurrentTimeInZone,
  timeZones,
  getUserGeolocation,
  getTimezoneFromCoordinates
} from '@/services/TimeUtils';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from '@/hooks/use-toast';
import SettingsButton from '@/components/SettingsButton';
import OpenAIService from '@/services/OpenAIService';

const Index: React.FC = () => {
  const [timeZones, setTimeZones] = useState<TimeZoneInfo[]>([]);
  const [showGraph, setShowGraph] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [fromZoneId, setFromZoneId] = useState('');
  const [toZoneId, setToZoneId] = useState('');
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [userTimeZone, setUserTimeZone] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  
  // Handle timezone changes from the cards
  const handleTimeZoneChange = (oldZoneId: string, newZoneId: string) => {
    const updatedTimeZones = timeZones.map(zone => {
      if (zone.id === oldZoneId) {
        const newZone = findTimeZone(newZoneId);
        if (newZone) {
          const isSource = zone.isSource;
          
          // Update the relevant state variables based on which card changed
          if (isSource) {
            setFromZoneId(newZoneId);
            setUserTimeZone(newZoneId);
          } else {
            setToZoneId(newZoneId);
          }
          
          return {
            ...zone,
            id: newZone.id,
            name: newZone.name,
            offset: newZone.offset,
            abbreviation: newZone.abbreviation,
            time: convertTime(zone.time, oldZoneId, newZoneId).toTime,
            isSource
          };
        }
      }
      return zone;
    });
    
    setTimeZones(updatedTimeZones);
    
    // Update the analysis and context if they're already showing
    if (showGraph && showContext) {
      updateAnalysisAndContext(updatedTimeZones);
    }
    
    toast({
      title: "Timezone Updated",
      description: `Successfully changed timezone to ${newZoneId}`,
    });
  };
  
  // Function to update analysis and context panels when timezones change
  const updateAnalysisAndContext = (zones: TimeZoneInfo[]) => {
    const sourceZone = zones.find(z => z.isSource);
    const targetZone = zones.find(z => !z.isSource);
    
    if (sourceZone && targetZone) {
      setFromZoneId(sourceZone.id);
      setToZoneId(targetZone.id);
      setShowGraph(true);
      setShowContext(true);
    }
  };
  
  // Auto-detect user's timezone on component mount
  useEffect(() => {
    async function detectUserLocation() {
      setIsDetectingLocation(true);
      try {
        // Try to get user's location first
        const coords = await getUserGeolocation();
        
        // Get timezone directly from the browser - most reliable source
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("Browser detected timezone:", browserTimezone);
        
        let detectedTimezone = browserTimezone;
        
        // Only use coordinates-based detection as fallback or confirmation
        if (coords && coords.latitude && coords.longitude) {
          try {
            const geoTimezone = await getTimezoneFromCoordinates(coords.latitude, coords.longitude);
            // Use geo-based timezone if browser detection failed
            if (!detectedTimezone && geoTimezone) {
              detectedTimezone = geoTimezone;
            }
            console.log("Geo-based timezone:", geoTimezone);
          } catch (geoError) {
            console.warn("Geo-based timezone detection failed:", geoError);
          }
        }
        
        if (detectedTimezone) {
          // Find the timezone in our list
          let detectedZone = timeZones.find(tz => tz.id === detectedTimezone);
          
          if (!detectedZone) {
            // Try to find by matching parts of the timezone ID
            const parts = detectedTimezone.split('/');
            if (parts.length > 1) {
              const cityPart = parts[parts.length - 1].replace(/_/g, ' ').toLowerCase();
              const continentPart = parts[0].toLowerCase();
              
              detectedZone = timeZones.find(tz => {
                const tzParts = tz.id.toLowerCase().split('/');
                return tzParts.length > 1 && 
                  tzParts[0] === continentPart &&
                  tzParts[tzParts.length - 1].replace(/_/g, ' ').includes(cityPart);
              });
            }
            
            // If still not found, fall back to best offset match
            if (!detectedZone) {
              const localOffset = new Date().getTimezoneOffset();
              const offsetMinutes = -localOffset; // Convert to minutes, invert sign
              
              // Find timezone with closest offset
              let closestZone = timeZones[0];
              let minDifference = Number.MAX_SAFE_INTEGER;
              
              timeZones.forEach(tz => {
                const tzOffsetStr = tz.offset;
                const tzHours = parseInt(tzOffsetStr.slice(1, 3), 10);
                const tzMinutes = parseInt(tzOffsetStr.slice(4, 6), 10);
                const tzTotalMinutes = (tzOffsetStr.startsWith('-') ? -1 : 1) * (tzHours * 60 + tzMinutes);
                
                const difference = Math.abs(tzTotalMinutes - offsetMinutes);
                if (difference < minDifference) {
                  minDifference = difference;
                  closestZone = tz;
                }
              });
              
              detectedZone = closestZone;
              console.log("Used offset-based timezone detection:", closestZone.id);
            }
          }
          
          setUserTimeZone(detectedZone.id);
          
          // Set initial timezone display with current time
          const now = getCurrentTimeInZone(detectedZone.id);
          setTimeZones([{
            id: detectedZone.id,
            name: detectedZone.name,
            offset: detectedZone.offset,
            abbreviation: detectedZone.abbreviation,
            time: now,
            isSource: true
          }]);
          setFromZoneId(detectedZone.id);
          
          toast({
            title: "Timezone Detected",
            description: `Your timezone is set to ${detectedZone.name} (${detectedZone.id})`,
          });
        }
      } catch (error) {
        console.error('Error detecting timezone:', error);
        
        // Fallback to a default timezone if detection fails
        const defaultZone = findTimeZone('America/New_York');
        if (defaultZone) {
          setUserTimeZone(defaultZone.id);
          setTimeZones([{
            id: defaultZone.id,
            name: defaultZone.name,
            offset: defaultZone.offset,
            abbreviation: defaultZone.abbreviation,
            time: new Date(),
            isSource: true
          }]);
          setFromZoneId(defaultZone.id);
        }
      } finally {
        setIsDetectingLocation(false);
      }
    }

    detectUserLocation();
  }, []);

  const handleQuerySubmit = async (query: string) => {
    setIsDetectingLocation(true);
    
    try {
      // Reset the display before processing a new query
      setShowGraph(false);
      setShowContext(false);
      
      // Keep track of user's timezone card
      const userTimeZoneCard = timeZones.find(tz => tz.isSource);
      
      // Try to use OpenAI for enhanced query parsing if available
      if (OpenAIService.hasApiKey()) {
        const aiResult = await OpenAIService.verifyTimeQuery(query);
        
        if (aiResult.isValid) {
          // Use the enhanced data from OpenAI
          const toZoneStr = aiResult.toZone;
          const timeStr = aiResult.time;
          
          console.log("OpenAI parsed query:", aiResult);
          
          // Find target timezone based on the query
          const toZone = toZoneStr ? findTimeZone(toZoneStr) : null;
          
          if (!toZone) {
            throw new Error(`Could not find target timezone: ${toZoneStr}`);
          }
          
          // Parse the time from the query (default to current time if not specified)
          let timeToConvert = new Date();
          if (timeStr) {
            // Try to parse the time string
            const timeMatch = timeStr.match(/(\d{1,2})(?::(\d{1,2}))?(?:\s*(am|pm))?/i);
            if (timeMatch) {
              let hours = parseInt(timeMatch[1], 10);
              const minutes = parseInt(timeMatch[2] || '0', 10);
              const isPM = timeMatch[3]?.toLowerCase() === 'pm';
              
              // Handle AM/PM
              if (isPM && hours < 12) {
                hours += 12;
              } else if (!isPM && hours === 12) {
                hours = 0;
              }
              
              timeToConvert.setHours(hours, minutes, 0, 0);
            }
          }
          
          // Always include user's timezone card along with the searched timezone
          processTimeZones(
            findTimeZone(userTimeZone || 'America/New_York'),
            toZone,
            timeToConvert,
            aiResult.isValid
          );
          
          setIsDetectingLocation(false);
          return;
        }
      }
      
      // Fallback to basic parsing if OpenAI is not available or failed
      const parsedQuery = parseTimeQuery(query);
      
      if (!parsedQuery.isValid) {
        // Try simple location matching
        const possibleLocation = query.trim();
        const matchedZone = findTimeZone(possibleLocation);
        
        if (matchedZone) {
          // Display both user's timezone and the matched timezone
          const userZone = findTimeZone(userTimeZone || 'America/New_York');
          processTimeZones(userZone, matchedZone, new Date(), true);
          setIsDetectingLocation(false);
          return;
        }
        
        toast({
          title: "Invalid Query",
          description: "Please specify a time and at least one timezone or location.",
          variant: "destructive",
        });
        setIsDetectingLocation(false);
        return;
      }
      
      console.log("Basic parser result:", parsedQuery);
      
      // Find target timezone based on the query
      const toZone = parsedQuery.toZone 
        ? findTimeZone(parsedQuery.toZone)
        : null;
      
      if (!toZone) {
        throw new Error(`Could not find target timezone: ${parsedQuery.toZone}`);
      }
      
      // Always use user's timezone as source
      const userZone = findTimeZone(userTimeZone || 'America/New_York');
      
      // Parse the time from the query (default to current time if not specified)
      let timeToConvert = new Date();
      if (parsedQuery.time) {
        // Parse the time string
        const timeParts = parsedQuery.time.split(':');
        let hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1]?.split(' ')[0] || '0', 10);
        
        // Handle AM/PM
        if (parsedQuery.time.toLowerCase().includes('pm') && hours < 12) {
          hours += 12;
        } else if (parsedQuery.time.toLowerCase().includes('am') && hours === 12) {
          hours = 0;
        }
        
        timeToConvert.setHours(hours, minutes, 0, 0);
      }
      
      processTimeZones(userZone, toZone, timeToConvert, parsedQuery.isValid);
      
    } catch (error) {
      console.error('Error processing query:', error);
      
      toast({
        title: "Conversion Error",
        description: "An error occurred while processing the time query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const processTimeZones = (fromZone: any, toZone: any, time: Date, isValid: boolean) => {
    console.log(`Converting time from ${fromZone.id} to ${toZone.id}`, time.toISOString());
    
    // Perform the conversion
    const result = convertTime(time, fromZone.id, toZone.id);
    
    // Prepare the timezone info for the user's timezone (source)
    const sourceTimeZone = {
      id: fromZone.id,
      name: fromZone.name,
      offset: fromZone.offset,
      abbreviation: fromZone.abbreviation,
      time: result.fromTime,
      isSource: true
    };
    
    // Prepare the timezone info for the target timezone
    const targetTimeZone = {
      id: toZone.id,
      name: toZone.name,
      offset: toZone.offset,
      abbreviation: toZone.abbreviation,
      time: result.toTime,
      isSource: false
    };
    
    // Update the timezones - always limit to two time windows
    setTimeZones([sourceTimeZone, targetTimeZone]);
    
    // Set state for graph and context panel
    setFromZoneId(fromZone.id);
    setToZoneId(toZone.id);
    setScheduledTime(time);
    setShowGraph(true);
    setShowContext(true);
    
    // Show success toast
    toast({
      title: "Time Converted",
      description: `Converted ${formatInTimeZone(time, fromZone.id, 'h:mm a')} from ${fromZone.name} to ${toZone.name}`,
    });
  };

  const displaySingleTimezone = (zone: any, time: Date) => {
    // Just display the requested timezone
    setTimeZones([{
      id: zone.id,
      name: zone.name,
      offset: zone.offset,
      abbreviation: zone.abbreviation,
      time: getCurrentTimeInZone(zone.id),
      isSource: true
    }]);
    
    setFromZoneId(zone.id);
    setShowGraph(false);
    setShowContext(false);
    
    toast({
      title: "Timezone Displayed",
      description: `Showing current time in ${zone.name}`,
    });
  };

  return (
    <div className="min-h-screen bg-neo-background text-white">
      <div className="max-w-4xl mx-auto p-6 relative">
        {/* Settings Button */}
        <SettingsButton />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-teal mb-2">TimeMapper 24</h1>
          <p className="text-gray-400">
            Convert times across multiple zones with weather and local context
          </p>
        </div>
        
        <div className="neo-raised p-6 mb-6">
          <TimeInput onQuerySubmit={handleQuerySubmit} />
        </div>
        
        {isDetectingLocation ? (
          <div className="text-center py-10">
            <p className="text-gray-300">Processing your request...</p>
          </div>
        ) : (
          <TimeTiles 
            timeZones={timeZones} 
            onTimeZoneChange={handleTimeZoneChange}
          />
        )}
        
        {showGraph && fromZoneId && toZoneId && (
          <TimeGapGraph 
            fromZoneId={fromZoneId} 
            toZoneId={toZoneId} 
            date={scheduledTime} 
          />
        )}
        
        {showContext && fromZoneId && toZoneId && (
          <ContextPanel 
            fromZone={fromZoneId}
            toZone={toZoneId}
            scheduledTime={scheduledTime}
          />
        )}
        
        <div className="text-center mt-10 text-xs text-gray-500">
          TimeMapper 24 – Dark Neo Edition
          {userTimeZone && <div>Your detected timezone: {userTimeZone}</div>}
        </div>
      </div>
    </div>
  );
};

export default Index;
