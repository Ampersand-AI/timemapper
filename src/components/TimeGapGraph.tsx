
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getWorkingHoursRange } from '@/services/TimeUtils';
import { Clock } from 'lucide-react';

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
  console.log(`Rendering TimeGapGraph with fromZoneId=${fromZoneId}, toZoneId=${toZoneId}`);
  
  // Get the working hours data for both time zones
  const myHours = getWorkingHoursRange(date, fromZoneId);
  const theirHours = getWorkingHoursRange(date, toZoneId);
  
  console.log('My hours:', myHours);
  console.log('Their hours:', theirHours);
  
  // Build a mapping between timestamps
  const hourPairs = myHours.map(myHour => {
    // Find the corresponding "their" hour that matches the same global time
    const theirHour = theirHours.find(h => {
      return Math.abs(h.timestamp - myHour.timestamp) < 60000; // Within 1 minute
    });
    
    return {
      myHour,
      theirHour
    };
  });
  
  // Prepare data for the chart
  const chartData = myHours.map((hourData, index) => {
    // Find the corresponding "their" hour
    const theirHourData = theirHours.find(h => {
      return new Date(h.timestamp).getUTCHours() === new Date(hourData.timestamp).getUTCHours();
    });
    
    const fromTime = hourData.hour;
    // Get "their" hour that corresponds to this "my" hour timestamp
    const matchedTheirHour = theirHours.find(h => {
      return Math.abs(h.timestamp - hourData.timestamp) < 3600000; // Within an hour
    });
    
    const toTime = matchedTheirHour ? matchedTheirHour.hour : 'Unknown';
    
    // Check if this hour is within both working hours
    const overlapping = hourData.isWorkingHour && (matchedTheirHour?.isWorkingHour || false);
    
    return {
      hour: fromTime,
      from: hourData.isWorkingHour ? 1 : 0.3,
      to: matchedTheirHour?.isWorkingHour ? 1 : 0.3,
      fromTime,
      toTime,
      overlapping,
      timestamp: hourData.timestamp
    };
  });
  
  // Calculate overlapping working hours
  let overlappingHours = 0;
  myHours.forEach(myHour => {
    if (myHour.isWorkingHour) {
      // Find if there's a matching theirHour at the same timestamp that's also a working hour
      const matchingTheirHour = theirHours.find(h => 
        Math.abs(h.timestamp - myHour.timestamp) < 3600000 && h.isWorkingHour
      );
      if (matchingTheirHour) {
        overlappingHours++;
      }
    }
  });
  
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
        <p className="text-gray-400">You have approximately <span className="text-white font-medium">{overlappingHours} hours</span> of overlapping working time.</p>
      </div>
    </div>
  );
};

export default TimeGapGraph;
