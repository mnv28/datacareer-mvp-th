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
export const mockCompanies = [
  {
    id: 1,
    name: 'Amazon',
    domains: ['E-Commerce', 'Cloud Computing', 'Retail Analytics', 'Customer Analytics'],
    questions: [
      {
        id: 101,
        title: 'Customer Order Analysis',
        type: 'SQL' as const,
        difficulty: 'Intermediate' as const,
        status: 'Solved' as const,
        topic: 'Data Analysis',
        isPaid: false
      },
      {
        id: 102,
        title: 'Product Category Metrics',
        type: 'PostgreSQL' as const,
        difficulty: 'Advanced' as const,
        status: 'Unattempted' as const,
        topic: 'Window Functions',
        isPaid: true
      },
      {
        id: 103,
        title: 'Delivery Time Optimization',
        type: 'SQL' as const,
        difficulty: 'Beginner' as const,
        status: 'Wrong' as const,
        topic: 'Joins',
        isPaid: false
      }
    ]
  },
  {
    id: 2,
    name: 'Google',
    domains: ['Technology', 'Search Analytics', 'Cloud Computing', 'AI/ML'],
    questions: [
      {
        id: 201,
        title: 'Search Query Analysis',
        type: 'SQL' as const,
        difficulty: 'Advanced' as const,
        status: 'Unattempted' as const,
        topic: 'Window Functions',
        isPaid: true
      },
      {
        id: 202,
        title: 'User Session Analysis',
        type: 'SQL' as const,
        difficulty: 'Intermediate' as const,
        status: 'Solved' as const,
        topic: 'Data Analysis',
        isPaid: false
      }
    ]
  },
  {
    id: 3,
    name: 'Microsoft',
    domains: ['Technology', 'Cloud Computing', 'Enterprise Software', 'Gaming Analytics'],
    questions: [
      {
        id: 301,
        title: 'Azure Usage Metrics',
        type: 'PostgreSQL' as const,
        difficulty: 'Intermediate' as const,
        status: 'Unattempted' as const,
        topic: 'Data Analysis',
        isPaid: false
      },
      {
        id: 302,
        title: 'Office License Tracking',
        type: 'SQL' as const,
        difficulty: 'Beginner' as const,
        status: 'Solved' as const,
        topic: 'Joins',
        isPaid: true
      },
      {
        id: 303,
        title: 'Game Pass Subscriber Analysis',
        type: 'SQL' as const,
        difficulty: 'Beginner' as const,
        status: 'Solved' as const,
        topic: 'Data Manipulation',
        isPaid: false
      }
    ]
  },
  {
    id: 4,
    name: 'Meta',
    domains: ['Social Media', 'Digital Advertising', 'User Analytics', 'Content Moderation'],
    questions: [
      {
        id: 401,
        title: 'Friend Recommendation Algorithm',
        type: 'SQL' as const,
        difficulty: 'Advanced' as const,
        status: 'Wrong' as const,
        topic: 'Graph Analysis',
        isPaid: true
      },
      {
        id: 402,
        title: 'User Engagement Metrics',
        type: 'PostgreSQL' as const,
        difficulty: 'Intermediate' as const,
        status: 'Solved' as const,
        topic: 'Data Analysis',
        isPaid: false
      },
      {
        id: 403,
        title: 'Ad Campaign Performance',
        type: 'SQL' as const,
        difficulty: 'Intermediate' as const,
        status: 'Unattempted' as const,
        topic: 'Data Analysis',
        isPaid: false
      },
      {
        id: 404,
        title: 'Content Moderation Efficiency',
        type: 'SQL' as const,
        difficulty: 'Beginner' as const,
        status: 'Solved' as const,
        topic: 'Data Manipulation',
        isPaid: true
      }
    ]
  }
];

function Index() {
  const [companies, setCompanies] = useState<Company[]>([]);
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
  });
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [errorProgress, setErrorProgress] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  
  // Fetch companies data
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiInstance.get('/api/question/filterbycompany', {
          params: {
            search: '',
            topicId: '',
            companyId: '',
            domainId: '',
            difficulty: '',
            variant: '[MySQL]'
          }
        });

        const data = response.data;

        const transformedCompanies: Company[] = data.companies.map((company) => ({
          id: company.id,
          name: company.name,
          domains: company.CompanyDomains.map((cd) => cd.Domain.name),
          questions: company.questions.map((question) => ({
            id: question.id,
            title: question.title,
            type: (question.dbType === 'MySQL' ? 'SQL' : question.dbType) as 'SQL' | 'PostgreSQL',
            difficulty: (question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)) as 'Beginner' | 'Intermediate' | 'Advanced',
            status: 'Unattempted' as 'Solved' | 'Wrong' | 'Unattempted',
            topic: question.topic.name,
            isPaid: false
          })),
        }));

        setCompanies(transformedCompanies);
      } catch (e) {
        setErrorCompanies(e.message);
        console.error("Fetching companies failed:", e);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch user progress data
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await apiInstance.get('/api/question/getUserProgress');
        setProgressData(response.data.progress);
      } catch (e) {
        setErrorProgress(e.message);
        console.error("Fetching progress failed:", e);
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
          selectedCompanies.includes(company.name);
          
        const matchesTopic = 
          selectedTopics.length === 0 || 
          selectedTopics.includes(question.topic);
          
        const matchesDomain = 
          selectedDomains.length === 0 || 
          company.domains.some(domain => selectedDomains.includes(domain));
          
        const matchesDifficulty = 
          selectedDifficulties.length === 0 || 
          selectedDifficulties.includes(question.difficulty);
          
        const matchesVariant = 
          selectedVariants.length === 0 || 
          selectedVariants.includes(question.type);
          
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
  };

  const handleClearAll = () => {
    setSelectedCompanies([]);
    setSelectedTopics([]);
    setSelectedDomains([]);
    setSelectedDifficulties([]);
    setSelectedVariants([]);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-datacareer-darkBlue mb-2">SQL Interview Questions</h1>
          <p className="text-gray-600">
            Practice SQL interview questions from top tech companies
          </p>
        </div>
        
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
            />
            
            {loadingCompanies && <p>Loading companies...</p>}
            {errorCompanies && <p className="text-red-500">Error loading companies: {errorCompanies}</p>}
            {!loadingCompanies && !errorCompanies && (filteredCompanies.length > 0 ? (
              <QuestionList companies={filteredCompanies} />
            ) : (
              <p>No companies found matching your criteria.</p>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            {loadingProgress && <p>Loading progress...</p>}
            {errorProgress && <p className="text-red-500">Error loading progress: {errorProgress}</p>}
            {!loadingProgress && !errorProgress && (
              <ProgressSummary {...progressSummaryProps} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Index;
