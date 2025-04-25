
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getWorkingHoursRange } from '@/services/TimeUtils';
import { Clock } from 'lucide-react';
import { differenceInHours, formatInTimeZone } from 'date-fns-tz';

interface TimeGapGraphProps {
  fromZoneId: string;
  toZoneId: string;
  date: Date;
}

// Custom tooltip to show the time difference
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const hour = label;
    const fromZoneData = payload.find((p: any) => p.dataKey === 'from');
    const toZoneData = payload.find((p: any) => p.dataKey === 'to');
    
    return (
      <div className="neo-raised p-3">
        <p className="text-xs text-gray-400">{hour}</p>
        {fromZoneData && (
          <p className="text-neo-my-accent text-xs">
            Your time: {fromZoneData.payload.fromTime}
          </p>
        )}
        {toZoneData && (
          <p className="text-neo-their-accent text-xs">
            Their time: {toZoneData.payload.toTime}
          </p>
        )}
      </div>
    );
  }
  
  return null;
};

const TimeGapGraph: React.FC<TimeGapGraphProps> = ({ fromZoneId, toZoneId, date }) => {
  console.log("Rendering TimeGapGraph with:", { fromZoneId, toZoneId, date: date.toISOString() });
  
  // Memoize the chart data to avoid recalculations on re-renders
  const { chartData, overlappingHours, exactTimeDiff } = useMemo(() => {
    // Get the working hours data for both time zones
    const myHours = getWorkingHoursRange(date, fromZoneId);
    const theirHours = getWorkingHoursRange(date, toZoneId);
    
    // Calculate exact time difference between the two zones
    const now = new Date();
    const fromDate = new Date(now);
    const toDate = new Date(now);
    
    // Format the dates in their respective timezones
    const fromDateFormatted = formatInTimeZone(fromDate, fromZoneId, 'yyyy-MM-dd HH:mm:ss');
    const toDateFormatted = formatInTimeZone(toDate, toZoneId, 'yyyy-MM-dd HH:mm:ss');
    
    // Parse back to get actual timezone-adjusted Date objects
    const fromDateAdjusted = new Date(fromDateFormatted);
    const toDateAdjusted = new Date(toDateFormatted);
    
    // Calculate the exact difference in hours (can be decimal)
    const exactTimeDiff = Math.abs((toDateAdjusted.getTime() - fromDateAdjusted.getTime()) / (1000 * 60 * 60));
    
    // Prepare data for the chart with exact time differences
    const chartData = myHours.map((myHour) => {
      const myWorkingHour = myHour.isWorkingHour ? 1 : 0.3;
      
      // Find the equivalent "their hour" at the same moment in time
      const myHourTimestamp = myHour.timestamp;
      const theirHourAtSameTime = theirHours.find(theirHour => {
        const timeDiff = Math.abs(theirHour.timestamp - myHourTimestamp);
        return timeDiff < 10 * 60 * 1000; // Within 10 minutes to account for any minor calculation differences
      });
      
      const theirWorkingHour = theirHourAtSameTime?.isWorkingHour ? 1 : 0.3;
      const theirTime = theirHourAtSameTime?.hour || "Unknown";
      
      return {
        hour: myHour.hour,
        from: myWorkingHour,
        to: theirWorkingHour,
        fromTime: myHour.hour,
        toTime: theirTime,
        overlapping: myHour.isWorkingHour && theirHourAtSameTime?.isWorkingHour
      };
    });
    
    // Calculate exact overlapping working hours
    const workingHoursOverlap = chartData.filter(hour => hour.overlapping).length;
    
    return {
      chartData, 
      overlappingHours: workingHoursOverlap,
      exactTimeDiff
    };
  }, [fromZoneId, toZoneId, date]);
  
  return (
    <div className="neo-raised p-4 mt-6 text-white">
      <h3 className="text-lg font-medium mb-2 flex items-center">
        <Clock className="mr-2" size={20} />
        Time Overlap Analysis
      </h3>
      
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorFrom" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2AB8A6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#2AB8A6" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorTo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF914D" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FF914D" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="hour" 
              tick={{ fill: '#aaa', fontSize: 10 }}
              interval={1} 
            />
            <YAxis hide={true} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="from" 
              stackId="1"
              stroke="#2AB8A6" 
              fillOpacity={1}
              fill="url(#colorFrom)" 
            />
            <Area 
              type="monotone" 
              dataKey="to" 
              stackId="2"
              stroke="#FF914D" 
              fillOpacity={1}
              fill="url(#colorTo)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between mt-2 text-sm">
        <div>
          <span className="inline-block w-3 h-3 rounded-full bg-neo-my-accent mr-2"></span>
          Your working hours
        </div>
        <div>
          <span className="inline-block w-3 h-3 rounded-full bg-neo-their-accent mr-2"></span>
          Their working hours
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-gray-400">
          You have exactly <span className="text-white font-medium">{overlappingHours} hours</span> of overlapping working time.
          <br />
          <span className="text-sm mt-1 block">
            Time difference: <span className="text-white font-medium">{exactTimeDiff.toFixed(1)} hours</span>
          </span>
        </p>
      </div>
    </div>
  );
};

export default TimeGapGraph;
