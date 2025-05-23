import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Check, X, Minus } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CompanyLogo } from '@/components/CompanyLogo';
import './QuestionList.css';

export interface Question {
  id: number;
  title: string;
  type: 'SQL' | 'PostgreSQL';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Solved' | 'Wrong' | 'Unattempted';
  topic: string;
  isPaid: boolean;
}

export interface Company {
  id: number;
  name: string;
  domains: string[];
  questions: Question[];
  logo?: string;
}

interface QuestionListProps {
  companies: Company[];
}

const getStatusIcon = (status: Question['status']) => {
  switch (status) {
    case 'Solved':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'Wrong':
      return <X className="h-4 w-4 text-red-500" />;
    case 'Unattempted':
      return <Minus className="h-4 w-4 text-gray-400" />;
  }
};

const getDifficultyBadgeClass = (difficulty: Question['difficulty']) => {
  switch (difficulty) {
    case 'Beginner':
      return 'border-green-200 bg-green-50 text-green-700';
    case 'Intermediate':
      return 'border-yellow-200 bg-yellow-50 text-yellow-700';
    case 'Advanced':
      return 'border-red-200 bg-red-50 text-red-700';
  }
};

const QuestionList: React.FC<QuestionListProps> = ({ companies }) => {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <Accordion type="multiple" className="w-full">
        {companies.map((company) => (
          <AccordionItem 
            key={company.id}
            value={`company-${company.id}`}
            className="border-b last:border-b-0"
          >
            <AccordionTrigger 
              className="px-4 py-3 hover:bg-gray-50 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between w-full text-left">
                <div className="flex items-center space-x-3">
                  <CompanyLogo 
                    name={company.name} 
                    size="sm" 
                    logo={company.logo} 
                  />
                  <div>
                    <span className="font-medium text-datacareer-darkBlue hover:text-datacareer-orange company-name">
                      {company.name}
                    </span>
                    <span className="text-xs bg-datacareer-skyBlue/20 text-datacareer-blue px-2 py-0.5 rounded-full ml-2 no-underline hover:no-underline decoration-none hover:decoration-none">
                      {company.questions.length} questions
                    </span>
                  </div>
                </div>
                <div className="flex items-center mt-1 md:mt-0">
                  <div className="flex flex-wrap gap-1 mr-3">
                    {company.domains.map((domain, index) => (
                      <span key={index} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full no-underline hover:no-underline decoration-none hover:decoration-none domain-badge">
                        {domain}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full no-underline hover:no-underline decoration-none hover:decoration-none">
                    {company.questions.filter(q => q.status === 'Solved').length} solved
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="divide-y divide-gray-100">
                {company.questions.map((question) => (
                  <Link
                    key={question.id}
                    to={`/question/${question.id}`}
                    className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="mr-3">
                        {getStatusIcon(question.status)}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-datacareer-darkBlue hover:text-datacareer-orange">
                          {question.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">{question.topic}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 md:mt-0 ml-7 md:ml-0">
                      <span className="text-xs px-2 py-0.5 border rounded">
                        {question.type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 border rounded ${getDifficultyBadgeClass(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      {/* Paid/Free badge */}
                      {question.isPaid ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 font-semibold ml-2">Paid</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300 font-semibold ml-2">Free</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default QuestionList;
