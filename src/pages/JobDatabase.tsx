import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import JobFilterBar from '@/components/jobs/JobFilterBar';
import JobTable from '../components/jobs/JobTable';
import { Button } from '@/components/ui/button';
import { Download, Save, ArrowUpDown } from 'lucide-react';
import australiaFlag from '../assets/Flag_of_Australia.svg.png';

interface JobFilters {
  postedDate: Date | undefined;
  roleCategory: string[];
  locationState: string[];
  experienceLevel: string[];
  locationType: string[];
  function: string;
  techSkills: string;
  industry: string;
}

const JobDatabase: React.FC = () => {
  const [filters, setFilters] = useState<JobFilters>({
    postedDate: undefined,
    roleCategory: [],
    locationState: [],
    experienceLevel: [],
    locationType: [],
    function: '',
    techSkills: '',
    industry: '',
  });

  const [activeTab, setActiveTab] = useState<'database' | 'tracker'>('database');
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  // Mock job data
  const jobData = [
    {
      id: 1,
      postedDate: '12/10/2025',
      postedDateValue: new Date('2025-10-12'),
      company: {
        title: 'Golang with Python',
        name: 'XPT Software Australia',
        location: 'Sydney, New South Wales'
      },
      topTechSkill: 'Python, Golang, Docker, Kubernetes, SQL, NoSQL, Git, Linux',
      function: 'Software Development',
      industry: 'Software Development, Information Technology',
      otherDetails: ['Data Engineer', 'Associate', 'Senior', 'Clearance']
    },
    {
      id: 2,
      postedDate: 'a day ago',
      postedDateValue: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      company: {
        title: 'Senior Data Analyst',
        name: 'TechCorp Australia',
        location: 'Melbourne, Victoria'
      },
      topTechSkill: 'SQL, Python, Tableau, Power BI, Excel',
      function: 'Data Analysis',
      industry: 'Finance, Banking',
      otherDetails: ['Senior', 'Full-time', 'Hybrid']
    },
    {
      id: 3,
      postedDate: '2 days ago',
      postedDateValue: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      company: {
        title: 'Machine Learning Engineer',
        name: 'AI Solutions Pty Ltd',
        location: 'Brisbane, Queensland'
      },
      topTechSkill: 'Python, TensorFlow, PyTorch, AWS, Docker',
      function: 'Machine Learning',
      industry: 'Technology, AI',
      otherDetails: ['Senior', 'Remote', 'Full-time']
    }
  ];

  const handleFiltersChange = (newFilters: JobFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      postedDate: undefined,
      roleCategory: [],
      locationState: [],
      experienceLevel: [],
      locationType: [],
      function: '',
      techSkills: '',
      industry: '',
    });
  };

  const handleSaveJob = (jobId: number) => {
    setSavedJobs(prev => {
      const newSavedJobs = new Set(prev);
      if (newSavedJobs.has(jobId)) {
        newSavedJobs.delete(jobId);
      } else {
        newSavedJobs.add(jobId);
      }
      return newSavedJobs;
    });
  };

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'latest' ? 'oldest' : 'latest');
  };

  // Filter and sort jobs based on active tab, filters, and sort order
  const getDisplayedJobs = () => {
    let filteredJobs = jobData;
    
    // Apply saved jobs filter if on tracker tab
    if (activeTab === 'tracker') {
      filteredJobs = jobData.filter(job => savedJobs.has(job.id));
    }
    
    // Apply all other filters
    filteredJobs = filteredJobs.filter(job => {
      // Posted Date filter
      if (filters.postedDate) {
        const selectedDate = filters.postedDate;
        const jobDate = job.postedDateValue;
        
        // Check if job was posted on the selected date
        const isSameDay = selectedDate.getDate() === jobDate.getDate() &&
                         selectedDate.getMonth() === jobDate.getMonth() &&
                         selectedDate.getFullYear() === jobDate.getFullYear();
        
        if (!isSameDay) return false;
      }
      
      // Role Category filter
      if (filters.roleCategory.length > 0) {
        const jobTitle = job.company.title.toLowerCase();
        const hasMatchingRole = filters.roleCategory.some(role => 
          jobTitle.includes(role.replace('-', ' '))
        );
        if (!hasMatchingRole) return false;
      }
      
      // Location State filter
      if (filters.locationState.length > 0) {
        const location = job.company.location.toLowerCase();
        const hasMatchingLocation = filters.locationState.some(state => 
          location.includes(state.toLowerCase())
        );
        if (!hasMatchingLocation) return false;
      }
      
      // Experience Level filter
      if (filters.experienceLevel.length > 0) {
        const otherDetails = job.otherDetails.join(' ').toLowerCase();
        const hasMatchingExperience = filters.experienceLevel.some(experience => 
          otherDetails.includes(experience.replace('-', ' '))
        );
        if (!hasMatchingExperience) return false;
      }
      
      // Location Type filter
      if (filters.locationType.length > 0) {
        const otherDetails = job.otherDetails.join(' ').toLowerCase();
        const hasMatchingLocationType = filters.locationType.some(locationType => 
          otherDetails.includes(locationType.replace('-', ' '))
        );
        if (!hasMatchingLocationType) return false;
      }
      
      // Function filter
      if (filters.function) {
        const jobFunction = job.function.toLowerCase();
        const filterFunction = filters.function.toLowerCase();
        if (!jobFunction.includes(filterFunction)) return false;
      }
      
      // Tech Skills filter
      if (filters.techSkills) {
        const skills = job.topTechSkill.toLowerCase();
        const filterSkills = filters.techSkills.toLowerCase();
        if (!skills.includes(filterSkills)) return false;
      }
      
      // Industry filter
      if (filters.industry) {
        const jobIndustry = job.industry.toLowerCase();
        const filterIndustry = filters.industry.toLowerCase();
        if (!jobIndustry.includes(filterIndustry)) return false;
      }
      
      return true;
    });
    
    // Sort by posted date
    const sortedJobs = [...filteredJobs].sort((a, b) => {
      if (sortOrder === 'latest') {
        return b.postedDateValue.getTime() - a.postedDateValue.getTime();
      } else {
        return a.postedDateValue.getTime() - b.postedDateValue.getTime();
      }
    });
    
    return sortedJobs;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-datacareer-darkBlue text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-6">
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold mb-4">
                  Curated & Handpicked Job Database
                </h1>
                
                {/* Disclaimer Messages */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-start gap-2 text-xs lg:text-sm">
                  ⚠️ We are not recruiters or job owners—we just share #data job listings to help job seekers.
                  </div>
                  <div className="flex items-start gap-2 text-xs lg:text-sm">
                    🚨 Be careful: some jobs may be fake. Always check if an ad is genuine.
                  </div>
                  <div className="flex items-start gap-2 text-xs lg:text-sm">
                  🔴 Apply directly or contact the recruiter/hiring manager using the provided link.
                  </div>
                  <div className="flex items-start gap-2 text-xs lg:text-sm">
                  🔔 Some listings use AI-generated content and may have errors or bias. Please verify all details yourself.
                  </div>
                  <div className="flex items-start gap-2 text-xs lg:text-sm">
                    🧐 Most jobs are data-related, but other roles or repeated listings may appear sometimes.
                  </div>
                </div>
              </div>

              {/* Bottom Section - Status Bar and Navigation Tabs */}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mt-6">
                {/* Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs lg:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">✉️</span>
                    <span>Data Jobs Only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">⚡</span>
                    <span>Updated daily at 7 AM Sydney time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img 
                      src={australiaFlag} 
                      alt="Australia Flag" 
                      className="w-4 h-3 object-contain"
                    />
                    <span>Australia-specific</span>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-2 justify-start lg:justify-end">
                  <Button
                    onClick={() => setActiveTab('database')}
                    variant={activeTab === 'database' ? 'default' : 'outline'}
                    className={`px-4 lg:px-6 py-2 rounded-full text-sm ${
                      activeTab === 'database' 
                        ? 'bg-white text-datacareer-darkBlue hover:bg-gray-100' 
                        : 'bg-transparent text-white border-white hover:bg-white hover:text-datacareer-darkBlue'
                    }`}
                  >
                    Job Database
                  </Button>
                  <Button
                    onClick={() => setActiveTab('tracker')}
                    variant={activeTab === 'tracker' ? 'default' : 'outline'}
                    className={`px-4 lg:px-6 py-2 rounded-full text-sm ${
                      activeTab === 'tracker' 
                        ? 'bg-white text-datacareer-darkBlue hover:bg-gray-100' 
                        : 'bg-transparent text-white border-white hover:bg-white hover:text-datacareer-darkBlue'
                    }`}
                  >
                    Saved Jobs
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Filter Bar */}
              <JobFilterBar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />

              {/* Job Statistics */}
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <div className="flex items-center justify-between">
                  <div className="text-gray-700 text-sm lg:text-base">
                    <span className="font-semibold">6247</span> (Last 30 days) | <span className="font-semibold">1302</span> (Last 7 days)
                  </div>
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-datacareer-darkBlue transition-colors cursor-pointer  " 
                    onClick={handleSortToggle}
                  >
                    Date Posted ({sortOrder === 'latest' ? 'Latest First' : 'Oldest First'})
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Job Table */}
              <JobTable 
                jobs={getDisplayedJobs()} 
                savedJobs={savedJobs}
                onSaveJob={handleSaveJob}
                activeTab={activeTab}
              />
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-6 space-y-3">
                {/* Sidebar content can be added here if needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDatabase;
