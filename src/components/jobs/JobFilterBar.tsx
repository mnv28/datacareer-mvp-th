import React from 'react';
import { apiInstance } from '@/api/axiosApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; 
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X, Download, Save, CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

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

interface JobFilterBarProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onClearFilters: () => void;
  onApplyDataset?: (type: 'all' | 'hidden' | 'junior', rows: any[]) => void;
  currentDataset?: 'all' | 'hidden' | 'junior';
}

const JobFilterBar: React.FC<JobFilterBarProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onApplyDataset,
  currentDataset
}) => {
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

  const handleFilterChange = (key: keyof JobFilters, value: string | Date | undefined | string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleMultiSelectChange = (key: 'roleCategory' | 'locationState' | 'experienceLevel' | 'locationType', value: string, checked: boolean) => {
    const currentValues = filters[key] || [];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    handleFilterChange(key, newValues);
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

  const buildQueryParams = (currentFilters: JobFilters) => {
    // Support multi-select: join with commas
    const joinOrUndefined = (arr?: string[], mapper?: (v: string) => string) => {
      if (!arr || arr.length === 0) return undefined;
      const mapped = mapper ? arr.map(mapper) : arr;
      return mapped.join(',');
    };
    const qp: Record<string, string> = {};

    // Defaults (align with pagination: 10 per page)
    qp.limit = '10';
    qp.page = '1';
    qp.search = 'null';

    if (currentFilters.postedDate) {
      try {
        qp.posted_date = format(currentFilters.postedDate, 'yyyy-MM-dd');
      } catch {}
    }
    const roleJoined = joinOrUndefined(currentFilters.roleCategory, v => toTitleCase(v.replace('-', ' ')) as string);
    if (roleJoined) qp.role_cat = roleJoined;

    const statesJoined = joinOrUndefined(currentFilters.locationState, c => mapStateCodeToName(c) as string);
    if (statesJoined) qp.state = statesJoined;

    const expJoined = joinOrUndefined(currentFilters.experienceLevel, v => toTitleCase(v.replace('-', ' ')) as string);
    if (expJoined) qp.exp_level = expJoined;

    const locTypeJoined = joinOrUndefined(currentFilters.locationType, v => mapLocationType(v) as string);
    if (locTypeJoined) qp.location_type = locTypeJoined;

    if (currentFilters.function) qp.function = currentFilters.function;
    if (currentFilters.techSkills) qp.top_tech_skills = currentFilters.techSkills;
    if (currentFilters.industry) qp.industry = currentFilters.industry;

    return qp;
  };

  const toQueryString = (qp: Record<string, string>) =>
    Object.entries(qp)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

  const jsonToCsv = (rows: any[]) => {
    if (!rows || rows.length === 0) return '';
    const headers = [
      'posted_date','job_title','company_name','city','state','location','top_tech_skills','function','industry','role_cat','exp_level','sec_clearance','pr_citizenship_req','url','location_type'
    ];
    const escape = (val: any) => {
      if (val === undefined || val === null) return '';
      const str = String(val).replace(/\r?\n|\r/g, ' ');
      if (str.includes(',') || str.includes('"')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    const lines = [headers.join(',')];
    for (const r of rows) {
      const posted = r.posted_date && typeof r.posted_date === 'object' ? r.posted_date.value : r.posted_date;
      const line = [
        posted,
        r.job_title,
        r.company_name,
        r.city,
        r.state,
        r.location,
        r.top_tech_skills,
        r.function,
        r.industry,
        r.role_cat,
        r.exp_level,
        r.sec_clearance,
        r.pr_citizenship_req,
        r.url,
        r.location_type,
      ].map(escape).join(',');
      lines.push(line);
    }
    return lines.join('\n');
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
    const qp = buildQueryParams(filters);
    const qs = toQueryString(qp);
    const url = `/api/jobs/${endpoint}?${qs}`;
    console.log('Fetching jobs with filters ->', qp, 'URL:', url);
    const resp = await apiInstance.get(url);
    const rows = Array.isArray(resp?.data?.data) ? resp.data.data : [];
    return rows;
  };

  const handleDownloadAll = async () => {
    try {
      const rows = await fetchRows('getAllJobs');
      onApplyDataset && onApplyDataset('all', rows);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadHidden = async () => {
    try {
      const rows = await fetchRows('hiddenJobs');
      onApplyDataset && onApplyDataset('hidden', rows);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadJunior = async () => {
    try {
      const rows = await fetchRows('juniorJobs');
      onApplyDataset && onApplyDataset('junior', rows);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadCurrent = async () => {
    try {
      const dataset = currentDataset || 'all';
      const endpoint = dataset === 'all' ? 'getAllJobs' : dataset === 'hidden' ? 'hiddenJobs' : 'juniorJobs';
      const rows = await fetchRows(endpoint);
      const filename = dataset === 'all' ? 'all_jobs.csv' : dataset === 'hidden' ? 'hidden_jobs.csv' : 'junior_jobs.csv';
      const csv = jsonToCsv(rows);
      triggerDownload(csv, filename);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-4">
      {/* Filter Row 1 - Dropdowns */}
      <div className="p-3 sm:p-4 border-b">
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
                  {filters.postedDate ? format(filters.postedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.postedDate}
                  onSelect={(date) => handleFilterChange('postedDate', date)}
                  initialFocus
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
                    {filters.roleCategory.length === 0 
                      ? "Select roles" 
                      : filters.roleCategory.length === 1 
                        ? filters.roleCategory[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                        : `${filters.roleCategory.length} roles selected`
                    }
                  </span>
                  <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${openPopovers.roleCategory ? 'rotate-180' : ''}`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="data-analyst"
                      checked={filters.roleCategory.includes('data-analyst')}
                      onCheckedChange={(checked) => handleMultiSelectChange('roleCategory', 'data-analyst', checked as boolean)}
                    />
                    <label htmlFor="data-analyst" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Data Analyst
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="data-engineer"
                      checked={filters.roleCategory.includes('data-engineer')}
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
                    {filters.locationState.length === 0 
                      ? "Select locations" 
                      : filters.locationState.length === 1 
                        ? getStateFullName(filters.locationState[0])
                        : `${filters.locationState.length} locations selected`
                    }
                  </span>
                  <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${openPopovers.locationState ? 'rotate-180' : ''}`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="nsw"
                      checked={filters.locationState.includes('nsw')}
                      onCheckedChange={(checked) => handleMultiSelectChange('locationState', 'nsw', checked as boolean)}
                    />
                    <label htmlFor="nsw" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      New South Wales
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vic"
                      checked={filters.locationState.includes('vic')}
                      onCheckedChange={(checked) => handleMultiSelectChange('locationState', 'vic', checked as boolean)}
                    />
                    <label htmlFor="vic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Victoria
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="qld"
                      checked={filters.locationState.includes('qld')}
                      onCheckedChange={(checked) => handleMultiSelectChange('locationState', 'qld', checked as boolean)}
                    />
                    <label htmlFor="qld" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Queensland
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="wa"
                      checked={filters.locationState.includes('wa')}
                      onCheckedChange={(checked) => handleMultiSelectChange('locationState', 'wa', checked as boolean)}
                    />
                    <label htmlFor="wa" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Western Australia
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sa"
                      checked={filters.locationState.includes('sa')}
                      onCheckedChange={(checked) => handleMultiSelectChange('locationState', 'sa', checked as boolean)}
                    />
                    <label htmlFor="sa" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      South Australia
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tas"
                      checked={filters.locationState.includes('tas')}
                      onCheckedChange={(checked) => handleMultiSelectChange('locationState', 'tas', checked as boolean)}
                    />
                    <label htmlFor="tas" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Tasmania
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="act"
                      checked={filters.locationState.includes('act')}
                      onCheckedChange={(checked) => handleMultiSelectChange('locationState', 'act', checked as boolean)}
                    />
                    <label htmlFor="act" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      ACT
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="nt"
                      checked={filters.locationState.includes('nt')}
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
                    {filters.experienceLevel.length === 0 
                      ? "Select experience levels" 
                      : filters.experienceLevel.length === 1 
                        ? filters.experienceLevel[0].replace(/\b\w/g, l => l.toUpperCase()).replace('-', ' ')
                        : `${filters.experienceLevel.length} levels selected`
                    }
                  </span>
                  <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${openPopovers.experienceLevel ? 'rotate-180' : ''}`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="entry"
                      checked={filters.experienceLevel.includes('entry')}
                      onCheckedChange={(checked) => handleMultiSelectChange('experienceLevel', 'entry', checked as boolean)}
                    />
                    <label htmlFor="entry" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Entry Level
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="associate"
                      checked={filters.experienceLevel.includes('associate')}
                      onCheckedChange={(checked) => handleMultiSelectChange('experienceLevel', 'associate', checked as boolean)}
                    />
                    <label htmlFor="associate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Associate
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="senior"
                      checked={filters.experienceLevel.includes('senior')}
                      onCheckedChange={(checked) => handleMultiSelectChange('experienceLevel', 'senior', checked as boolean)}
                    />
                    <label htmlFor="senior" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Senior
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="very-senior"
                      checked={filters.experienceLevel.includes('very-senior')}
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
                    {filters.locationType.length === 0 
                      ? "Select location types" 
                      : filters.locationType.length === 1 
                        ? filters.locationType[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                        : `${filters.locationType.length} types selected`
                    }
                  </span>
                  <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${openPopovers.locationType ? 'rotate-180' : ''}`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="major-cities"
                      checked={filters.locationType.includes('major-cities')}
                      onCheckedChange={(checked) => handleMultiSelectChange('locationType', 'major-cities', checked as boolean)}
                    />
                    <label htmlFor="major-cities" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Major Cities
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="regional"
                      checked={filters.locationType.includes('regional')}
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
      </div>

      {/* Filter Row 2 - Text Inputs and Apply Button */}
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Function
            </label>
            <Input
              type="text"
              placeholder="Type a function e.g. Marketing"
              value={filters.function}
              onChange={(e) => handleFilterChange('function', e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Tech Skills
            </label>
            <Input
              type="text"
              placeholder="Type a skill e.g. SQL, Tableau"
              value={filters.techSkills}
              onChange={(e) => handleFilterChange('techSkills', e.target.value)}
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
              value={filters.industry}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
              className="w-full"
            />
          </div>
        </div>


        {/* Download and Saved Filters Buttons */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm"
                onClick={handleDownloadAll}
              >
                <span className="hidden sm:inline">All Jobs (CSV)</span>
                <span className="sm:hidden">All Jobs</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm"
                onClick={handleDownloadHidden}
              >
                <span className="hidden sm:inline">Hidden data jobs (CSV)</span>
                <span className="sm:hidden">Hidden Jobs</span>
              </Button> 
              <Button
                variant="outline"
                className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm"
                onClick={handleDownloadJunior}
              >
                <span className="hidden sm:inline">Junior data jobs (CSV)</span>
                <span className="sm:hidden">Junior Jobs</span>
              </Button> 
            </div>
            
            {/* Saved Filters Button */}
            <Button
              variant="outline"
              className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50 whitespace-nowrap text-xs sm:text-sm"
              onClick={handleDownloadCurrent}
            >
              Download 
            </Button>
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
                onClick={onClearFilters}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 self-start sm:self-auto"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(filters).map(([key, value]) => {
                if (value) {
                  // Format the value for display
                  let displayValue = value;
                  if (key === 'postedDate' && value instanceof Date) {
                    displayValue = format(value, 'yyyy-MM-dd');
                  } else if (key === 'locationState' && Array.isArray(value) && value.length > 0) {
                    displayValue = value.map(state => getStateFullName(state)).join(', ');
                  } else if (Array.isArray(value) && value.length > 0) {
                    displayValue = value.join(', ');
                  }
                  
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {key}: {displayValue}
                      <button
                        onClick={() => handleFilterChange(key as keyof JobFilters, key === 'postedDate' ? undefined : '')}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobFilterBar;
