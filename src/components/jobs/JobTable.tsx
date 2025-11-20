import React, { useEffect, useState } from 'react';
import { apiInstance } from '@/api/axiosApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import saveIcon from '../../assets/save.svg';
import savedIcon from '../../assets/saved.svg';
import shareIcon from '../../assets/share.svg';
import industryIcon from '../../assets/industry.svg';
import { format, formatDistanceToNow } from "date-fns";

interface Job {
  id: number; // local row id
  apiId?: string; // backend job id
  postedDate: string;
  url?: string;
  company: {
    title: string;
    name: string;
    location: string;
  };
  topTechSkill: string;
  function: string;
  industry: string;
  otherDetails: string[];
  status?: string; // optional server status for tracker,
}

interface JobTableProps {
  jobs: Job[];
  savedJobs: Set<number>;
  onSaveJob: (jobId: number, apiId: string, isSaved: boolean) => void;
  activeTab: 'database' | 'tracker';
}

const JobTable: React.FC<JobTableProps> = ({ jobs, savedJobs, onSaveJob, activeTab }) => {
  const [jobStatuses, setJobStatuses] = useState<{ [key: number]: string }>({});
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    mode: 'status' | 'save' | null;
    job: Job | null;
    newUiStatus: string | null;
    saveResponse?: { message: string; action: string; isSaved: boolean } | null;
  }>({ open: false, mode: null, job: null, newUiStatus: null, saveResponse: null });

  const apiStatusToUi = (s?: string) => {
    if (!s) return undefined;
    const trimmed = s.trim().toLowerCase();
    if (trimmed === 'yet to apply') return 'yet-to-apply';
    if (trimmed === 'first contact') return 'first-contact';
    if (trimmed === 'applied') return 'applied';
    if (trimmed === 'interview') return 'interview';
    if (trimmed === 'rejected') return 'rejected';
    return 'other';
  };

  const uiStatusToApi = (s: string) => {
    const map: Record<string, string> = {
      'yet-to-apply': 'Yet to Apply',
      'first-contact': 'First Contact',
      'applied': 'Applied',
      'interview': 'Interview',
      'rejected': 'Rejected',
      'other': 'Other',
    };
    return map[s] || 'Other';
  };

  // Initialize statuses from props (e.g., Saved Jobs tab)
  useEffect(() => {
    const initial: { [key: number]: string } = {};
    jobs.forEach(j => {
      const ui = apiStatusToUi(j.status);
      if (ui) initial[j.id] = ui;
    });
    if (Object.keys(initial).length > 0) setJobStatuses(initial);
  }, [jobs]);

  const handleStatusChange = (jobId: number, status: string) => {
    setJobStatuses(prev => ({
      ...prev,
      [jobId]: status
    }));
  };

  const saveJobToServer = async (apiId?: string, isCurrentlySaved: boolean = false) => {
    if (!apiId) return null;
    try {
      const response = await apiInstance.post('/api/jobs/saveJob', {
        job_id: apiId,
        status: 'Yet to Apply',
      });
      return response?.data || null;
    } catch (e) {
      console.error('Failed to save job', e);
      return null;
    }
  };

  const updateJobStatusOnServer = async (apiId?: string, status?: string) => {
    if (!apiId || !status) return;
    try {
      await apiInstance.post('/api/jobs/updateJobStatus', {
        job_id: apiId,
        status: uiStatusToApi(status),
      });
    } catch (e) {
      console.error('Failed to update job status', e);
    }
  };

  const confirmAndUpdateStatus = (job: Job, newUiStatus: string) => {
    // Open center modal; selection not applied until confirmed
    setConfirmModal({ open: true, mode: 'status', job, newUiStatus, saveResponse: null });
  };

  const handleSaveClick = (job: Job) => {
    const isCurrentlySaved = savedJobs.has(job.id);
    setConfirmModal({
      open: true,
      mode: 'save',
      job,
      newUiStatus: null,
      saveResponse: null
    });
  };

  const performConfirm = async () => {
    if (!confirmModal.open || !confirmModal.job) return;
    const job = confirmModal.job;
    if (confirmModal.mode === 'status' && confirmModal.newUiStatus) {
      const newUiStatus = confirmModal.newUiStatus;
      handleStatusChange(job.id, newUiStatus);
      updateJobStatusOnServer(job.apiId, newUiStatus);
      setConfirmModal({ open: false, mode: null, job: null, newUiStatus: null, saveResponse: null });
    } else if (confirmModal.mode === 'save') {
      const isCurrentlySaved = savedJobs.has(job.id);
      const response = await saveJobToServer(job.apiId, isCurrentlySaved);

      // Update parent with API response (add or remove based on isSaved)
      if (response && job.apiId) {
        await onSaveJob(job.id, job.apiId, response.isSaved);
      }

      // Show success message in modal
      if (response) {
        setConfirmModal({
          open: true,
          mode: 'save',
          job,
          newUiStatus: null,
          saveResponse: response
        });

        // Auto-close after 2 seconds
        setTimeout(() => {
          setConfirmModal({ open: false, mode: null, job: null, newUiStatus: null, saveResponse: null });
        }, 2000);
      } else {
        setConfirmModal({ open: false, mode: null, job: null, newUiStatus: null, saveResponse: null });
      }
    }
  };

  const closeConfirm = () => {
    setConfirmModal({ open: false, mode: null, job: null, newUiStatus: null, saveResponse: null });
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
      // return 'bg-green-100 text-green-800 border-green-200';
      return 'bg-[#d4edbc] text-[#1e300d] border-[#d4edbc]';
    }
    if (lowerDetail.includes('associate')) {
      return 'bg-[#bfe1f6] text-[#082436] border-[#bfe1f6]';
      // return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (lowerDetail.includes('senior')) {
      return 'bg-[#ffc8aa] text-[#662400] border-[#ffc8aa]';

      // return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    if (lowerDetail.includes('clearance')) {
      return 'bg-[#ffe5a0] text-[#3d2d00] border-[#ffe5a0]';

      // return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (lowerDetail.includes('remote')) {
      return 'bg-[#e6cff2] text-[#240d30] border-[#e6cff2]';

      // return 'bg-purple-100 text-purple-800 border-purple-200';
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
      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeConfirm} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {confirmModal.mode === 'save'
                ? (confirmModal.saveResponse
                  ? (confirmModal.saveResponse.isSaved ? 'Job Saved!' : 'Job Removed')
                  : 'Save this job?')
                : 'Confirm status change'}
            </h3>
            {confirmModal.mode === 'status' && (
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to change status to{' '}
                <span className="font-medium">{formatStatusName(confirmModal.newUiStatus || '')}</span>?
              </p>
            )}
            {confirmModal.mode === 'save' && !confirmModal.saveResponse && (
              <p className="text-sm text-gray-600 mb-4">
                {savedJobs.has(confirmModal.job?.id || 0)
                  ? 'This job will be removed from your Saved Jobs.'
                  : <>This job will be added to your Saved Jobs with status <span className="font-medium">Yet to Apply</span>.</>}
              </p>
            )}
            {confirmModal.mode === 'save' && confirmModal.saveResponse && (
              <p className={`text-sm mb-4 ${confirmModal.saveResponse.isSaved
                ? 'text-green-600'
                : 'text-gray-600'
                }`}>
                {confirmModal.saveResponse.message}
              </p>
            )}
            <div className="flex justify-end gap-2">
              {!confirmModal.saveResponse && (
                <button
                  className="px-3 py-1 rounded border text-sm hover:bg-gray-50"
                  onClick={closeConfirm}
                >
                  Cancel
                </button>
              )}
              {!confirmModal.saveResponse ? (
                <button
                  className="px-3 py-1 rounded bg-datacareer-darkBlue text-white text-sm hover:opacity-90"
                  onClick={performConfirm}
                >
                  Confirm
                </button>
              ) : (
                <button
                  className="px-3 py-1 rounded bg-datacareer-darkBlue text-white text-sm hover:opacity-90"
                  onClick={closeConfirm}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Table Header */}
      <div className="bg-gray-50 border-b px-6 py-4">
        <div className="hidden lg:grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700">
          <div className="col-span-1">Posted date</div>
          <div className="col-span-2">Company</div>
          <div className="col-span-2">Top tech skill</div>
          <div className="col-span-2">Function</div>
          <div className="col-span-2">Industry</div>
          <div className={activeTab === 'tracker' ? 'col-span-2' : 'col-span-2'}>Other details</div>
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

                  {format(job.postedDate, "dd/MM/yyyy")}
                  {/* Time ago */}
                  <div className="text-gray-400">
                    ({formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })})
                  </div>
                </div>
              </div>

              {/* Company */}
              <div className="col-span-2">
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">
                    {job.company.title}
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-gray-600">
                    {/* Company Name with Icon */}
                    <div className="flex items-center gap-1">
                      <img src={industryIcon} alt="Industry" className="h-4 w-4" />
                      {job.company.name}
                    </div>

                    {/* Location with Icon, same font/size */}
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {/* same size as company icon */}
                      <span>
                        {(() => {
                          const locStr = job?.company?.location;
                          if (!locStr) return "N/A";
                          try {
                            const parsed = JSON.parse(locStr.replace(/'/g, '"'));
                            return parsed.location || locStr;
                          } catch (err) {
                            return locStr;
                          }
                        })()}
                      </span>
                    </div>
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
              <div className="col-span-2">
                <div className="text-sm text-gray-700">
                  {job.function}
                </div>
              </div>

              {/* Industry */}
              <div className="col-span-2">
                <div className="text-sm text-gray-700">
                  {job.industry}
                </div>
              </div>

              {/* Other Details */}
              <div className={activeTab === 'tracker' ? 'col-span-2' : 'col-span-2'}>
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
                    onValueChange={(value) => confirmAndUpdateStatus(job, value)}
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
                  <div
                    className="cursor-pointer"
                    onClick={() => handleSaveClick(job)}
                  >
                    <img
                      src={savedJobs.has(job.id) ? savedIcon : saveIcon}
                      alt="Save"
                      className="h-5 w-5"
                    />
                  </div>
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      if (job.url) window.open(job.url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <img src={shareIcon} alt="Open Link" className="h-5 w-5 hover:opacity-70" />
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
                  <div className="flex flex-col gap-1 text-sm text-gray-600 mb-1">
                    <div className="flex items-center gap-1">
                      <img src={industryIcon} alt="Industry" className="h-4 w-4" />
                      {job.company.name}
                    </div>

                    {/* Location + Icon, same font/size */}
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {(() => {
                          const locStr = job?.company?.location;
                          if (!locStr) return "N/A";
                          try {
                            const parsed = JSON.parse(locStr.replace(/'/g, '"'));
                            return parsed.location || locStr;
                          } catch (err) {
                            return locStr;
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {format(job.postedDate, "dd/MM/yyyy")}
                  {/* Time ago */}
                  <span className="ml-2 text-gray-400">
                    ({formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })})
                  </span>
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
                    onValueChange={(value) => confirmAndUpdateStatus(job, value)}
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
                    onClick={() => handleSaveClick(job)}
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
                    onClick={() => {
                      if (job.url) window.open(job.url, '_blank', 'noopener,noreferrer');
                    }}
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
