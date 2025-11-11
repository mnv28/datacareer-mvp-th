import React, { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { apiInstance } from '@/api/axiosApi';
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
  const [savedJobApiIds, setSavedJobApiIds] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [jobs, setJobs] = useState<any[]>([]);
  const [currentDataset, setCurrentDataset] = useState<'all' | 'hidden' | 'junior'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [lastCount, setLastCount] = useState<number>(0);
  const [knownMaxPage, setKnownMaxPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jobStats, setJobStats] = useState<{ last7Days: number; last30Days: number }>({
    last7Days: 0,
    last30Days: 0,
  });

  const mapApiRowsToJobs = (rows: any[]) => {
    return rows.map((r: any, idx: number) => {
      const postedVal = r?.posted_date?.value || r?.posted_date || '';
      const dateObj = postedVal ? new Date(postedVal) : new Date();
      const details: string[] = [];
      if (r?.role_cat) details.push(String(r.role_cat));
      if (r?.exp_level) details.push(String(r.exp_level));
      if (r?.location_type) details.push(String(r.location_type));
      if (r?.sec_clearance) details.push('Clearance');
      return {
        id: idx + 1,
        apiId: r?.id || '',
        url: r?.url || '',
        postedDate: postedVal,
        postedDateValue: dateObj,
        company: {
          title: r?.job_title || '',
          name: r?.company_name || '',
          location: r?.location || [r?.city, r?.state].filter(Boolean).join(', '),
        },
        topTechSkill: r?.top_tech_skills || '',
        function: r?.function || '',
        industry: r?.industry || '',
        otherDetails: details,
      };
    });
  };

  const mapSavedRowsToJobs = (rows: any[]) => {
    return rows.map((r: any, idx: number) => {
      // Handle nested job object structure from saved jobs API
      const jobData = r?.job || r;
      const postedVal = jobData?.posted_date?.value || jobData?.posted_date || '';
      const dateObj = postedVal ? new Date(postedVal) : new Date();
      
      // Format date for display (YYYY-MM-DD format)
      let formattedDate = '';
      if (postedVal) {
        try {
          formattedDate = format(dateObj, 'yyyy-MM-dd');
        } catch (e) {
          // If formatting fails, try to extract date part from ISO string
          formattedDate = postedVal.split('T')[0] || postedVal;
        }
      }
      
      const details: string[] = [];
      if (jobData?.role_cat) details.push(String(jobData.role_cat));
      if (jobData?.exp_level) details.push(String(jobData.exp_level));
      if (jobData?.location_type) details.push(String(jobData.location_type));
      if (jobData?.sec_clearance && jobData.sec_clearance !== '0') details.push('Clearance');
      return {
        id: idx + 1,
        apiId: r?.job_id || jobData?.id || r?.id || '',
        url: jobData?.url || r?.url || '',
        postedDate: formattedDate || postedVal,
        postedDateValue: dateObj,
        company: {
          title: jobData?.job_title || '',
          name: jobData?.company_name || '',
          location: jobData?.location || [jobData?.city, jobData?.state].filter(Boolean).join(', '),
        },
        topTechSkill: jobData?.top_tech_skills || '',
        function: jobData?.function || '',
        industry: jobData?.industry || '',
        otherDetails: details,
        status: r?.status, // status comes from the saved job record, not the job object
      };
    });
  };

  const mapLocationType = (val?: string) => {
    if (!val) return undefined;
    if (val === 'major-cities') return 'Major city';
    if (val === 'regional') return 'Regional / Remote';
    return val;
  };

  const mapStateCodeToName = (code?: string) => {
    if (!code) return undefined;
    const stateMap: { [key: string]: string } = {
      'nsw': 'New South Wales',
      'vic': 'Victoria',
      'qld': 'Queensland',
      'wa': 'Western Australia',
      'sa': 'South Australia',
      'tas': 'Tasmania',
      'act': 'ACT',
      'nt': 'Northern Territory',
    };
    return stateMap[code.toLowerCase()] || code;
  };

  const toTitleCase = (str?: string) => {
    if (!str) return undefined;
    return str
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const buildQueryParams = (page: number, lim: number) => {
    const joinOrUndefined = (arr?: string[], mapper?: (v: string) => string) => {
      if (!arr || arr.length === 0) return undefined;
      const mapped = mapper ? arr.map(mapper) : arr;
      return mapped.join(',');
    };
    const qp: Record<string, string> = {};
    qp.limit = String(lim);
    qp.page = String(page);
    qp.search = 'null';
    // Add sort parameter: 'latest' -> 'desc', 'oldest' -> 'asc', default is 'desc'
    qp.sort = sortOrder === 'latest' ? 'desc' : 'asc';
    if (filters.postedDate) {
      try {
        qp.posted_date = format(filters.postedDate, 'yyyy-MM-dd');
      } catch {}
    }
    const roleJoined = joinOrUndefined(filters.roleCategory, v => toTitleCase(v.replace('-', ' ')) as string);
    if (roleJoined) qp.role_cat = roleJoined;
    const statesJoined = joinOrUndefined(filters.locationState, c => mapStateCodeToName(c) as string);
    if (statesJoined) qp.state = statesJoined;
    const expJoined = joinOrUndefined(filters.experienceLevel, v => toTitleCase(v.replace('-', ' ')) as string);
    if (expJoined) qp.exp_level = expJoined;
    const locTypeJoined = joinOrUndefined(filters.locationType, v => mapLocationType(v) as string);
    if (locTypeJoined) qp.location_type = locTypeJoined;
    if (filters.function) qp.function = filters.function;
    if (filters.techSkills) qp.top_tech_skills = filters.techSkills;
    if (filters.industry) qp.industry = filters.industry;
    return qp;
  };

  const toQueryString = (qp: Record<string, string>) =>
    Object.entries(qp)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

  // Fetch saved job IDs from API
  const fetchSavedJobIds = async (): Promise<Set<string>> => {
    try {
      const url = `/api/jobs/getSavedJobs?limit=1000&page=1&search=null`;
      const resp = await apiInstance.get(url);
      const rows = Array.isArray(resp?.data?.data) ? resp.data.data : [];
      const savedIds = new Set<string>();
      rows.forEach((r: any) => {
        const jobId = r?.job_id || r?.id;
        if (jobId) savedIds.add(String(jobId));
      });
      return savedIds;
    } catch (e) {
      console.error('Failed to fetch saved job IDs', e);
      return new Set<string>();
    }
  };

  const fetchPage = async (dataset: 'all' | 'hidden' | 'junior', page: number) => {
    setIsLoading(true);
    const qp = buildQueryParams(page, limit);
    const qs = toQueryString(qp);
    const endpoint =
      dataset === 'all' ? 'getAllJobs' : dataset === 'hidden' ? 'hiddenJobs' : 'juniorJobs';
    const url = `/api/jobs/${endpoint}?${qs}`;
    try {
      const resp = await apiInstance.get(url);
      const rows = Array.isArray(resp?.data?.data) ? resp.data.data : [];
      const mappedJobs = mapApiRowsToJobs(rows);
      setJobs(mappedJobs);
      
      // Fetch saved job IDs and update savedJobs state
      const savedIds = await fetchSavedJobIds();
      setSavedJobApiIds(savedIds);
      
      // Map saved API IDs to local job IDs for current page
      setSavedJobs(prev => {
        const newSavedJobs = new Set(prev);
        // Update saved status for jobs on current page
        mappedJobs.forEach(job => {
          if (job.apiId && savedIds.has(String(job.apiId))) {
            newSavedJobs.add(job.id);
          } else {
            newSavedJobs.delete(job.id);
          }
        });
        return newSavedJobs;
      });
      
      setCurrentPage(page);
      setLastCount(rows.length || 0);
      // Update job statistics from API response
      if (resp?.data?.last_7_days !== undefined && resp?.data?.last_30_days !== undefined) {
        setJobStats({
          last7Days: resp.data.last_7_days || 0,
          last30Days: resp.data.last_30_days || 0,
        });
      }
      // Grow page numbers if we got a full page
      setKnownMaxPage(prev => {
        if ((rows.length || 0) >= limit) {
          return Math.max(prev, page + 1);
        }
        return Math.max(prev, page);
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedPage = async (page: number, excludeApiId?: string) => {
    setIsLoading(true);
    const qp = buildQueryParams(page, limit);
    const qs = toQueryString(qp);
    const url = `/api/jobs/getSavedJobs?${qs}`;
    try {
      const resp = await apiInstance.get(url);
      const rows = Array.isArray(resp?.data?.data) ? resp.data.data : [];
      
      // Filter out excluded job (unsaved job) to handle backend sync delay
      let filteredRows = rows;
      if (excludeApiId) {
        filteredRows = rows.filter((r: any) => {
          const jobId = r?.job_id || r?.job?.id || r?.id;
          return jobId && String(jobId) !== excludeApiId;
        });
      }
      
      // Map the saved jobs to the job format
      const mappedJobs = mapSavedRowsToJobs(filteredRows);
      setJobs(mappedJobs);
      
      // Update savedJobApiIds based on the actual saved jobs from API
      const savedIds = new Set<string>();
      filteredRows.forEach((r: any) => {
        const jobId = r?.job_id || r?.job?.id || r?.id;
        if (jobId) savedIds.add(String(jobId));
      });
      setSavedJobApiIds(savedIds);
      
      // Mark all jobs as saved in the tracker tab
      setSavedJobs(prev => {
        const newSavedJobs = new Set(prev);
        mappedJobs.forEach(job => {
          newSavedJobs.add(job.id);
        });
        return newSavedJobs;
      });
      
      setCurrentPage(page);
      setLastCount(mappedJobs.length || 0);
      setKnownMaxPage(prev => {
        if ((mappedJobs.length || 0) >= limit) {
          return Math.max(prev, page + 1);
        }
        return Math.max(prev, page);
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSaveJob = async (jobId: number, apiId: string, isSaved: boolean) => {
    // Update saved API IDs set
    setSavedJobApiIds(prev => {
      const newSet = new Set(prev);
      if (isSaved) {
        newSet.add(apiId);
      } else {
        newSet.delete(apiId);
      }
      return newSet;
    });

    // If we're on the tracker tab and job is unsaved, optimistically remove it from list
    if (activeTab === 'tracker' && !isSaved) {
      setJobs(prev => prev.filter(j => j.apiId !== apiId));
      // Also update savedJobs Set
      setSavedJobs(prev => {
        const newSavedJobs = new Set(prev);
        newSavedJobs.delete(jobId);
        return newSavedJobs;
      });
      // Wait a bit for backend to process the unsave, then refresh
      await new Promise(resolve => setTimeout(resolve, 300));
      // Refresh the list to get updated data from server, excluding the unsaved job
      await fetchSavedPage(currentPage, apiId).catch(console.error);
    } else {
      // Update local saved jobs state based on API response
      setSavedJobs(prev => {
        const newSavedJobs = new Set(prev);
        if (isSaved) {
          newSavedJobs.add(jobId);
        } else {
          newSavedJobs.delete(jobId);
        }
        return newSavedJobs;
      });

      // If we're on the tracker tab and job is saved, refresh the saved jobs list
      if (activeTab === 'tracker' && isSaved) {
        await fetchSavedPage(currentPage).catch(console.error);
      }
    }
  };

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'latest' ? 'oldest' : 'latest');
    // Reset to page 1 when sort changes
    setCurrentPage(1);
    setKnownMaxPage(1);
  };

  // Display jobs as received from API (already sorted)
  const displayedJobs = useMemo(() => {
    return [...jobs];
  }, [jobs]);

  const handleDatasetChange = (type: 'all' | 'hidden' | 'junior') => {
    // Immediately update dataset type for instant UI feedback
    setCurrentDataset(type);
  };

  const handleApplyDataset = async (type: 'all' | 'hidden' | 'junior', rows: any[]) => {
    setCurrentDataset(type);
    const mappedJobs = mapApiRowsToJobs(rows);
    setJobs(mappedJobs);
    
    // Fetch saved job IDs and update savedJobs state
    const savedIds = await fetchSavedJobIds();
    setSavedJobApiIds(savedIds);
    
    // Map saved API IDs to local job IDs
    setSavedJobs(prev => {
      const newSavedJobs = new Set(prev);
      mappedJobs.forEach(job => {
        if (job.apiId && savedIds.has(String(job.apiId))) {
          newSavedJobs.add(job.id);
        } else {
          newSavedJobs.delete(job.id);
        }
      });
      return newSavedJobs;
    });
    
    setCurrentPage(1);
    setLastCount(rows.length || 0);
    setKnownMaxPage(rows.length >= limit ? 2 : 1);
  };

  // Auto-fetch when filters, dataset, or sort order change (page resets to 1)
  useEffect(() => {
    // Refetch page 1 on filter, dataset, or sort order change
    setKnownMaxPage(1);
    if (activeTab === 'tracker') {
      fetchSavedPage(1).catch(console.error);
    } else {
      fetchPage(currentDataset, 1).catch(console.error);
    }
  }, [currentDataset, JSON.stringify(filters), activeTab, sortOrder]);

  // Load saved jobs when switching to tracker tab
  useEffect(() => {
    if (activeTab !== 'tracker') return;
    fetchSavedPage(1).catch(console.error);
  }, [activeTab]);

  // Ensure default All Jobs load when switching to Database tab
  useEffect(() => {
    if (activeTab === 'database') {
      setCurrentDataset('all');
      setKnownMaxPage(1);
      fetchPage('all', 1).catch(console.error);
    }
  }, [activeTab]);

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
                 <div className="flex gap-2 justify-start lg:justify-end bg-white rounded-lg p-1 px-2 w-fit">
                   <Button
                     onClick={() => setActiveTab('database')}
                     variant={activeTab === 'database' ? 'default' : 'outline'}
                     className={`px-3 sm:px-4 lg:px-5 py-2 rounded-lg text-xs sm:text-sm hover:bg-none! whitespace-nowrap ${
                       activeTab === 'database' 
                         ? 'bg-datacareer-darkBlue text-white' 
                         : 'bg-transparent text-datacareer-darkBlue border-white'
                     }`}
                   > 
                     <span className="sm:inline">Job Database</span>
                   </Button>
                   <Button
                     onClick={() => setActiveTab('tracker')}
                     variant={activeTab === 'tracker' ? 'default' : 'outline'}
                     className={`px-3 sm:px-4 lg:px-5 py-2 rounded-lg text-xs sm:text-sm hover:bg-none! whitespace-nowrap ${
                       activeTab === 'tracker' 
                         ? 'bg-datacareer-darkBlue text-white' 
                         : 'bg-transparent text-datacareer-darkBlue border-white'
                     }`}
                   >
                     <span className="sm:inline">Saved Jobs</span>
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
                onApplyDataset={handleApplyDataset}
                onDatasetChange={handleDatasetChange}
                currentDataset={currentDataset}
              />

              {/* Job Statistics */}
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <div className="flex items-center justify-between">
                  <div className="text-gray-700 text-sm lg:text-base">
                    <span className="font-semibold">{jobStats.last30Days.toLocaleString()}</span> (Last 30 days) | <span className="font-semibold">{jobStats.last7Days.toLocaleString()}</span> (Last 7 days)
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
              {isLoading && (
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-datacareer-darkBlue rounded-full animate-spin" />
                  <span className="text-sm text-gray-600">Loading results…</span>
                </div>
              )}
              <JobTable 
                jobs={displayedJobs} 
                savedJobs={savedJobs}
                onSaveJob={handleSaveJob}
                activeTab={activeTab}
              />

              {/* Pagination */}
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  className="px-3 py-1 text-sm rounded border hover:bg-gray-50 disabled:opacity-50"
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() => (activeTab === 'tracker' ? fetchSavedPage(currentPage - 1) : fetchPage(currentDataset, currentPage - 1))}
                >
                  Prev
                </button>
                {/* Numbered pages (growing window) */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: knownMaxPage }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      className={`min-w-[28px] h-7 px-2 text-sm rounded border ${
                        pageNum === currentPage
                          ? 'bg-datacareer-darkBlue text-white border-datacareer-darkBlue'
                          : 'hover:bg-gray-50'
                      }`}
                      disabled={isLoading}
                      onClick={() => (activeTab === 'tracker' ? fetchSavedPage(pageNum) : fetchPage(currentDataset, pageNum))}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <button
                  className="px-3 py-1 text-sm rounded border hover:bg-gray-50 disabled:opacity-50"
                  disabled={lastCount < limit || isLoading}
                  onClick={() => (activeTab === 'tracker' ? fetchSavedPage(currentPage + 1) : fetchPage(currentDataset, currentPage + 1))}
                >
                  Next
                </button>
              </div>
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
