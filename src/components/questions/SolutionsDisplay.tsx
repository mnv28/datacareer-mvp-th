import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SolutionsDisplayProps {
  solution: string;
}

const SolutionsDisplay: React.FC<SolutionsDisplayProps> = ({ solution }) => {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{solution}</ReactMarkdown>
    </div>
  );
};

export default SolutionsDisplay;
