import React from 'react';
import DOMPurify from 'dompurify';

interface QuestionContentProps {
  content: string;
}

const QuestionContent: React.FC<QuestionContentProps> = ({ content }) => {
  // Sanitize the HTML content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <div 
      className="prose max-w-none prose-headings:font-bold prose-headings:text-datacareer-darkBlue prose-p:text-gray-700 prose-strong:text-datacareer-darkBlue prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-700 prose-table:border prose-table:border-gray-200 prose-th:bg-gray-50 prose-th:p-2 prose-td:p-2 prose-td:border prose-td:border-gray-200"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default QuestionContent; 