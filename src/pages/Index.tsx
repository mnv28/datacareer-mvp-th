
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import FilterBar from '@/components/questions/FilterBar';
import QuestionList from '@/components/questions/QuestionList';
import ProgressSummary from '@/components/questions/ProgressSummary';

// Mock data
const mockCompanies = [
  {
    id: 1,
    name: 'Amazon',
    domain: 'E-Commerce',
    questions: [
      {
        id: 101,
        title: 'Customer Order Analysis',
        type: 'SQL' as const,
        difficulty: 'Intermediate' as const,
        status: 'Solved' as const,
        topic: 'Data Analysis'
      },
      {
        id: 102,
        title: 'Product Category Metrics',
        type: 'PostgreSQL' as const,
        difficulty: 'Advanced' as const,
        status: 'Unattempted' as const,
        topic: 'Window Functions'
      },
      {
        id: 103,
        title: 'Delivery Time Optimization',
        type: 'SQL' as const,
        difficulty: 'Beginner' as const,
        status: 'Wrong' as const,
        topic: 'Joins'
      }
    ]
  },
  {
    id: 2,
    name: 'Google',
    domain: 'Technology',
    questions: [
      {
        id: 201,
        title: 'Search Query Analysis',
        type: 'SQL' as const,
        difficulty: 'Advanced' as const,
        status: 'Unattempted' as const,
        topic: 'Window Functions'
      },
      {
        id: 202,
        title: 'User Session Analysis',
        type: 'SQL' as const,
        difficulty: 'Intermediate' as const,
        status: 'Solved' as const,
        topic: 'Data Analysis'
      }
    ]
  },
  {
    id: 3,
    name: 'Microsoft',
    domain: 'Technology',
    questions: [
      {
        id: 301,
        title: 'Azure Usage Metrics',
        type: 'PostgreSQL' as const,
        difficulty: 'Intermediate' as const,
        status: 'Unattempted' as const,
        topic: 'Data Analysis'
      },
      {
        id: 302,
        title: 'Office License Tracking',
        type: 'SQL' as const,
        difficulty: 'Beginner' as const,
        status: 'Solved' as const,
        topic: 'Joins'
      },
      {
        id: 303,
        title: 'Game Pass Subscriber Analysis',
        type: 'SQL' as const,
        difficulty: 'Beginner' as const,
        status: 'Solved' as const,
        topic: 'Data Manipulation'
      }
    ]
  },
  {
    id: 4,
    name: 'Meta',
    domain: 'Social Media',
    questions: [
      {
        id: 401,
        title: 'Friend Recommendation Algorithm',
        type: 'SQL' as const,
        difficulty: 'Advanced' as const,
        status: 'Wrong' as const,
        topic: 'Graph Analysis'
      },
      {
        id: 402,
        title: 'User Engagement Metrics',
        type: 'PostgreSQL' as const,
        difficulty: 'Intermediate' as const,
        status: 'Solved' as const,
        topic: 'Data Analysis'
      },
      {
        id: 403,
        title: 'Ad Campaign Performance',
        type: 'SQL' as const,
        difficulty: 'Intermediate' as const,
        status: 'Unattempted' as const,
        topic: 'Data Analysis'
      },
      {
        id: 404,
        title: 'Content Moderation Efficiency',
        type: 'SQL' as const,
        difficulty: 'Beginner' as const,
        status: 'Solved' as const,
        topic: 'Data Manipulation'
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
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [status, setStatus] = useState('all');
  
  // Apply filters
  const filteredCompanies = mockCompanies
    .map(company => {
      // Filter questions based on search, category, difficulty and status
      const filteredQuestions = company.questions.filter(question => {
        const matchesSearch = 
          searchQuery === '' || 
          question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.name.toLowerCase().includes(searchQuery.toLowerCase());
          
        const matchesCategory = 
          category === 'all' || 
          question.topic.toLowerCase().includes(category.toLowerCase());
          
        const matchesDifficulty = 
          difficulty === 'all' || 
          question.difficulty.toLowerCase() === difficulty.toLowerCase();
          
        const matchesStatus = 
          status === 'all' || 
          question.status.toLowerCase() === status.toLowerCase();
          
        return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
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
              category={category}
              setCategory={setCategory}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              status={status}
              setStatus={setStatus}
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
