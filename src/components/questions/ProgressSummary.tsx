
import React from 'react';
import { Progress } from "@/components/ui/progress";

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

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-datacareer-darkBlue mb-3">Your Progress</h3>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">Overall progress</span>
        <span className="text-sm font-medium text-datacareer-darkBlue">{solved} / {total} ({solvedPercentage}%)</span>
      </div>
      
      <Progress value={solvedPercentage} className="h-2 mb-6" />
      
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-difficulty-beginner rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Beginner</span>
            </div>
            <span className="text-sm font-medium text-datacareer-darkBlue">{beginnerSolved} / {beginner}</span>
          </div>
          <Progress value={beginnerPercentage} className="h-1.5 bg-gray-100" indicatorClassName="bg-difficulty-beginner" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-difficulty-intermediate rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Intermediate</span>
            </div>
            <span className="text-sm font-medium text-datacareer-darkBlue">{intermediateSolved} / {intermediate}</span>
          </div>
          <Progress value={intermediatePercentage} className="h-1.5 bg-gray-100" indicatorClassName="bg-difficulty-intermediate" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-difficulty-advanced rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Advanced</span>
            </div>
            <span className="text-sm font-medium text-datacareer-darkBlue">{advancedSolved} / {advanced}</span>
          </div>
          <Progress value={advancedPercentage} className="h-1.5 bg-gray-100" indicatorClassName="bg-difficulty-advanced" />
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
