import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import FilterBar from '@/components/questions/FilterBar';
import QuestionList from '@/components/questions/QuestionList';
import ProgressSummary from '@/components/questions/ProgressSummary';

interface Question {
  id: number;
  title: string;
  type: 'SQL' | 'PostgreSQL';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Solved' | 'Wrong' | 'Unattempted';
  topic: string;
  isPaid: boolean;
}

interface Company {
  id: number;
  name: string;
  domains: string[];
  questions: Question[];
}

// Mock data
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

// Calculate the progress data
const calculateProgressData = (companies: typeof mockCompanies) => {
  let total = 0;
  let solved = 0;
  let beginner = 0;
  let intermediate = 0;
  let advanced = 0;
  let beginnerSolved = 0;
  let intermediateSolved = 0;
  let advancedSolved = 0;

  companies.forEach(company => {
    company.questions.forEach(question => {
      total++;
      if (question.status === 'Solved') solved++;
      
      if (question.difficulty === 'Beginner') {
        beginner++;
        if (question.status === 'Solved') beginnerSolved++;
      } else if (question.difficulty === 'Intermediate') {
        intermediate++;
        if (question.status === 'Solved') intermediateSolved++;
      } else if (question.difficulty === 'Advanced') {
        advanced++;
        if (question.status === 'Solved') advancedSolved++;
      }
    });
  });

  return {
    total,
    solved,
    beginner,
    intermediate,
    advanced,
    beginnerSolved,
    intermediateSolved,
    advancedSolved
  };
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  
  // Apply filters
  const filteredCompanies = mockCompanies
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
    
  const progressData = calculateProgressData(mockCompanies);

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
            
            <QuestionList companies={filteredCompanies} />
          </div>
          
          <div className="lg:col-span-1">
            <ProgressSummary {...progressData} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
