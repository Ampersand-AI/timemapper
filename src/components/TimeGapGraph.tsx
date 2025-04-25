
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { getWorkingHoursRange } from '@/services/TimeUtils';
import { Clock } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { differenceInHours } from 'date-fns';

interface TimeGapGraphProps {
  fromZoneId: string;
  toZoneId: string;
  date: Date;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const fromZoneData = payload.find((p: any) => p.dataKey === 'from');
    const toZoneData = payload.find((p: any) => p.dataKey === 'to');
    
    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
        <p className="text-gray-400 text-xs font-medium mb-1">{label}</p>
        {fromZoneData && (
          <p className="text-neo-my-accent text-sm">
            Your time: {fromZoneData.payload.fromTime}
          </p>
        )}
        {toZoneData && (
          <p className="text-neo-their-accent text-sm">
            Their time: {toZoneData.payload.toTime}
          </p>
        )}
        {fromZoneData?.payload.overlapping && (
          <p className="text-green-400 text-xs mt-1">
            ✓ Overlapping working hours
          </p>
        )}
      </div>
    );
  }
  return null;
};

const TimeGapGraph: React.FC<TimeGapGraphProps> = ({ fromZoneId, toZoneId, date }) => {
  const { chartData, overlappingHours, exactTimeDiff } = useMemo(() => {
    const myHours = getWorkingHoursRange(date, fromZoneId);
    const theirHours = getWorkingHoursRange(date, toZoneId);
    
    // Calculate exact time difference
    const now = new Date();
    const fromTimeStr = formatInTimeZone(now, fromZoneId, "yyyy-MM-dd'T'HH:mm:ssXXX");
    const toTimeStr = formatInTimeZone(now, toZoneId, "yyyy-MM-dd'T'HH:mm:ssXXX");
    
    const fromDateTime = new Date(fromTimeStr);
    const toDateTime = new Date(toTimeStr);
    
    // Calculate the exact time difference in hours
    const exactTimeDiff = differenceInHours(toDateTime, fromDateTime);
    
    const chartData = myHours.map(myHour => {
      const myWorkingHour = myHour.isWorkingHour ? 1 : 0.3;
      
      // Find their hour at the same moment
      const theirHourAtSameTime = theirHours.find(theirHour => 
        Math.abs(theirHour.timestamp - myHour.timestamp) < 600000 // 10 minutes tolerance
      );
      
      const theirWorkingHour = theirHourAtSameTime?.isWorkingHour ? 1 : 0.3;
      
      return {
        hour: myHour.hour,
        from: myWorkingHour,
        to: theirWorkingHour,
        fromTime: myHour.hour,
        toTime: theirHourAtSameTime?.hour || 'N/A',
        overlapping: myHour.isWorkingHour && theirHourAtSameTime?.isWorkingHour
      };
    });
    
    const workingHoursOverlap = chartData.filter(hour => hour.overlapping).length;
    
    return { chartData, overlappingHours: workingHoursOverlap, exactTimeDiff };
  }, [fromZoneId, toZoneId, date]);
  
  const getTimeDiffDisplay = () => {
    const hours = Math.abs(exactTimeDiff);
    const direction = exactTimeDiff > 0 ? 'ahead' : 'behind';
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${direction}`;
  };
  
  return (
    <div className="neo-raised p-6 mt-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Clock className="mr-2" size={20} />
        Time Overlap Analysis
      </h3>
      
      <div className="text-center mb-4">
        <div className="inline-block bg-gray-800 px-4 py-2 rounded-full">
          <span className="text-xl font-medium text-white">
            Time difference: {getTimeDiffDisplay()}
          </span>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
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
              <linearGradient id="colorOverlap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="hour" 
              tick={{ fill: '#aaa', fontSize: 12 }}
              interval={1}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top"
              height={36}
              formatter={(value) => {
                if (value === "from") return "Your working hours";
                if (value === "to") return "Their working hours";
                return value;
              }}
            />
            <ReferenceLine y={0.5} stroke="#666" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="from" 
              stackId="1"
              stroke="#2AB8A6" 
              fill="url(#colorFrom)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="to" 
              stackId="2"
              stroke="#FF914D" 
              fill="url(#colorTo)" 
              strokeWidth={2}
            />
            {/* Add special highlight for overlapping hours */}
            {chartData.filter(d => d.overlapping).length > 0 && (
              <Area 
                type="monotone"
                dataKey={(data) => data.overlapping ? 0.7 : 0}
                stackId="3"
                stroke="#4CAF50"
                fill="url(#colorOverlap)"
                strokeWidth={1}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 text-center py-3 bg-gray-800/50 rounded-lg">
        <p className="text-xl font-medium text-white">
          {overlappingHours} {overlappingHours === 1 ? 'hour' : 'hours'} of working time overlap
        </p>
        {overlappingHours > 0 ? (
          <p className="text-green-400 text-sm mt-1">
            ✓ Good communication window available
          </p>
        ) : (
          <p className="text-orange-400 text-sm mt-1">
            ⚠ No overlapping working hours - coordination may be challenging
          </p>
        )}
      </div>
    </div>
  );
};

export default TimeGapGraph;
