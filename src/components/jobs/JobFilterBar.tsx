import React, { useEffect } from 'react';
import { apiInstance } from '@/api/axiosApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X, Download, Save, CalendarIcon, ChevronDown } from 'lucide-react';
import { format, startOfToday } from 'date-fns';

interface JobFilters {
  postedDate: Date | undefined;
  roleCategory: string[];
  locationState: string[];
  experienceLevel: string[];
  locationType: string[];
  function: string;
  techSkills: string;
  industry: string;
  status?: string;
}

interface JobFilterBarProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onClearFilters: () => void;
  onApplyDataset?: (type: 'all' | 'hidden' | 'junior', rows: any[]) => void;
  onDatasetChange?: (type: 'all' | 'hidden' | 'junior') => void;
  currentDataset?: 'all' | 'hidden' | 'junior';
  activeTab?: 'database' | 'tracker';
}

const JobFilterBar: React.FC<JobFilterBarProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onApplyDataset,
  onDatasetChange,
  currentDataset,
  activeTab = 'database'
}) => {
  // Local state for pending filters (what user selects but hasn't applied yet)
  const [pendingFilters, setPendingFilters] = React.useState<JobFilters>(filters);

  // Sync pending filters when props filters change (e.g., when cleared from parent)
  useEffect(() => {
    setPendingFilters(filters);
  }, [filters]);

  const [openPopovers, setOpenPopovers] = React.useState<{
    roleCategory: boolean;
    locationState: boolean;
    experienceLevel: boolean;
    locationType: boolean;
  }>({
    roleCategory: false,
    locationState: false,
    experienceLevel: false,
    locationType: false,
  });

  const [isDownloading, setIsDownloading] = React.useState<boolean>(false);

  const dropdownContentStyle: React.CSSProperties = {
    width: 'var(--radix-popover-trigger-width)',
  };

  // Helper function to get full state name
  const getStateFullName = (stateCode: string): string => {
    const stateMap: { [key: string]: string } = {
      'nsw': 'New South Wales',
      'vic': 'Victoria',
      'qld': 'Queensland',
      'wa': 'Western Australia',
      'sa': 'South Australia',
      'tas': 'Tasmania',
      'act': 'ACT',
      'nt': 'Northern Territory'
    };
    return stateMap[stateCode.toLowerCase()] || stateCode.toUpperCase();
  };

  // Map internal filter keys to human-friendly labels for the Active Filters chips
  const getFilterLabel = (key: keyof JobFilters): string => {
    const map: Record<keyof JobFilters, string> = {
      postedDate: 'Posted Date',
      roleCategory: 'Role Category',
      locationState: 'Location State',
      experienceLevel: 'Experience Level',
      locationType: 'Location Type',
      function: 'Function',
      techSkills: 'Tech Skills',
      industry: 'Industry',
      status: 'Status',
    };
    return map[key] || String(key);
  };

  // Update pending filters locally (doesn't trigger search)
  const handlePendingFilterChange = (key: keyof JobFilters, value: string | Date | undefined | string[]) => {
    setPendingFilters({
      ...pendingFilters,
      [key]: value
    });
  };

  // Use midnight-normalised "today" so calendar can't select today or any future date
  const today = startOfToday(); // Block today and all future dates
  // Apply pending filters (triggers search)
  const handleApplyFilters = () => {
    onFiltersChange(pendingFilters);
  };

  const handleMultiSelectChange = (key: 'roleCategory' | 'locationState' | 'experienceLevel' | 'locationType', value: string, checked: boolean) => {
    const currentValues = pendingFilters[key] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);

    handlePendingFilterChange(key, newValues);
  };

  // Handle clear - reset both pending and applied filters
  const handleClearPendingFilters = () => {
    const clearedFilters = {
      postedDate: undefined,
      roleCategory: [],
      locationState: [],
      experienceLevel: [],
      locationType: [],
      function: '',
      techSkills: '',
      industry: '',
      status: '',
    };
    setPendingFilters(clearedFilters);
    onClearFilters();
  };

  const togglePopover = (key: 'roleCategory' | 'locationState' | 'experienceLevel' | 'locationType', isOpen: boolean) => {
    setOpenPopovers(prev => ({ ...prev, [key]: isOpen }));
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== '' && value !== undefined && value !== null;
  });

  // Check if pending filters differ from applied filters
  const hasPendingChanges = React.useMemo(() => {
    // Compare dates properly
    const pendingDate = pendingFilters.postedDate?.getTime();
    const appliedDate = filters.postedDate?.getTime();
    if (pendingDate !== appliedDate) return true;

    // Compare arrays
    if (JSON.stringify(pendingFilters.roleCategory) !== JSON.stringify(filters.roleCategory)) return true;
    if (JSON.stringify(pendingFilters.locationState) !== JSON.stringify(filters.locationState)) return true;
    if (JSON.stringify(pendingFilters.experienceLevel) !== JSON.stringify(filters.experienceLevel)) return true;
    if (JSON.stringify(pendingFilters.locationType) !== JSON.stringify(filters.locationType)) return true;

    // Compare strings
    if (pendingFilters.function !== filters.function) return true;
    if (pendingFilters.techSkills !== filters.techSkills) return true;
    if (pendingFilters.industry !== filters.industry) return true;
    if ((pendingFilters as any).status !== (filters as any).status) return true;

    return false;
  }, [pendingFilters, filters]);

  // =====================
  // Download helpers
  // =====================
  // API base is provided by apiInstance

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

  // Format a Date to local 'yyyy-MM-dd' string
  // This must match how JobDatabase builds its posted_date query param
  const formatDateToYMDLocal = (date?: Date) => {
    if (!date) return undefined;
    try {
      return format(date, 'yyyy-MM-dd');
    } catch {
      return undefined;
    }
  };

  // Format a Date to display as 'dd-MM-yyyy' in the user's local timezone
  const formatDateDisplayLocal = (date?: Date) => {
    if (!date) return '';
    try {
      return format(date, 'dd-MM-yyyy');
    } catch {
      return '';
    }
  };

  const buildQueryParams = (currentFilters: JobFilters) => {
    // Support multi-select: join with commas
    const joinOrUndefined = (arr?: string[], mapper?: (v: string) => string) => {
      if (!arr || arr.length === 0) return undefined;
      const mapped = mapper ? arr.map(mapper) : arr;
      return mapped.join(',');
    };
    const qp: Record<string, string> = {};

    // Defaults (align with pagination: 30 per page)
    qp.limit = '30';
    qp.page = '1';
    qp.search = 'null';
    // Default sort to desc (latest first) for downloads
    qp.sort = 'desc';

    if (currentFilters.postedDate) {
      const ymd = formatDateToYMDLocal(currentFilters.postedDate);
      if (ymd) qp.posted_date = ymd;
    }
    const roleJoined = joinOrUndefined(currentFilters.roleCategory, v => toTitleCase(v.replace('-', ' ')) as string);
    if (roleJoined) qp.role_cat = roleJoined;

    const statesJoined = joinOrUndefined(currentFilters.locationState, c => mapStateCodeToName(c) as string);
    if (statesJoined) qp.state = statesJoined;

    const expJoined = joinOrUndefined(currentFilters.experienceLevel, v => toTitleCase(v.replace('-', ' ')) as string);
    if (expJoined) qp.exp_level = expJoined;

    const locTypeJoined = joinOrUndefined(currentFilters.locationType, v => mapLocationType(v) as string);
    if (locTypeJoined) qp.location_type = locTypeJoined;

    if (currentFilters.function) qp.func = currentFilters.function;
    if (currentFilters.techSkills) qp.top_tech_skills = currentFilters.techSkills;
    if (currentFilters.industry) qp.industry = currentFilters.industry;

    return qp;
  };

  const toQueryString = (qp: Record<string, string>) =>
    Object.entries(qp)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

  const DOWNLOAD_PAGE_SIZE = 1000;

  const formatHeaderLabel = (header: string) => {
    return header
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  const deriveTotalPages = (respData: any, rowsLength: number, limitValue: number, page: number) => {
    const responseTotalPages = Number(respData?.total_pages);
    if (!Number.isNaN(responseTotalPages) && responseTotalPages > 0) {
      return responseTotalPages;
    }
    const responseCount = Number(respData?.count);
    if (!Number.isNaN(responseCount) && responseCount > 0) {
      return Math.max(1, Math.ceil(responseCount / limitValue));
    }
    if (rowsLength < limitValue) {
      return Math.max(1, page);
    }
    return page + 1;
  };

  // const jsonToCsv = (rows: any[]) => {
  //   if (!rows || rows.length === 0) return '';
  //   const headers = [
  //     'posted_date', 'job_title', 'company_name', 'city', 'state', 'location', 'top_tech_skills', 'function', 'industry', 'role_cat', 'exp_level', 'sec_clearance', 'pr_citizenship_req', 'url', 'location_type'
  //   ];
  //   const escape = (val: any) => {
  //     if (val === undefined || val === null) return '';
  //     const str = String(val).replace(/\r?\n|\r/g, ' ');
  //     if (str.includes(',') || str.includes('"')) {
  //       return '"' + str.replace(/"/g, '""') + '"';
  //     }
  //     return str;
  //   };
  //   const lines = [headers.map(formatHeaderLabel).join(',')];
  //   for (const r of rows) {
  //     const posted = r.posted_date && typeof r.posted_date === 'object' ? r.posted_date.value : r.posted_date;
  //     const locationDisplay = r.location || [r.city, r.state].filter(Boolean).join(', ');
  //     const line = headers.map(fieldName => {
  //       switch (fieldName) {
  //         case 'posted_date':
  //           return escape(posted);
  //         case 'location':
  //           return escape(locationDisplay);
  //         default:
  //           return escape(r[fieldName]);
  //       }
  //     }).join(',');
  //     lines.push(line);
  //   }
  //   return lines.join('\n');
  // };


  const jsonToCsv = (rows: any[]) => {
    if (!rows || rows.length === 0) return '';

    // Updated headers without 'location' field
    const headers = [
      'posted_date', 'job_title', 'company_name', 'city', 'state', 'top_tech_skills', 'function', 'industry', 'role_cat', 'exp_level', 'sec_clearance', 'pr_citizenship_req', 'url', 'location_type'
    ];

    const escape = (val: any) => {
      if (val === undefined || val === null) return '';
      const str = String(val).replace(/\r?\n|\r/g, ' '); // replace newlines with space
      if (str.includes(',') || str.includes('"')) {
        return '"' + str.replace(/"/g, '""') + '"'; // escape quotes by doubling them
      }
      return str;
    };

    const formatDate = (date: any) => {
      if (!date) return ''; // return empty string if no date
      try {
        const d = new Date(date);
        // Format using local timezone so CSV matches what user sees in the UI
        return format(d, 'yyyy-MM-dd');
      } catch {
        // Fallback: try to extract date part if it's already an ISO-like string
        const str = String(date);
        const parts = str.split('T');
        return parts[0] || str;
      }
    };

    const lines = [headers.map(formatHeaderLabel).join(',')]; // Add header row

    for (const r of rows) {
      // Get the posted_date and format it to 'yyyy-MM-dd' (remove time part)
      const posted = r.posted_date && typeof r.posted_date === 'object' ? formatDate(r.posted_date.value) : formatDate(r.posted_date);

      const line = headers.map(fieldName => {
        switch (fieldName) {
          case 'posted_date':
            return escape(posted); // Format posted date without time
          default:
            return escape(r[fieldName]); // Handle other fields
        }
      }).join(',');

      lines.push(line); // Add the data row to lines
    }

    return lines.join('\n'); // Join all lines with newline character
  };

  const triggerDownload = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const fetchRows = async (endpoint: string): Promise<any[]> => {
    // Use applied filters (not pending) for downloads
    const qp = buildQueryParams(filters);
    const qs = toQueryString(qp);
    const url = `/api/jobs/${endpoint}?${qs}`;
    console.log('Fetching jobs with filters ->', qp, 'URL:', url);
    const resp = await apiInstance.get(url);
    const rows = Array.isArray(resp?.data?.data) ? resp.data.data : [];
    return rows;
  };

  const fetchAllRowsForDownload = async (endpoint: string): Promise<any[]> => {
    const qp = buildQueryParams(filters);
    qp.limit = String(DOWNLOAD_PAGE_SIZE);
    let page = 1;
    let totalPagesToFetch = 1;
    const allRows: any[] = [];

    while (page <= totalPagesToFetch) {
      qp.page = String(page);
      const qs = toQueryString(qp);
      const url = `/api/jobs/${endpoint}?${qs}`;
      const resp = await apiInstance.get(url);
      const rows = Array.isArray(resp?.data?.data) ? resp.data.data : [];
      allRows.push(...rows);

      const nextTotalPages = deriveTotalPages(resp?.data, rows.length || 0, DOWNLOAD_PAGE_SIZE, page);
      totalPagesToFetch = Math.max(totalPagesToFetch, nextTotalPages);

      if (rows.length < DOWNLOAD_PAGE_SIZE && page >= nextTotalPages) {
        break;
      }

      page += 1;
    }

    return allRows;
  };

  const handleDownloadAll = async () => {
    // Immediately update dataset type for instant UI feedback
    onDatasetChange && onDatasetChange('all');
    try {
      const rows = await fetchRows('getAllJobs');
      onApplyDataset && onApplyDataset('all', rows);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadHidden = async () => {
    // Immediately update dataset type for instant UI feedback
    onDatasetChange && onDatasetChange('hidden');
    try {
      const rows = await fetchRows('hiddenJobs');
      onApplyDataset && onApplyDataset('hidden', rows);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadJunior = async () => {
    // Immediately update dataset type for instant UI feedback
    onDatasetChange && onDatasetChange('junior');
    try {
      const rows = await fetchRows('juniorJobs');
      onApplyDataset && onApplyDataset('junior', rows);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadCurrent = async () => {
    setIsDownloading(true);
    try {
      // If we're on the Saved Jobs (tracker) tab, download saved jobs only
      if (activeTab === 'tracker') {
        const rows = await fetchAllRowsForDownload('getSavedJobs');
        // Saved jobs endpoint returns saved-job records which contain the actual job
        // under `job` or `dataValues`. Map to the inner job object so CSV builder
        // can read expected fields like `posted_date`, `job_title`, etc.
        const jobRows = rows.map((r: any) => r?.job ?? r?.dataValues ?? r);
        const filename = 'saved_jobs.csv';
        const csv = jsonToCsv(jobRows);
        triggerDownload(csv, filename);
        return;
      }

      const dataset = currentDataset || 'all';
      const endpoint = dataset === 'all' ? 'getAllJobs' : dataset === 'hidden' ? 'hiddenJobs' : 'juniorJobs';
      const rows = await fetchAllRowsForDownload(endpoint);
      const filename = dataset === 'all' ? 'all_jobs.csv' : dataset === 'hidden' ? 'hidden_jobs.csv' : 'junior_jobs.csv';
      const csv = jsonToCsv(rows);
      triggerDownload(csv, filename);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-4">
      {/* Filter Row 1 - Dropdowns */}
      <div className="p-3 sm:p-4 border-b">
        <div className="">
          {/* <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Posted Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {pendingFilters.postedDate ? format(pendingFilters.postedDate, "dd-MM-yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={pendingFilters.postedDate}
                  onSelect={(date) => handlePendingFilterChange('postedDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div> */}
          {activeTab === 'tracker' ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div className='flex justify-start items-center gap-3'>
                  <div className="flex-1 w-48">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Posted Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pendingFilters.postedDate ? formatDateDisplayLocal(pendingFilters.postedDate) : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={pendingFilters.postedDate}
                          onSelect={(date) => handlePendingFilterChange('postedDate', date)}
                          initialFocus
                          disabled={(date) => date >= today}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex-1 w-48">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
                    <Select
                      value={(pendingFilters as any).status ? (pendingFilters as any).status : '_all'}
                      onValueChange={(val) => {
                        const out = val === '_all' ? '' : val;
                        handlePendingFilterChange('status' as keyof JobFilters, out);
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs w-full">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_all">All statuses</SelectItem>
                        <SelectItem value="Yet to Apply">Yet to Apply</SelectItem>
                        <SelectItem value="First Contact">First Contact</SelectItem>
                        <SelectItem value="Applied">Applied</SelectItem>
                        <SelectItem value="Interview">Interview</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-end gap-2">
                  <Button
                    onClick={handleApplyFilters}
                    disabled={!hasPendingChanges}
                    className="bg-datacareer-darkBlue text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed h-9"
                  >
                    Apply Filters
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDownloadCurrent}
                    disabled={isDownloading}
                    className="flex items-center text-white gap-2 bg-[#7692ff] hover:bg-datacareer-darkBlue whitespace-nowrap text-xs sm:text-sm hover:text-white h-9 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Downloading...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download (CSV)
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            // <></>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Posted Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {pendingFilters.postedDate ? formatDateDisplayLocal(pendingFilters.postedDate) : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={pendingFilters.postedDate}
                      onSelect={(date) => handlePendingFilterChange('postedDate', date)}
                      initialFocus
                      disabled={(date) => date >= today}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Role Category
                </label>
                <Popover open={openPopovers.roleCategory} onOpenChange={(isOpen) => togglePopover('roleCategory', isOpen)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-left font-normal"
                    >
                      <span>
                        {pendingFilters.roleCategory.length === 0
                          ? "All roles"
                          : pendingFilters.roleCategory.length === 1
                            ? pendingFilters.roleCategory[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                            : `${pendingFilters.roleCategory.length} roles selected`
                        }
                      </span>
                      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${openPopovers.roleCategory ? 'rotate-180' : ''}`} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-3" style={dropdownContentStyle}>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="data-analyst"
                          checked={pendingFilters.roleCategory.includes('data-analyst')}
                          onCheckedChange={(checked) => handleMultiSelectChange('roleCategory', 'data-analyst', checked as boolean)}
                        />
                        <label htmlFor="data-analyst" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Data Analyst
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="data-engineer"
                          checked={pendingFilters.roleCategory.includes('data-engineer')}
                          onCheckedChange={(checked) => handleMultiSelectChange('roleCategory', 'data-engineer', checked as boolean)}
                        />
                        <label htmlFor="data-engineer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Data Engineer
                        </label>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Location (State)
                </label>
                <Popover open={openPopovers.locationState} onOpenChange={(isOpen) => togglePopover('locationState', isOpen)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-left font-normal"
                    >
                      <span>
                        {pendingFilters.locationState.length === 0
                          ? "All locations"
                          : pendingFilters.locationState.length === 1
                            ? getStateFullName(pendingFilters.locationState[0])
                            : `${pendingFilters.locationState.length} locations selected`
                        }
                      </span>
                      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${openPopovers.locationState ? 'rotate-180' : ''}`} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-3" style={dropdownContentStyle}>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="nsw"
                          checked={pendingFilters.locationState.includes('nsw')}
                          onCheckedChange={(checked) => handleMultiSelectChange('locationState', 'nsw', checked as boolean)}
                        />
                        <label htmlFor="nsw" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          New South Wales
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="vic"
                          checked={pendingFilters.locationState.includes('vic')}
                          onCheckedChange={(checked) => handleMultiSelectChange('locationState', 'vic', checked as boolean)}
                        />
                        <label htmlFor="vic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Victoria
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="qld"
                          checked={pendingFilters.locationState.includes('qld')}
                          onCheckedChange={(checked) => handleMultiSelectChange('locationState', 'qld', checked as boolean)}
                        />
                        <label htmlFor="qld" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Queensland
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="wa"
                          checked={pendingFilters.locationState.includes('wa')}
                          onCheckedChange={(checked) => handleMultiSelectChange('locationState', 'wa', checked as boolean)}
                        />
                        <label htmlFor="wa" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Western Australia
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sa"
                          checked={pendingFilters.locationState.includes('sa')}
                          onCheckedChange={(checked) => handleMultiSelectChange('locationState', 'sa', checked as boolean)}
                        />
                        <label htmlFor="sa" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          South Australia
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="tas"
                          checked={pendingFilters.locationState.includes('tas')}
                          onCheckedChange={(checked) => handleMultiSelectChange('locationState', 'tas', checked as boolean)}
                        />
                        <label htmlFor="tas" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Tasmania
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="act"
                          checked={pendingFilters.locationState.includes('act')}
                          onCheckedChange={(checked) => handleMultiSelectChange('locationState', 'act', checked as boolean)}
                        />
                        <label htmlFor="act" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          ACT
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="nt"
                          checked={pendingFilters.locationState.includes('nt')}
                          onCheckedChange={(checked) => handleMultiSelectChange('locationState', 'nt', checked as boolean)}
                        />
                        <label htmlFor="nt" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Northern Territory
                        </label>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <Popover open={openPopovers.experienceLevel} onOpenChange={(isOpen) => togglePopover('experienceLevel', isOpen)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-left font-normal"
                    >
                      <span>
                        {pendingFilters.experienceLevel.length === 0
                          ? "All experience levels"
                          : pendingFilters.experienceLevel.length === 1
                            ? pendingFilters.experienceLevel[0].replace(/\b\w/g, l => l.toUpperCase()).replace('-', ' ')
                            : `${pendingFilters.experienceLevel.length} levels selected`
                        }
                      </span>
                      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${openPopovers.experienceLevel ? 'rotate-180' : ''}`} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-3" style={dropdownContentStyle}>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="entry"
                          checked={pendingFilters.experienceLevel.includes('entry')}
                          onCheckedChange={(checked) => handleMultiSelectChange('experienceLevel', 'entry', checked as boolean)}
                        />
                        <label htmlFor="entry" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Entry Level
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="associate"
                          checked={pendingFilters.experienceLevel.includes('associate')}
                          onCheckedChange={(checked) => handleMultiSelectChange('experienceLevel', 'associate', checked as boolean)}
                        />
                        <label htmlFor="associate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Associate
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="senior"
                          checked={pendingFilters.experienceLevel.includes('senior')}
                          onCheckedChange={(checked) => handleMultiSelectChange('experienceLevel', 'senior', checked as boolean)}
                        />
                        <label htmlFor="senior" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Senior
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="very-senior"
                          checked={pendingFilters.experienceLevel.includes('very-senior')}
                          onCheckedChange={(checked) => handleMultiSelectChange('experienceLevel', 'very-senior', checked as boolean)}
                        />
                        <label htmlFor="very-senior" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Very Senior
                        </label>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Location Type
                </label>
                <Popover open={openPopovers.locationType} onOpenChange={(isOpen) => togglePopover('locationType', isOpen)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-left font-normal"
                    >
                      <span>
                        {pendingFilters.locationType.length === 0
                          ? "All location types"
                          : pendingFilters.locationType.length === 1
                            ? pendingFilters.locationType[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                            : `${pendingFilters.locationType.length} types selected`
                        }
                      </span>
                      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${openPopovers.locationType ? 'rotate-180' : ''}`} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-3" style={dropdownContentStyle}>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="major-cities"
                          checked={pendingFilters.locationType.includes('major-cities')}
                          onCheckedChange={(checked) => handleMultiSelectChange('locationType', 'major-cities', checked as boolean)}
                        />
                        <label htmlFor="major-cities" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Major Cities
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="regional"
                          checked={pendingFilters.locationType.includes('regional')}
                          onCheckedChange={(checked) => handleMultiSelectChange('locationType', 'regional', checked as boolean)}
                        />
                        <label htmlFor="regional" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Regional / Remote
                        </label>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Row 2 - Text Inputs and Apply Button */}
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {activeTab !== 'tracker' && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Tech Skills
                </label>
                <Input
                  type="text"
                  placeholder="Type a skill e.g. SQL, Tableau"
                  value={pendingFilters.techSkills}
                  onChange={(e) => handlePendingFilterChange('techSkills', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Function
                </label>
                <Input
                  type="text"
                  placeholder="Type a function e.g. Marketing"
                  value={pendingFilters.function}
                  onChange={(e) => handlePendingFilterChange('function', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <Input
                  type="text"
                  placeholder="Type a industry e.g. Banking"
                  value={pendingFilters.industry}
                  onChange={(e) => handlePendingFilterChange('industry', e.target.value)}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>

        {/* Apply Button - only show here for database view; tracker shows inline */}
        {activeTab !== 'tracker' && (
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleApplyFilters}
              disabled={!hasPendingChanges}
              className="bg-datacareer-darkBlue text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Filters
            </Button>
          </div>
        )}


        {/* Download and Saved Filters Buttons */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Download Buttons - only show dataset choices in Database view */}
            {activeTab !== 'tracker' && (
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <Button
                  variant="outline"
                  className={`flex items-center gap-2 text-xs sm:text-sm ${currentDataset === 'all'
                    ? 'bg-datacareer-darkBlue text-white border-datacareer-darkBlue hover:opacity-90'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  onClick={handleDownloadAll}
                >
                  <span className="hidden sm:inline">All Jobs</span>
                  <span className="sm:hidden">All Jobs</span>
                </Button>
                <Button
                  variant="outline"
                  className={`flex items-center gap-2 text-xs sm:text-sm ${currentDataset === 'hidden'
                    ? 'bg-datacareer-darkBlue text-white border-datacareer-darkBlue hover:opacity-90'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  onClick={handleDownloadHidden}
                >
                  <span className="hidden sm:inline">Hidden data jobs</span>
                  <span className="sm:hidden">Hidden Jobs</span>
                </Button>
                <Button
                  variant="outline"
                  className={`flex items-center gap-2 text-xs sm:text-sm ${currentDataset === 'junior'
                    ? 'bg-datacareer-darkBlue text-white border-datacareer-darkBlue hover:opacity-90'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  onClick={handleDownloadJunior}
                >
                  <span className="hidden sm:inline">Junior data jobs</span>
                  <span className="sm:hidden">Junior Jobs</span>
                </Button>
              </div>
            )}

            {/* Saved Filters Button - only show when NOT tracker (tracker has inline download) */}
            {activeTab !== 'tracker' && (
              <Button
                variant="outline"
                className="flex items-center text-white gap-2 bg-[#7692ff] hover:bg-datacareer-darkBlue whitespace-nowrap text-xs sm:text-sm hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleDownloadCurrent}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Downloading...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download (CSV)
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Active Filters:</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearPendingFilters}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 self-start sm:self-auto"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(filters).map(([key, value]) => {
                // Skip empty values: empty arrays, empty strings, or undefined/null
                if (Array.isArray(value) && value.length === 0) return null;
                if (value === '' || value === undefined || value === null) return null;

                // Format the value for display
                let displayValue: any = value;
                if (key === 'postedDate' && value instanceof Date) {
                  // Show the same local date the user selected (dd-MM-yyyy)
                  displayValue = format(value as Date, 'dd-MM-yyyy');
                } else if (key === 'locationState' && Array.isArray(value)) {
                  displayValue = value.map(state => getStateFullName(state)).join(', ');
                } else if (Array.isArray(value)) {
                  displayValue = value.join(', ');
                }

                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {getFilterLabel(key as keyof JobFilters)}: {displayValue}
                    <button
                      onClick={() => {
                        const clearedValue = key === 'postedDate' ? undefined : (Array.isArray(value) ? [] : '');
                        handlePendingFilterChange(key as keyof JobFilters, clearedValue);
                        // Also apply immediately when removing from active filters
                        const newFilters = { ...pendingFilters, [key]: clearedValue };
                        onFiltersChange(newFilters);
                      }}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobFilterBar;
