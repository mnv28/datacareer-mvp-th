// import React from 'react';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
// import DOMPurify from 'dompurify';

// interface SolutionsDisplayProps {
//   solution: string;
// }

// const SolutionsDisplay: React.FC<SolutionsDisplayProps> = ({ solution }) => {
//    const sanitizedContent = DOMPurify.sanitize(solution);
//   return (
//     <div 
//     className="prose max-w-none prose-headings:font-bold prose-headings:text-datacareer-darkBlue prose-p:text-gray-700 prose-strong:text-datacareer-darkBlue prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-700 prose-table:border prose-table:border-gray-200 prose-th:bg-gray-50 prose-th:p-2 prose-td:p-2 prose-td:border prose-td:border-gray-200"
//     dangerouslySetInnerHTML={{ __html: sanitizedContent }}
//   />

//   );
// };

// export default SolutionsDisplay;
import React from 'react';
import DOMPurify from 'dompurify';

interface SolutionsDisplayProps {
  solution: string;
}

const SolutionsDisplay: React.FC<SolutionsDisplayProps> = ({ solution }) => {
  const sanitizedHTML = DOMPurify.sanitize(solution, { USE_PROFILES: { html: true } });

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        color: '#333',
        lineHeight: '1.6',
      }}
    >
      <style>
        {`
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f9f9f9;
            font-weight: bold;
          }
          strong {
            color: #1e3a8a; /* Like text-datacareer-darkBlue */
          }
        `}
      </style>

      <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
    </div>
  );
};

export default SolutionsDisplay;

