
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Check, X, Minus } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Question {
  id: number;
  title: string;
  type: 'SQL' | 'PostgreSQL';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Solved' | 'Wrong' | 'Unattempted';
  topic: string;
}

interface Company {
  id: number;
  name: string;
  domain: string;
  questions: Question[];
}

interface QuestionListProps {
  companies: Company[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Solved':
      return <Check className="h-4 w-4 text-status-solved" />;
    case 'Wrong':
      return <X className="h-4 w-4 text-status-wrong" />;
    case 'Unattempted':
      return <Minus className="h-4 w-4 text-status-unattempted" />;
    default:
      return <Minus className="h-4 w-4 text-status-unattempted" />;
  }
};

const getDifficultyBadgeClass = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-difficulty-beginner/10 text-difficulty-beginner border-difficulty-beginner/30';
    case 'Intermediate':
      return 'bg-difficulty-intermediate/10 text-difficulty-intermediate border-difficulty-intermediate/30';
    case 'Advanced':
      return 'bg-difficulty-advanced/10 text-difficulty-advanced border-difficulty-advanced/30';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
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
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between w-full text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-datacareer-darkBlue">{company.name}</span>
                  <span className="text-xs bg-datacareer-skyBlue/20 text-datacareer-blue px-2 py-0.5 rounded-full">
                    {company.questions.length} questions
                  </span>
                </div>
                <div className="flex items-center mt-1 md:mt-0">
                  <span className="text-xs text-gray-500 mr-3">{company.domain}</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {company.questions.filter(q => q.status === 'Solved').length} solved
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-1">
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
