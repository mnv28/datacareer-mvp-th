
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProgressSummaryProps {
  total: number;
  solved: number;
  beginner: number;
  intermediate: number;
  advanced: number;
  beginnerSolved: number;
  intermediateSolved: number;
  advancedSolved: number;
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({ 
  total, 
  solved, 
  beginner, 
  intermediate, 
  advanced,
  beginnerSolved,
  intermediateSolved,
  advancedSolved
}) => {
  const solvedPercentage = Math.round((solved / total) * 100) || 0;
  const beginnerPercentage = beginner > 0 ? Math.round((beginnerSolved / beginner) * 100) : 0;
  const intermediatePercentage = intermediate > 0 ? Math.round((intermediateSolved / intermediate) * 100) : 0;
  const advancedPercentage = advanced > 0 ? Math.round((advancedSolved / advanced) * 100) : 0;
  
  // Data for progress chart
  const difficultyData = [
    { name: 'Beginner', total: beginner, solved: beginnerSolved, color: 'rgba(74, 222, 128, 0.8)' },
    { name: 'Intermediate', total: intermediate, solved: intermediateSolved, color: 'rgba(250, 204, 21, 0.8)' },
    { name: 'Advanced', total: advanced, solved: advancedSolved, color: 'rgba(248, 113, 113, 0.8)' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-datacareer-darkBlue mb-3">Your Progress</h3>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">Overall progress</span>
        <span className="text-sm font-medium text-datacareer-darkBlue">{solved} / {total} ({solvedPercentage}%)</span>
      </div>
      
      <Progress value={solvedPercentage} className="h-2 mb-6" />
      
      <div className="mb-6">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={difficultyData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 'dataMax']} hide />
              <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value, name) => [value, name === 'total' ? 'Total Questions' : 'Solved']}
                labelFormatter={(label) => `${label} Difficulty`}
              />
              <Bar dataKey="total" name="Total Questions" radius={[0, 4, 4, 0]} barSize={12} fill="#e4e4e7">
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-total-${index}`} fill="#e4e4e7" />
                ))}
              </Bar>
              <Bar dataKey="solved" name="Solved" radius={[0, 4, 4, 0]} barSize={12}>
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-solved-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-difficulty-beginner rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Beginner</span>
            </div>
            <span className="text-sm font-medium text-datacareer-darkBlue">{beginnerSolved} / {beginner}</span>
          </div>
          <Progress value={beginnerPercentage} className="h-1.5 bg-gray-100" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-difficulty-intermediate rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Intermediate</span>
            </div>
            <span className="text-sm font-medium text-datacareer-darkBlue">{intermediateSolved} / {intermediate}</span>
          </div>
          <Progress value={intermediatePercentage} className="h-1.5 bg-gray-100" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-difficulty-advanced rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Advanced</span>
            </div>
            <span className="text-sm font-medium text-datacareer-darkBlue">{advancedSolved} / {advanced}</span>
          </div>
          <Progress value={advancedPercentage} className="h-1.5 bg-gray-100" />
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 rounded-md bg-gray-50">
            <div className="text-xl font-medium text-status-solved">{solved}</div>
            <div className="text-xs text-gray-500">Solved</div>
          </div>
          <div className="flex flex-col items-center p-2 rounded-md bg-gray-50">
            <div className="text-xl font-medium text-status-wrong">{total - solved - (total - solved)}</div>
            <div className="text-xs text-gray-500">Wrong</div>
          </div>
          <div className="flex flex-col items-center p-2 rounded-md bg-gray-50">
            <div className="text-xl font-medium text-status-unattempted">{total - solved}</div>
            <div className="text-xs text-gray-500">Unattempted</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSummary;
