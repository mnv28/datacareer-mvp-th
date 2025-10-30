import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import saveIcon from '../../assets/save.svg';
import savedIcon from '../../assets/saved.svg';
import shareIcon from '../../assets/share.svg';
import industryIcon from '../../assets/industry.svg';

interface Job {
  id: number;
  postedDate: string;
  company: {
    title: string;
    name: string;
    location: string;
  };
  topTechSkill: string;
  function: string;
  industry: string;
  otherDetails: string[];
}

interface JobTableProps {
  jobs: Job[];
  savedJobs: Set<number>;
  onSaveJob: (jobId: number) => void;
  activeTab: 'database' | 'tracker';
}

const JobTable: React.FC<JobTableProps> = ({ jobs, savedJobs, onSaveJob, activeTab }) => {
  const [jobStatuses, setJobStatuses] = useState<{ [key: number]: string }>({});

  const handleStatusChange = (jobId: number, status: string) => {
    setJobStatuses(prev => ({
      ...prev,
      [jobId]: status
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'yet-to-apply':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'applied':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'first-contact':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'interview':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'other':
        return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatStatusName = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getDetailBadgeColor = (detail: string) => {
    const lowerDetail = detail.toLowerCase();
    if (lowerDetail.includes('data engineer') || lowerDetail.includes('data analyst')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (lowerDetail.includes('associate')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (lowerDetail.includes('senior')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    if (lowerDetail.includes('clearance')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (lowerDetail.includes('remote')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (lowerDetail.includes('full-time')) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    if (lowerDetail.includes('hybrid')) {
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Show empty state for saved jobs tracker
  if (activeTab === 'tracker' && jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Jobs Yet</h3>
          <p className="text-gray-500">Start saving jobs from the Job Database to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 border-b px-6 py-4">
        <div className="hidden lg:grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700">
          <div className="col-span-1">Posted date</div>
          <div className="col-span-3">Company</div>
          <div className="col-span-2">Top tech skill</div>
          <div className="col-span-1">Function</div>
          <div className="col-span-1">Industry</div>
          <div className={activeTab === 'tracker' ? 'col-span-2' : 'col-span-3'}>Other details</div>
          {activeTab === 'tracker' && (
            <>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-center">Actions</div>
            </>
          )}
          {activeTab === 'database' && (
            <div className="col-span-1 text-center">Actions</div>
          )}
        </div>
        {/* Mobile Header */}
        <div className="lg:hidden text-sm font-medium text-gray-700">
          Job Listings
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {jobs.map((job) => (
          <div key={job.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            {/* Desktop Layout */}
            <div className="hidden lg:grid grid-cols-12 gap-4 items-start">
              {/* Posted Date */}
              <div className="col-span-1">
                <div className="text-sm text-gray-600">
                  {job.postedDate}
                </div>
              </div>

              {/* Company */}
              <div className="col-span-3">
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">
                    {job.company.title}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <img src={industryIcon} alt="Industry" className="h-4 w-4" />
                    {job.company.name}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {job.company.location}
                  </div>
                </div>
              </div>

              {/* Top Tech Skill */}
              <div className="col-span-2">
                <div className="text-sm text-gray-700">
                  {job.topTechSkill}
                </div>
              </div>

              {/* Function */}
              <div className="col-span-1">
                <div className="text-sm text-gray-700">
                  {job.function}
                </div>
              </div>

              {/* Industry */}
              <div className="col-span-1">
                <div className="text-sm text-gray-700">
                  {job.industry}
                </div>
              </div>

              {/* Other Details */}
              <div className={activeTab === 'tracker' ? 'col-span-2' : 'col-span-3'}>
                <div className="flex flex-wrap gap-1 mb-2">
                  {job.otherDetails.map((detail, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`text-xs ${getDetailBadgeColor(detail)}`}
                    >
                      {detail}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Status - Only for Saved Jobs Tracker */}
              {activeTab === 'tracker' && (
                <div className="col-span-1">
                  <Select
                    value={jobStatuses[job.id] || 'yet-to-apply'}
                    onValueChange={(value) => handleStatusChange(job.id, value)}
                  >
                    <SelectTrigger className="h-9 text-xs whitespace-nowrap">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yet-to-apply">Yet to Apply</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="first-contact">First Contact</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Actions */}
              <div className="col-span-1">
                <div className="flex justify-center gap-6">
                  <div className="cursor-pointer" onClick={() => onSaveJob(job.id)}>
                   <img 
                       src={savedJobs.has(job.id) ? savedIcon : saveIcon} 
                       alt="Save" 
                       className="h-5 w-5" 
                     />
                  </div>
                  <div className="cursor-pointer" onClick={() => console.log('Share all jobs')}>
                    <img src={shareIcon} alt="Share All" className="h-5 w-5 hover:opacity-70" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">
                    {job.company.title}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {job.company.name}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin className="h-3 w-3" />
                    {job.company.location}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {job.postedDate}
                </div>
              </div>

              <div className="text-sm text-gray-700 mb-2">
                <strong>Skills:</strong> {job.topTechSkill}
              </div>

              {activeTab === 'tracker' && (
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <Select
                    value={jobStatuses[job.id] || 'yet-to-apply'}
                    onValueChange={(value) => handleStatusChange(job.id, value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yet-to-apply">Yet to Apply</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="first-contact">First Contact</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  <div><strong>Function:</strong> {job.function}</div>
                  <div><strong>Industry:</strong> {job.industry}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    onClick={() => onSaveJob(job.id)}
                  >
                    <img 
                      src={savedJobs.has(job.id) ? savedIcon : saveIcon} 
                      alt="Save" 
                      className="h-4 w-4" 
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <img src={shareIcon} alt="External Link" className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {job.otherDetails.map((detail, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={`text-xs ${getDetailBadgeColor(detail)}`}
                  >
                    {detail}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default JobTable;
