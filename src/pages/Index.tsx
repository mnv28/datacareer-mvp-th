import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import FilterBar from '@/components/questions/FilterBar';
import QuestionList from '@/components/questions/QuestionList';
import ProgressSummary from '@/components/questions/ProgressSummary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { Company, Question } from "@/components/questions/QuestionList"; // Import types
import { apiInstance } from "@/api/axiosApi";
import { useAppSelector } from '@/redux/hooks';

// Post Job DB

// Define types based on the expected data structure after fetching and transformation
// interface Domain {
//   id: number;
//   name: string;
// }

// interface Topic {
//   id: number;
//   name: string;
// }

// interface Question {
//   id: number;
//   title: string;
//   type: string; // e.g., "SQL", "PostgreSQL"
//   difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
//   status: 'Solved' | 'Wrong' | 'Unattempted'; // Need to determine how to map API status to this
//   topic: string; // Assuming topic name here
//   isPaid: boolean; // Need to determine how to map API data to this
// }

// interface Company {
//   id: number;
//   name: string;
//   domains: string[]; // Array of domain names
//   questions: Question[];
// }
// export const mockCompanies = [
//   {
//     id: 1,
//     name: 'Amazon',
//     domains: ['E-Commerce', 'Cloud Computing', 'Retail Analytics', 'Customer Analytics'],
//     questions: [
//       {
//         id: 101,
//         title: 'Customer Order Analysis',
//         type: 'SQL' as const,
//         difficulty: 'Intermediate' as const,
//         status: 'Solved' as const,
//         topic: 'Data Analysis',
//         isPaid: false
//       },
//       {
//         id: 102,
//         title: 'Product Category Metrics',
//         type: 'PostgreSQL' as const,
//         difficulty: 'Advanced' as const,
//         status: 'Unattempted' as const,
//         topic: 'Window Functions',
//         isPaid: true
//       },
//       {
//         id: 103,
//         title: 'Delivery Time Optimization',
//         type: 'SQL' as const,
//         difficulty: 'Beginner' as const,
//         status: 'Wrong' as const,
//         topic: 'Joins',
//         isPaid: false
//       }
//     ]
//   },
//   {
//     id: 2,
//     name: 'Google',
//     domains: ['Technology', 'Search Analytics', 'Cloud Computing', 'AI/ML'],
//     questions: [
//       {
//         id: 201,
//         title: 'Search Query Analysis',
//         type: 'SQL' as const,
//         difficulty: 'Advanced' as const,
//         status: 'Unattempted' as const,
//         topic: 'Window Functions',
//         isPaid: true
//       },
//       {
//         id: 202,
//         title: 'User Session Analysis',
//         type: 'SQL' as const,
//         difficulty: 'Intermediate' as const,
//         status: 'Solved' as const,
//         topic: 'Data Analysis',
//         isPaid: false
//       }
//     ]
//   },
//   {
//     id: 3,
//     name: 'Microsoft',
//     domains: ['Technology', 'Cloud Computing', 'Enterprise Software', 'Gaming Analytics'],
//     questions: [
//       {
//         id: 301,
//         title: 'Azure Usage Metrics',
//         type: 'PostgreSQL' as const,
//         difficulty: 'Intermediate' as const,
//         status: 'Unattempted' as const,
//         topic: 'Data Analysis',
//         isPaid: false
//       },
//       {
//         id: 302,
//         title: 'Office License Tracking',
//         type: 'SQL' as const,
//         difficulty: 'Beginner' as const,
//         status: 'Solved' as const,
//         topic: 'Joins',
//         isPaid: true
//       },
//       {
//         id: 303,
//         title: 'Game Pass Subscriber Analysis',
//         type: 'SQL' as const,
//         difficulty: 'Beginner' as const,
//         status: 'Solved' as const,
//         topic: 'Data Manipulation',
//         isPaid: false
//       }
//     ]
//   },
//   {
//     id: 4,
//     name: 'Meta',
//     domains: ['Social Media', 'Digital Advertising', 'User Analytics', 'Content Moderation'],
//     questions: [
//       {
//         id: 401,
//         title: 'Friend Recommendation Algorithm',
//         type: 'SQL' as const,
//         difficulty: 'Advanced' as const,
//         status: 'Wrong' as const,
//         topic: 'Graph Analysis',
//         isPaid: true
//       },
//       {
//         id: 402,
//         title: 'User Engagement Metrics',
//         type: 'PostgreSQL' as const,
//         difficulty: 'Intermediate' as const,
//         status: 'Solved' as const,
//         topic: 'Data Analysis',
//         isPaid: false
//       },
//       {
//         id: 403,
//         title: 'Ad Campaign Performance',
//         type: 'SQL' as const,
//         difficulty: 'Intermediate' as const,
//         status: 'Unattempted' as const,
//         topic: 'Data Analysis',
//         isPaid: false
//       },
//       {
//         id: 404,
//         title: 'Content Moderation Efficiency',
//         type: 'SQL' as const,
//         difficulty: 'Beginner' as const,
//         status: 'Solved' as const,
//         topic: 'Data Manipulation',
//         isPaid: true
//       }
//     ]
//   }
// ];

function Index() {
  const [companies, setCompanies] = useState<Company[]>([]);

  const { user, trialDaysRemaining, trialStatus } = useAppSelector((state) => state.auth);

  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [errorCompanies, setErrorCompanies] = useState<string | null>(null);

  const [progressData, setProgressData] = useState({
    totalAttempted: 0,
    totalSolved: 0,
    overallProgress: 0,
    difficultyProgress: {
      beginner: { attempted: 0, solved: 0 },
      intermediate: { attempted: 0, solved: 0 },
      advanced: { attempted: 0, solved: 0 },
    },
    wrong: 0, // Add wrong to initial state
    unattempted: 0,
  });
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [errorProgress, setErrorProgress] = useState<string | null>(null);
  const [deviceTrialError, setDeviceTrialError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<number[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  const getTrialInfo = () => {
    const TRIAL_DAYS = 7;
    const msPerDay = 1000 * 60 * 60 * 24;

    // If device is blocked due to trial already used on this device, show full trial used.
    if (deviceTrialError) {
      return { used: TRIAL_DAYS, remaining: 0, total: TRIAL_DAYS };
    }

    // Prefer Redux remaining days if available
    if (typeof trialDaysRemaining === 'number') {
      const remaining = Math.max(0, Math.min(TRIAL_DAYS, trialDaysRemaining));
      const used = Math.max(0, Math.min(TRIAL_DAYS, TRIAL_DAYS - remaining));
      return { used, remaining, total: TRIAL_DAYS };
    }

    // Fallback: derive from user.trialStart
    const trialStartRaw = (user as any)?.trialStart;
    if (trialStartRaw) {
      const start = new Date(trialStartRaw);
      if (!Number.isNaN(start.getTime())) {
        const days = Math.floor((Date.now() - start.getTime()) / msPerDay);
        // day-1 based for UX: day 0 => 1 day used
        const used = Math.max(0, Math.min(TRIAL_DAYS, days + 1));
        const remaining = Math.max(0, TRIAL_DAYS - used);
        return { used, remaining, total: TRIAL_DAYS };
      }
    }

    // If backend marks trial already used but doesn't provide trialStart, assume trial consumed.
    if ((user as any)?.trialUsed === true) {
      return { used: TRIAL_DAYS, remaining: 0, total: TRIAL_DAYS };
    }

    return null;
  };

  // Fetch companies data
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiInstance.get('/api/question/filterbycompany', {
          params: {
            search: searchQuery.length >= 2 ? searchQuery : '',
            topic: selectedTopics.length > 0 ? selectedTopics.join(',') : '',
            companyId: selectedCompanies.length > 0 ? selectedCompanies.join(',') : '',
            domain: selectedDomains.length > 0 ? selectedDomains.join(',') : '',
            difficulty: selectedDifficulties.length > 0 ? selectedDifficulties.join(',') : '',
            variant: selectedVariants.length > 0 ? selectedVariants.join(',') : 'MySQL'
          }
        });

        const data = response.data;

        // Backend currently returns `isPaid` at top-level (user plan/access flag),
        // while `QuestionList` expects `question.isPaid` for the Paid/Free badge.
        const userIsPaidFlagRaw = (data as any)?.isPaid;
        const userIsPaidFlag =
          userIsPaidFlagRaw === true ||
          userIsPaidFlagRaw === 1 ||
          userIsPaidFlagRaw === '1' ||
          (typeof userIsPaidFlagRaw === 'string' && userIsPaidFlagRaw.trim().toLowerCase() === 'true');

        const transformedCompanies: Company[] = data.companies.map((company) => ({
          id: company.id,
          name: company.name,
          logo: company.logo,
          domains: company.Domains.map((domain) => ({
            id: domain.id,
            name: domain.name
          })),
          questions: company.questions
            .slice()
            .sort((a, b) => {
              const order = { Beginner: 0, Intermediate: 1, Advanced: 2 };
              const diffA = a.difficulty.charAt(0).toUpperCase() + a.difficulty.slice(1);
              const diffB = b.difficulty.charAt(0).toUpperCase() + b.difficulty.slice(1);
              return order[diffA] - order[diffB];
            })
            .map((question) => {
              let rawPaid =
                (question as any).isPaid ??
                (question as any).paid ??
                (question as any).is_paid;

              // Fallback: if API doesn't include per-question paid flag, use top-level `data.isPaid`
              // so UI doesn't incorrectly show "Free" for paid users.
              if (rawPaid === undefined || rawPaid === null) {
                rawPaid = userIsPaidFlag;
              }
              const isPaid =
                rawPaid === true ||
                rawPaid === 1 ||
                rawPaid === '1' ||
                rawPaid === 'true';

              return ({
              id: question.id,
              title: question.title,
              type: question.dbType,
              difficulty: (question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)) as 'Beginner' | 'Intermediate' | 'Advanced',
              status: 'mismatch' as 'Solved' | 'Wrong' | 'mismatch',
              topic: {
                id: question.Topic?.id || 0,
                name: question.Topic?.name || question.topic
              },
              isPaid
              });
            }),
        }));

        setCompanies(transformedCompanies);
        // If request succeeds, clear device restriction banner
        if (deviceTrialError) setDeviceTrialError(null);
      } catch (e: any) {
        if (e.response?.status === 403) {
          const backendMsg = (e.response.data?.message || '').toString();
          // Specific UX message for device-based trial restriction
          if (backendMsg.toLowerCase().includes('used on this device')) {
            setDeviceTrialError(
              'Your free trial has already been used on this device.\nTo continue accessing all features, please upgrade using the option in the sidebar.'
            );
            setErrorCompanies(null);
          } else {
            setErrorCompanies(backendMsg || 'Access denied.');
          }
        } else {
          setErrorCompanies('Failed to load questions.');
        }
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [searchQuery, selectedCompanies, selectedTopics, selectedDomains, selectedDifficulties, selectedVariants]);

  // Fetch user progress data
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await apiInstance.get('/api/question/getUserProgress');
        setProgressData(response.data.progress);
        if (deviceTrialError) setDeviceTrialError(null);
      } catch (e: any) {
        if (e.response?.status === 403) {
          const backendMsg = (e.response.data?.message || '').toString();
          if (backendMsg.toLowerCase().includes('used on this device')) {
            setDeviceTrialError(
              'Your free trial has already been used on this device.\nTo continue accessing all features, please upgrade using the option in the sidebar.'
            );
            setErrorProgress(null);
          } else {
            setErrorProgress(backendMsg || 'Access denied.');
          }
        } else {
          setErrorProgress('Failed to load progress.');
        }
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchProgress();
  }, []);

  // Apply filters
  const filteredCompanies = companies
    .map(company => {
      // Filter questions based on all filter criteria
      const filteredQuestions = company.questions.filter(question => {
        const matchesSearch =
          searchQuery === '' ||
          question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCompany =
          selectedCompanies.length === 0 ||
          selectedCompanies.includes(company.id);

        const matchesTopic =
          selectedTopics.length === 0 ||
          selectedTopics.map(String).includes(String(question.topic.id)) ||
          selectedTopics.map(String).includes(String(question.topic.name));

        const matchesDomain =
          selectedDomains.length === 0 ||
          company.domains.some(domain => selectedDomains.includes(domain.id));

        // Temporarily disable difficulty filtering to see if companies are displayed
        const matchesDifficulty = true;

        // Temporarily disable variant filtering to see if companies are displayed
        const matchesVariant =
          selectedVariants.length === 0 ||
          selectedVariants.map(v => v.toLowerCase()).includes(question.type.toLowerCase());

        return matchesSearch && matchesCompany && matchesTopic &&
          matchesDomain && matchesDifficulty && matchesVariant;
      });

      // Return the company with filtered questions
      return {
        ...company,
        questions: filteredQuestions
      };
    })
    // Only include companies that have questions after filtering
    .filter(company => company.questions.length > 0);

  // Calculate total counts from the companies data (needed for ProgressSummary)
  const totalCounts = {
    total: companies.reduce((sum, company) => sum + company.questions.length, 0),
    beginner: companies.reduce((sum, company) => sum + company.questions.filter(q => q.difficulty === 'Beginner').length, 0),
    intermediate: companies.reduce((sum, company) => sum + company.questions.filter(q => q.difficulty === 'Intermediate').length, 0),
    advanced: companies.reduce((sum, company) => sum + company.questions.filter(q => q.difficulty === 'Advanced').length, 0),
  };

  // Combine API progress data with calculated total counts for ProgressSummary
  const progressSummaryProps = {
    total: totalCounts.total,
    solved: progressData.totalSolved,
    beginner: totalCounts.beginner,
    intermediate: totalCounts.intermediate,
    advanced: totalCounts.advanced,
    beginnerSolved: progressData.difficultyProgress.beginner.solved,
    intermediateSolved: progressData.difficultyProgress.intermediate.solved,
    advancedSolved: progressData.difficultyProgress.advanced.solved,
    wrong: progressData.wrong, // Use backend value
    unattempted: progressData.unattempted,
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedCompanies([]);
    setSelectedTopics([]);
    setSelectedDomains([]);
    setSelectedDifficulties([]);
    setSelectedVariants([]);
  };
  
const handleApplyFilters = (filters) => {
  setSearchQuery(filters.searchQuery);
  setSelectedCompanies(filters.selectedCompanies);
  setSelectedTopics(filters.selectedTopics);
  setSelectedDomains(filters.selectedDomains);
  setSelectedDifficulties(filters.selectedDifficulties);
  setSelectedVariants(filters.selectedVariants);
};

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-2 justify-between items-center sm:flex-row">
          <div>
          <h1 className="text-2xl font-bold text-datacareer-darkBlue mb-2">SQL Interview Questions</h1>
            <p className="text-gray-600">
              Practice SQL interview questions from top tech companies
            </p>
          </div>

        {!deviceTrialError && trialStatus === 'trial-active' && (() => {
          const info = getTrialInfo();
          if (!info) return null;
          return (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-blue-900 font-medium">
                  Trial Active
                </p>
                <p className="text-sm text-blue-800">
                  Remaining: <span className="font-semibold">{info.remaining}</span> days
                  {' '}• Used: <span className="font-semibold">{info.used}/{info.total}</span> days
                </p>
              </div>
            </div>
          );
        })()}
        </div>


        {deviceTrialError && (
          <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
            <p className="text-yellow-800 font-medium whitespace-pre-line">
              {deviceTrialError}
            </p>
            {(() => {
              const info = getTrialInfo();
              if (!info) return null;
              return (
                <p className="mt-2 text-sm text-yellow-700">
                  Trial used: <span className="font-semibold">{info.used}/{info.total}</span> days
                  {' '}• Remaining: <span className="font-semibold">{info.remaining}</span> days
                </p>
              );
            })()}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCompanies={selectedCompanies}
              setSelectedCompanies={setSelectedCompanies}
              selectedTopics={selectedTopics}
              setSelectedTopics={setSelectedTopics}
              selectedDomains={selectedDomains}
              setSelectedDomains={setSelectedDomains}
              selectedDifficulties={selectedDifficulties}
              setSelectedDifficulties={setSelectedDifficulties}
              selectedVariants={selectedVariants}
              setSelectedVariants={setSelectedVariants}
              onClearAll={handleClearAll}
              onApply={handleApplyFilters}
            />

            {loadingCompanies && <p>Loading companies...</p>}
            {!deviceTrialError && errorCompanies && (
              <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
                <p className="text-yellow-800 font-medium whitespace-pre-line">
                  {errorCompanies}
                </p>
              </div>
            )}
            {!deviceTrialError && !loadingCompanies && !errorCompanies && (filteredCompanies.length > 0 ? (
              <QuestionList companies={filteredCompanies} />
            ) : (
              <p>No companies found matching your criteria.</p>
            ))}
          </div>

          <div className="lg:col-span-1">
            {loadingProgress && <p>Loading progress...</p>}
            {!deviceTrialError && errorProgress && <p className="text-red-500">Error loading progress: {errorProgress}</p>}
            {!deviceTrialError && !loadingProgress && !errorProgress && (
              <ProgressSummary {...progressSummaryProps} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Index;
