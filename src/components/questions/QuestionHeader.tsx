import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface QuestionHeaderProps {
  title: string;
  company: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  previousId: number | null;
  nextId: number | null;
}

const getDifficultyColor = (difficulty: QuestionHeaderProps['difficulty']) => {
  switch (difficulty) {
    case 'Beginner':
      return 'text-difficulty-beginner';
    case 'Intermediate':
      return 'text-difficulty-intermediate';
    case 'Advanced':
      return 'text-difficulty-advanced';
  }
};

const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  title,
  company,
  topic,
  difficulty,
  previousId,
  nextId
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex flex-col md:flex-row justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-medium text-datacareer-darkBlue">{title}</h1>
          <div className="flex items-center flex-wrap mt-2 gap-2">
            <span className="text-sm bg-datacareer-skyBlue/20 text-datacareer-blue px-2 py-0.5 rounded">
              {company}
            </span>
            <span className="text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
              {topic}
            </span>
            <span className={`text-sm font-medium ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Link to={previousId ? `/question/${previousId}` : '#'}>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              disabled={!previousId}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
          </Link>
          
          <Link to={nextId ? `/question/${nextId}` : '#'}>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              disabled={!nextId}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuestionHeader;
