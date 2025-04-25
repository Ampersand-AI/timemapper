
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
import { toast } from '@/hooks/use-toast';
import SettingsButton from '@/components/SettingsButton';

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
        // Try to get user's location
        const coords = await getUserGeolocation().catch(() => null);
        
        let detectedTimezone;
        if (coords) {
          // Get timezone from coordinates
          detectedTimezone = await getTimezoneFromCoordinates(coords.latitude, coords.longitude);
        } else {
          // Fallback to browser's timezone
          detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        
        if (detectedTimezone) {
          const detectedZone = timeZones.find(tz => tz.id === detectedTimezone) 
            || timeZones.find(tz => tz.id.includes(detectedTimezone.split('/').pop() || '')) 
            || timeZones[0];
          
          setUserTimeZone(detectedZone.id);
          
          // Set initial timezone display with current time
          const now = getCurrentTimeInZone(detectedZone.id);
          setTimeZones([{
            id: detectedZone.id,
            name: detectedZone.name,
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

  const handleQuerySubmit = (query: string) => {
    // Parse the natural language query
    const parsedQuery = parseTimeQuery(query);
    
    if (!parsedQuery.isValid) {
      toast({
        title: "Invalid Query",
        description: "Please specify a time and at least one timezone. Example: '3pm EST to Tokyo'",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Parsed query:", parsedQuery);
      
      // Find time zones based on the query
      const fromZone = parsedQuery.fromZone 
        ? findTimeZone(parsedQuery.fromZone)
        : findTimeZone(userTimeZone || 'America/New_York'); // Use detected timezone or default
      
      const toZone = parsedQuery.toZone 
        ? findTimeZone(parsedQuery.toZone)
        : findTimeZone('America/Los_Angeles'); // Default if not specified
      
      if (!fromZone || !toZone) {
        toast({
          title: "Time Zone Not Found",
          description: "One or more of the specified time zones could not be found",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Converting from zone:", fromZone.id, "to zone:", toZone.id);
      
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
      
      console.log(`Converting time: ${timeToConvert.toISOString()}`);
      
      // Perform the conversion
      const result = convertTime(timeToConvert, fromZone.id, toZone.id);
      
      console.log("Conversion result:", result);
      
      // Prepare the timezone info for the user's timezone (source)
      const sourceTimeZone = {
        id: fromZone.id,
        name: fromZone.name,
        time: result.fromTime,
        isSource: true
      };
      
      // Prepare the timezone info for the target timezone
      const targetTimeZone = {
        id: toZone.id,
        name: toZone.name,
        time: result.toTime,
        isSource: false
      };
      
      // Update the timezones
      setTimeZones([sourceTimeZone, targetTimeZone]);
      
      // Set state for graph and context panel
      setFromZoneId(fromZone.id);
      setToZoneId(toZone.id);
      setScheduledTime(timeToConvert);
      setShowGraph(true);
      setShowContext(true);
      
      // Update user timezone if it's a query about their local timezone
      if (parsedQuery.isLocalToRemote || (!parsedQuery.fromZone && !parsedQuery.toZone)) {
        setUserTimeZone(fromZone.id);
      }
      
      // Show success toast
      toast({
        title: "Time Converted",
        description: `Converted ${parsedQuery.time || 'current time'} from ${fromZone.name} to ${toZone.name}`,
      });
    } catch (error) {
      console.error('Error converting time:', error);
      
      toast({
        title: "Conversion Error",
        description: "An error occurred while converting the time. Please try again.",
        variant: "destructive",
      });
    }
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
            <p className="text-gray-300">Detecting your location...</p>
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
