
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
import LlamaService from '@/services/LlamaService';
import GeminiService from '@/services/GeminiService';

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

  // Get user's timezone on component mount
  useEffect(() => {
    async function detectUserLocation() {
      setIsDetectingLocation(true);
      try {
        // Get the user's timezone using improved detection
        const detectedTimezone = await getTimezoneFromCoordinates();
        console.log("Detected timezone:", detectedTimezone);
        
        if (detectedTimezone) {
          // Find the timezone data in our list
          const detectedZone = timeZones.find(tz => tz.id === detectedTimezone);
          
          if (detectedZone) {
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
          } else {
            fallbackToDefault();
          }
        } else {
          fallbackToDefault();
        }
      } catch (error) {
        console.error('Error detecting timezone:', error);
        fallbackToDefault();
      } finally {
        setIsDetectingLocation(false);
      }
    }
    
    // Fallback function when timezone detection fails
    function fallbackToDefault() {
      const defaultZone = findTimeZone('America/New_York');
      if (defaultZone) {
        setUserTimeZone(defaultZone.id);
        setTimeZones([{
          id: defaultZone.id,
          name: defaultZone.name,
          offset: defaultZone.offset,
          abbreviation: defaultZone.abbreviation, 
          time: getCurrentTimeInZone(defaultZone.id),
          isSource: true
        }]);
        setFromZoneId(defaultZone.id);
        
        toast({
          title: "Using Default Timezone",
          description: "Could not detect your timezone, using New York as default",
          variant: "destructive",
        });
      }
    }

    detectUserLocation();
  }, []);

  const handleQuerySubmit = async (query: string) => {
    setIsDetectingLocation(true);
    
    try {
      // Process the query using AI if available or fallback to basic parser
      let fromZoneStr = userTimeZone;
      let toZoneStr: string | undefined;
      let timeStr: string | undefined;
      let isValidQuery = false;
      
      // Try to use Gemini for enhanced query parsing if available
      if (GeminiService.hasApiKey()) {
        const geminiResult = await GeminiService.verifyTimeQuery(query);
        
        if (geminiResult.isValid) {
          fromZoneStr = geminiResult.fromZone || userTimeZone;
          toZoneStr = geminiResult.toZone;
          timeStr = geminiResult.time;
          isValidQuery = true;
          
          console.log("Gemini parsed query:", geminiResult);
        }
      } 
      // Try Llama as a fallback if Gemini failed or isn't available
      else if (LlamaService.hasApiKey()) {
        const llamaResult = await LlamaService.verifyTimeQuery(query);
        
        if (llamaResult.isValid) {
          fromZoneStr = llamaResult.fromZone || userTimeZone;
          toZoneStr = llamaResult.toZone;
          timeStr = llamaResult.time;
          isValidQuery = true;
          
          console.log("Llama parsed query:", llamaResult);
        }
      }
      
      // Fallback to basic parsing if AI services failed or aren't available
      if (!isValidQuery) {
        const parsedQuery = parseTimeQuery(query);
        isValidQuery = parsedQuery.isValid;
        
        if (isValidQuery) {
          fromZoneStr = parsedQuery.fromZone || userTimeZone;
          toZoneStr = parsedQuery.toZone;
          timeStr = parsedQuery.time;
          
          console.log("Basic parser result:", parsedQuery);
        } else {
          // Try simple location matching as a last resort
          const possibleLocation = query.trim();
          const matchedZone = findTimeZone(possibleLocation);
          
          if (matchedZone) {
            toZoneStr = matchedZone.id;
            isValidQuery = true;
          }
        }
      }
      
      if (!isValidQuery) {
        toast({
          title: "Invalid Query",
          description: "Please specify a time and at least one timezone or location.",
          variant: "destructive",
        });
        setIsDetectingLocation(false);
        return;
      }
      
      // Find time zones based on the parsed query
      const fromZone = findTimeZone(fromZoneStr);
      const toZone = toZoneStr ? findTimeZone(toZoneStr) : null;
      
      if (!fromZone) {
        throw new Error(`Could not find source timezone: ${fromZoneStr}`);
      }
      
      // Parse the time (default to current time if not specified)
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
      
      // Always ensure we have the user's timezone card shown first
      const userTimezoneCard: TimeZoneInfo = {
        id: fromZone.id,
        name: fromZone.name,
        offset: fromZone.offset,
        abbreviation: fromZone.abbreviation,
        time: getCurrentTimeInZone(fromZone.id),
        isSource: true
      };
      
      if (toZone) {
        // Process both source and target timezone
        const result = convertTime(timeToConvert, fromZone.id, toZone.id);
        
        // Target timezone card
        const targetTimezoneCard: TimeZoneInfo = {
          id: toZone.id,
          name: toZone.name,
          offset: toZone.offset,
          abbreviation: toZone.abbreviation,
          time: result.toTime,
          isSource: false
        };
        
        // Always refresh with exactly two cards - user's local time and target time
        setTimeZones([userTimezoneCard, targetTimezoneCard]);
        
        // Set state for graph and context panel
        setFromZoneId(fromZone.id);
        setToZoneId(toZone.id);
        setScheduledTime(timeToConvert);
        setShowGraph(true);
        setShowContext(true);
        
        // Show success toast
        toast({
          title: "Time Converted",
          description: `Converted ${formatInTimeZone(timeToConvert, fromZone.id, 'h:mm a')} from ${fromZone.name} to ${toZone.name}`,
        });
      } else {
        // Just display the target timezone alongside user's timezone
        const targetZone = findTimeZone(query);
        if (targetZone && targetZone.id !== fromZone.id) {
          // Show both user's timezone and the requested timezone
          const targetTimezoneCard: TimeZoneInfo = {
            id: targetZone.id,
            name: targetZone.name,
            offset: targetZone.offset,
            abbreviation: targetZone.abbreviation,
            time: getCurrentTimeInZone(targetZone.id),
            isSource: false
          };
          
          setTimeZones([userTimezoneCard, targetTimezoneCard]);
          
          // Set state for graph and context panel
          setFromZoneId(fromZone.id);
          setToZoneId(targetZone.id);
          setShowGraph(true);
          setShowContext(true);
          
          toast({
            title: "Timezone Comparison",
            description: `Showing current time in ${targetZone.name} compared to your time`,
          });
        } else {
          // Just show the user's timezone
          setTimeZones([userTimezoneCard]);
          setShowGraph(false);
          setShowContext(false);
          
          toast({
            title: "Current Time",
            description: `Showing current time in ${fromZone.name}`,
          });
        }
      }
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
