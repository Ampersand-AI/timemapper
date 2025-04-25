
import React, { useState } from 'react';
import TimeInput from '@/components/TimeInput';
import TimeTiles, { TimeZoneInfo } from '@/components/TimeTiles';
import TimeGapGraph from '@/components/TimeGapGraph';
import ContextPanel from '@/components/ContextPanel';
import { parseTimeQuery } from '@/services/ChatParser';
import { findTimeZone, convertTime, getCurrentTimeInZone } from '@/services/TimeUtils';
import { toast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const [timeZones, setTimeZones] = useState<TimeZoneInfo[]>([]);
  const [showGraph, setShowGraph] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [fromZoneId, setFromZoneId] = useState('');
  const [toZoneId, setToZoneId] = useState('');
  const [scheduledTime, setScheduledTime] = useState(new Date());
  
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
        : findTimeZone('America/New_York'); // Default if not specified
      
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
      
      console.log(`Converting time: ${timeToConvert.toISOString()} from ${fromZone.id} to ${toZone.id}`);
      
      // Determine which is the source time zone (user's time) and which is the target
      let sourceZoneId, targetZoneId;
      
      if (parsedQuery.isLocalToRemote) {
        // User specified their local time zone (e.g., "I am in India")
        sourceZoneId = fromZone.id;
        targetZoneId = toZone.id;
        console.log("Local to remote conversion. Source:", sourceZoneId, "Target:", targetZoneId);
      } else {
        // Default case - we're converting from the first mentioned to the second mentioned
        sourceZoneId = fromZone.id;
        targetZoneId = toZone.id;
        console.log("Standard conversion. Source:", sourceZoneId, "Target:", targetZoneId);
      }
      
      // Perform the conversion correctly based on source and target
      const result = convertTime(timeToConvert, sourceZoneId, targetZoneId);
      
      console.log("Conversion result:", result);
      
      // Update the state with the conversion results - ensure correct mapping of source/target
      setTimeZones([
        {
          id: sourceZoneId,
          name: fromZone.name,
          time: timeToConvert, // Original input time in source zone
          isSource: true
        },
        {
          id: targetZoneId,
          name: toZone.name,
          time: result.toTime, // Converted time in target zone
          isSource: false
        }
      ]);
      
      console.log("Time zones set:", timeZones);
      
      // Set state for graph and context panel
      setFromZoneId(sourceZoneId);
      setToZoneId(targetZoneId);
      setScheduledTime(timeToConvert);
      setShowGraph(true);
      setShowContext(true);
      
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-teal mb-2">TimeMapper 24</h1>
          <p className="text-gray-400">
            Convert times across multiple zones with weather and local context
          </p>
        </div>
        
        <div className="neo-raised p-6 mb-6">
          <TimeInput onQuerySubmit={handleQuerySubmit} />
        </div>
        
        {timeZones.length > 0 && (
          <TimeTiles timeZones={timeZones} />
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
        </div>
      </div>
    </div>
  );
};

export default Index;
